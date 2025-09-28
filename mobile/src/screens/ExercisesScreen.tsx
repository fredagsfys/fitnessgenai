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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {exerciseService, Exercise} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ExercisesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');

  const loadExercises = async () => {
    try {
      setLoading(true);
      const exercisesData = await exerciseService.getAllExercises();
      const muscleGroupsData = await exerciseService.getMuscleGroups();
      setExercises(exercisesData);
      setMuscleGroups(muscleGroupsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load exercises');
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExercisesByMuscleGroup = async (muscleGroup: string) => {
    try {
      setLoading(true);
      const exercisesData = await exerciseService.getExercisesByMuscleGroup(muscleGroup);
      setExercises(exercisesData);
      setSelectedMuscleGroup(muscleGroup);
    } catch (error) {
      Alert.alert('Error', 'Failed to load exercises');
      console.error('Error loading exercises by muscle group:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setSelectedMuscleGroup('');
    setRefreshing(false);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const renderExercise = ({item}: {item: Exercise}) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('ExerciseDetail', {exerciseId: item.id})}
    >
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseCategory}>{item.category}</Text>
      <Text style={styles.exerciseMuscleGroup}>Target: {item.muscleGroup}</Text>
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
      onPress={() => loadExercisesByMuscleGroup(item)}>
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
      <View style={styles.header}>
        <Text style={styles.title}>Exercises</Text>
        <TouchableOpacity style={styles.allButton} onPress={onRefresh}>
          <Text style={styles.allButtonText}>All</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Filter by Muscle Group</Text>
      <FlatList
        data={muscleGroups}
        renderItem={renderMuscleGroup}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.muscleGroupList}
        contentContainerStyle={styles.muscleGroupContent}
      />

      <FlatList
        data={exercises}
        renderItem={renderExercise}
        keyExtractor={item => item.id.toString()}
        style={styles.exercisesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  allButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  allButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  muscleGroupList: {
    marginBottom: 20,
  },
  muscleGroupContent: {
    paddingRight: 16,
  },
  muscleGroupChip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedMuscleGroupChip: {
    backgroundColor: '#007AFF',
  },
  muscleGroupText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedMuscleGroupText: {
    color: 'white',
  },
  exercisesList: {
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseMuscleGroup: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ExercisesScreen;