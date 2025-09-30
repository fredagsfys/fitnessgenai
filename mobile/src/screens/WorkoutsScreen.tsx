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
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {workoutService, exerciseService, programService, Workout, Exercise, Program, WorkoutType, WorkoutTypeInfo, getWorkoutTypeInfo} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useUser} from '../context/UserContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Popular workout type categories
const WORKOUT_TYPE_CATEGORIES = {
  'Strength': ['STRAIGHT_SETS', 'PYRAMID', 'REVERSE_PYRAMID', 'WAVE_LOADING', 'MAX_EFFORT', 'DYNAMIC_EFFORT'] as WorkoutType[],
  'Supersets': ['SUPERSETS', 'TRISETS', 'GIANT_SETS'] as WorkoutType[],
  'Circuits': ['CIRCUIT', 'CIRCUIT_REPS', 'CIRCUIT_TIME'] as WorkoutType[],
  'CrossFit': ['WOD', 'AMRAP', 'FOR_TIME', 'EMOM', 'EMOM_2', 'EMOM_3', 'DEATH_BY'] as WorkoutType[],
  'HIIT': ['HIIT', 'TABATA', 'INTERVAL_TRAINING'] as WorkoutType[],
  'Bodybuilding': ['DROP_SETS', 'REST_PAUSE', 'CLUSTER_SETS', 'MECHANICAL_DROP_SET', 'PRE_EXHAUSTION', 'POST_EXHAUSTION'] as WorkoutType[],
  'Endurance': ['STEADY_STATE', 'LISS', 'TEMPO_RUNS', 'FARTLEK'] as WorkoutType[],
  'Advanced': ['COMPLEX_TRAINING', 'CONTRAST_TRAINING', 'DENSITY_TRAINING', 'VOLUME_TRAINING', 'LADDER_SETS', 'LADDER_CLIMB'] as WorkoutType[],
  'Recovery': ['ACTIVE_RECOVERY', 'MOBILITY_SESSION'] as WorkoutType[],
};

const WorkoutsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {userId} = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    description: '',
    estimatedDurationMinutes: '',
  });

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      // Load both legacy workouts and advanced programs
      const [workoutsData, programsData] = await Promise.all([
        workoutService.getAllWorkouts().catch(() => []),
        programService.getAllPrograms().catch(() => []),
      ]);
      setWorkouts(workoutsData);
      setPrograms(programsData);
      filterWorkouts(workoutsData, selectedWorkoutType, searchQuery);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workouts');
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkouts = (
    workoutsList: Workout[],
    workoutType: WorkoutType | 'All',
    query: string
  ) => {
    let filtered = workoutsList;

    // Filter by workout type (for when backend supports it)
    // Currently using legacy API, so this is placeholder
    if (workoutType !== 'All') {
      // In future: filtered = filtered.filter(w => w.workoutType === workoutType);
    }

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredWorkouts(filtered);
  };

  const handleWorkoutTypeSelect = (type: WorkoutType | 'All') => {
    setSelectedWorkoutType(type);
    filterWorkouts(workouts, type, searchQuery);
    setFilterModalVisible(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterWorkouts(workouts, selectedWorkoutType, query);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const loadExercises = async () => {
    try {
      const exercises = await exerciseService.getAllExercises();
      setAllExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const filterExercisesList = (query: string) => {
    setExerciseSearchQuery(query);
    if (query.trim()) {
      const filtered = allExercises.filter(ex =>
        ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.primaryMuscle?.toLowerCase().includes(query.toLowerCase()) ||
        ex.equipment?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises(allExercises);
    }
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const openCreateModal = async () => {
    setEditingWorkout(null);
    setWorkoutForm({
      name: '',
      description: '',
      estimatedDurationMinutes: '',
    });
    setSelectedExercises([]);
    await loadExercises();
    setModalVisible(true);
  };

  const openEditModal = async (workout: Workout) => {
    setEditingWorkout(workout);
    setWorkoutForm({
      name: workout.name,
      description: workout.description || '',
      estimatedDurationMinutes: workout.estimatedDurationMinutes?.toString() || '',
    });
    setSelectedExercises(workout.exercises?.map(ex => ex.id) || []);
    await loadExercises();
    setModalVisible(true);
  };

  const openExerciseModal = () => {
    setExerciseSearchQuery('');
    setFilteredExercises(allExercises);
    setExerciseModalVisible(true);
  };

  const handleSaveWorkout = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!workoutForm.name.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    try {
      const selectedExerciseObjects = allExercises.filter(ex => selectedExercises.includes(ex.id));

      const workoutData: Partial<Workout> = {
        userId: userId,
        name: workoutForm.name.trim(),
        description: workoutForm.description.trim() || undefined,
        estimatedDurationMinutes: workoutForm.estimatedDurationMinutes
          ? Number(workoutForm.estimatedDurationMinutes)
          : undefined,
        status: 'PLANNED' as const,
        exercises: selectedExerciseObjects,
      };

      if (editingWorkout) {
        await workoutService.updateWorkout(editingWorkout.id, workoutData);
        Alert.alert('Success', 'Workout updated successfully');
      } else {
        await workoutService.createWorkout(workoutData);
        Alert.alert('Success', 'Workout created successfully');
      }

      setModalVisible(false);
      loadWorkouts();
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
      console.error('Error saving workout:', error);
    }
  };

  const handleDeleteWorkout = (workout: Workout) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.deleteWorkout(workout.id);
              Alert.alert('Success', 'Workout deleted successfully');
              loadWorkouts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workout');
              console.error('Error deleting workout:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const renderWorkout = ({item}: {item: Workout}) => {
    // Show workout type badge if available (placeholder for when backend supports it)
    const typeInfo = getWorkoutTypeInfo('STRAIGHT_SETS'); // Default for now

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => navigation.navigate('WorkoutDetail', {workoutId: item.id})}
        activeOpacity={0.7}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{item.name}</Text>
            <View style={styles.workoutMeta}>
              <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              {item.estimatedDurationMinutes && (
                <View style={styles.durationBadge}>
                  <Icon name="schedule" size={14} color="#666" />
                  <Text style={styles.durationText}>{item.estimatedDurationMinutes}min</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.workoutActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Icon name="edit" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteWorkout(item)}
            >
              <Icon name="delete" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {item.description && (
          <Text style={styles.workoutDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.workoutFooter}>
          <Text style={styles.exerciseCount}>
            {item.exercises?.length || 0} exercises
          </Text>
          {item.createdAt && (
            <Text style={styles.dateText}>
              Created {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('WorkoutBuilder')}
        >
          <Icon name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>Create Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={20} color="#007AFF" />
          <Text style={styles.filterButtonText}>
            {selectedWorkoutType === 'All' ? 'All Types' : getWorkoutTypeInfo(selectedWorkoutType).displayName}
          </Text>
          <Icon name="expand-more" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {programs.length + filteredWorkouts.length} Total Workouts
        </Text>
      </View>

      {/* Programs Section */}
      {programs.length > 0 && (
        <View style={styles.programsSection}>
          <Text style={styles.programsSectionTitle}>Advanced Workouts</Text>
          {programs.map(program => (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              onPress={() => navigation.navigate('ProgramDetail', {programId: program.id})}
              activeOpacity={0.7}
            >
              <View style={styles.programHeader}>
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{program.title}</Text>
                  <Text style={styles.programMeta}>
                    {program.sessions?.length || 0} sessions • {program.totalWeeks} weeks
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert(
                      'Delete Program',
                      `Delete "${program.title}"?`,
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await programService.deleteProgram(program.id);
                              loadWorkouts();
                            } catch (error) {
                              Alert.alert('Error', 'Failed to delete');
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Icon name="delete" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Legacy Workout List */}
      {filteredWorkouts.length > 0 && (
        <Text style={[styles.programsSectionTitle, {paddingHorizontal: 16}]}>
          Simple Workouts (Legacy)
        </Text>
      )}
      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkout}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.workoutsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="fitness-center" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No workouts found</Text>
            <TouchableOpacity style={styles.createFirstButton} onPress={openCreateModal}>
              <Text style={styles.createFirstButtonText}>Create your first workout</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingWorkout ? 'Edit Workout' : 'Create Workout'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Workout name"
              value={workoutForm.name}
              onChangeText={text => setWorkoutForm({...workoutForm, name: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={workoutForm.description}
              onChangeText={text => setWorkoutForm({...workoutForm, description: text})}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Duration (minutes)"
              value={workoutForm.estimatedDurationMinutes}
              onChangeText={text => setWorkoutForm({...workoutForm, estimatedDurationMinutes: text})}
              keyboardType="numeric"
            />

            {/* Exercises Section */}
            <View style={styles.exercisesSection}>
              <View style={styles.exercisesSectionHeader}>
                <Text style={styles.exercisesSectionTitle}>
                  Exercises ({selectedExercises.length})
                </Text>
                <TouchableOpacity
                  style={styles.addExercisesButton}
                  onPress={openExerciseModal}
                >
                  <Icon name="add" size={18} color="#007AFF" />
                  <Text style={styles.addExercisesText}>Add Exercises</Text>
                </TouchableOpacity>
              </View>

              {selectedExercises.length > 0 ? (
                <ScrollView style={styles.selectedExercisesList} nestedScrollEnabled>
                  {selectedExercises.map((exerciseId) => {
                    const exercise = allExercises.find(ex => ex.id === exerciseId);
                    if (!exercise) return null;
                    return (
                      <View key={exerciseId} style={styles.selectedExerciseItem}>
                        <View style={styles.selectedExerciseIcon}>
                          <Icon name="fitness-center" size={16} color="#007AFF" />
                        </View>
                        <Text style={styles.selectedExerciseName} numberOfLines={1}>
                          {exercise.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => toggleExerciseSelection(exerciseId)}
                          style={styles.removeExerciseButton}
                        >
                          <Icon name="close" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text style={styles.noExercisesText}>
                  No exercises added yet. Tap "Add Exercises" to get started.
                </Text>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveWorkout}
              >
                <Text style={styles.saveButtonText}>
                  {editingWorkout ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.filterModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Workout Types</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TouchableOpacity
                style={[styles.filterOption, selectedWorkoutType === 'All' && styles.filterOptionSelected]}
                onPress={() => handleWorkoutTypeSelect('All')}
              >
                <View style={[styles.filterIcon, {backgroundColor: '#007AFF'}]}>
                  <Icon name="select-all" size={24} color="white" />
                </View>
                <View style={styles.filterInfo}>
                  <Text style={styles.filterOptionText}>All Types</Text>
                  <Text style={styles.filterOptionDesc}>Show all workouts</Text>
                </View>
                {selectedWorkoutType === 'All' && (
                  <Icon name="check-circle" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>

              {Object.entries(WORKOUT_TYPE_CATEGORIES).map(([category, types]) => (
                <View key={category}>
                  <Text style={styles.categoryHeader}>{category}</Text>
                  {types.map((type) => {
                    const info = getWorkoutTypeInfo(type);
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[styles.filterOption, selectedWorkoutType === type && styles.filterOptionSelected]}
                        onPress={() => handleWorkoutTypeSelect(type)}
                      >
                        <View style={[styles.filterIcon, {backgroundColor: info.color}]}>
                          <Icon name={info.icon} size={20} color="white" />
                        </View>
                        <View style={styles.filterInfo}>
                          <Text style={styles.filterOptionText}>{info.displayName}</Text>
                          <Text style={styles.filterOptionDesc}>{info.description}</Text>
                        </View>
                        {selectedWorkoutType === type && (
                          <Icon name="check-circle" size={24} color="#007AFF" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Exercise Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exerciseModalVisible}
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.filterModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Exercises ({selectedExercises.length})
              </Text>
              <TouchableOpacity
                onPress={() => setExerciseModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.exerciseSearchContainer}>
              <Icon name="search" size={20} color="#666" />
              <TextInput
                style={styles.exerciseSearchInput}
                placeholder="Search exercises..."
                value={exerciseSearchQuery}
                onChangeText={filterExercisesList}
                placeholderTextColor="#999"
              />
              {exerciseSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => filterExercisesList('')}>
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {/* Exercise List */}
            <FlatList
              data={filteredExercises}
              keyExtractor={item => item.id}
              renderItem={({item}) => {
                const isSelected = selectedExercises.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.exerciseOption, isSelected && styles.exerciseOptionSelected]}
                    onPress={() => toggleExerciseSelection(item.id)}
                  >
                    <View style={[styles.exerciseOptionIcon, {backgroundColor: isSelected ? '#007AFF' : '#F5F5F5'}]}>
                      <Icon name="fitness-center" size={20} color={isSelected ? 'white' : '#666'} />
                    </View>
                    <View style={styles.exerciseOptionInfo}>
                      <Text style={styles.exerciseOptionName}>{item.name}</Text>
                      <View style={styles.exerciseOptionMeta}>
                        {item.primaryMuscle && (
                          <Text style={styles.exerciseOptionMetaText}>{item.primaryMuscle}</Text>
                        )}
                        {item.equipment && (
                          <>
                            <Text style={styles.exerciseOptionMetaText}>•</Text>
                            <Text style={styles.exerciseOptionMetaText}>{item.equipment}</Text>
                          </>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <Icon name="check-circle" size={24} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyExerciseList}>
                  <Icon name="search-off" size={48} color="#ccc" />
                  <Text style={styles.emptyExerciseText}>No exercises found</Text>
                </View>
              }
            />

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setExerciseModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>
                Done ({selectedExercises.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workoutsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  workoutCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPLANNED: {
    backgroundColor: '#E3F2FD',
  },
  statusIN_PROGRESS: {
    backgroundColor: '#FFF3E0',
  },
  statusCOMPLETED: {
    backgroundColor: '#E8F5E9',
  },
  statusCANCELLED: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  workoutActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  exerciseCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
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
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '70%',
  },
  filterModalContent: {
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
  categoryHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  filterOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  filterInfo: {
    flex: 1,
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  filterOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
  // Exercises Section in Create Modal
  exercisesSection: {
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  exercisesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exercisesSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addExercisesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addExercisesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  selectedExercisesList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    padding: 8,
  },
  selectedExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  selectedExerciseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedExerciseName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  removeExerciseButton: {
    padding: 4,
  },
  noExercisesText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  // Exercise Selection Modal
  exerciseSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  exerciseSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  exerciseOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  exerciseOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseOptionInfo: {
    flex: 1,
  },
  exerciseOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  exerciseOptionMeta: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  exerciseOptionMetaText: {
    fontSize: 12,
    color: '#666',
  },
  emptyExerciseList: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyExerciseText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  // Programs Section
  programsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  programsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  programCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  programMeta: {
    fontSize: 13,
    color: '#666',
  },
});

export default WorkoutsScreen;
