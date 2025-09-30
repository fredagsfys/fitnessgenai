import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {exerciseService, Exercise} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ExercisesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadExercises = async () => {
    try {
      setLoading(true);
      const exercisesData = await exerciseService.getAllExercises();
      const muscleGroupsData = await exerciseService.getMuscleGroups();
      setExercises(exercisesData);
      setFilteredExercises(exercisesData);
      setMuscleGroups(['All', ...muscleGroupsData]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load exercises');
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = (query: string, muscleGroup: string) => {
    let filtered = exercises;

    // Filter by muscle group
    if (muscleGroup && muscleGroup !== 'All') {
      filtered = filtered.filter(ex =>
        ex.primaryMuscle?.toLowerCase() === muscleGroup.toLowerCase()
      );
    }

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.description?.toLowerCase().includes(query.toLowerCase()) ||
        ex.primaryMuscle?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  const handleMuscleGroupSelect = (muscleGroup: string) => {
    setSelectedMuscleGroup(muscleGroup);
    filterExercises(searchQuery, muscleGroup);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterExercises(query, selectedMuscleGroup);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setSelectedMuscleGroup('');
    setSearchQuery('');
    setRefreshing(false);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const getEquipmentIcon = (equipment?: string) => {
    if (!equipment) return 'fitness-center';
    const eq = equipment.toLowerCase();
    if (eq.includes('barbell')) return 'sports';
    if (eq.includes('dumbbell')) return 'fitness-center';
    if (eq.includes('machine')) return 'settings';
    if (eq.includes('bodyweight') || eq === 'bodyweight') return 'accessibility';
    if (eq.includes('kettlebell')) return 'sports-handball';
    return 'fitness-center';
  };

  const renderExercise = ({item}: {item: Exercise}) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('ExerciseDetail', {exerciseId: item.id})}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseCardHeader}>
        <View style={styles.exerciseIconContainer}>
          <Icon name={getEquipmentIcon(item.equipment)} size={28} color="#007AFF" />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.exerciseMeta}>
            <View style={styles.metaItem}>
              <Icon name="accessibility-new" size={14} color="#666" />
              <Text style={styles.metaText}>{item.primaryMuscle || 'N/A'}</Text>
            </View>
            {item.equipment && (
              <View style={styles.metaItem}>
                <Icon name="inventory-2" size={14} color="#666" />
                <Text style={styles.metaText}>{item.equipment}</Text>
              </View>
            )}
          </View>
        </View>
        <Icon name="chevron-right" size={24} color="#ccc" />
      </View>
      {item.description && (
        <Text style={styles.exerciseDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderMuscleGroup = ({item}: {item: string}) => (
    <TouchableOpacity
      style={[
        styles.muscleGroupChip,
        selectedMuscleGroup === item && styles.selectedMuscleGroupChip,
      ]}
      onPress={() => handleMuscleGroupSelect(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.muscleGroupText,
          selectedMuscleGroup === item && styles.selectedMuscleGroupText,
        ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Muscle Group Filter */}
      <View style={styles.filterSection}>
        <FlatList
          data={muscleGroups}
          renderItem={renderMuscleGroup}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.muscleGroupContent}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercise' : 'Exercises'}
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.exercisesListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="fitness-center" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedMuscleGroup
                ? 'Try adjusting your filters'
                : 'Pull down to refresh'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  // Filter Section
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  muscleGroupContent: {
    paddingHorizontal: 16,
  },
  muscleGroupChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedMuscleGroupChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  muscleGroupText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedMuscleGroupText: {
    color: 'white',
  },
  // Results Header
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Exercise List
  exercisesListContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  exerciseCard: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
    marginTop: 12,
    paddingLeft: 68,
  },
  // Empty State
  emptyContainer: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ExercisesScreen;