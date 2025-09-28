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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {workoutService, Workout} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const WorkoutsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
  });

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const workoutsData = await workoutService.getAllWorkouts();
      setWorkouts(workoutsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workouts');
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingWorkout(null);
    setWorkoutForm({
      name: '',
      description: '',
      duration: '',
      difficulty: 'Beginner',
    });
    setModalVisible(true);
  };

  const openEditModal = (workout: Workout) => {
    setEditingWorkout(workout);
    setWorkoutForm({
      name: workout.name,
      description: workout.description,
      duration: workout.duration.toString(),
      difficulty: workout.difficulty,
    });
    setModalVisible(true);
  };

  const handleSaveWorkout = async () => {
    if (!workoutForm.name.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (!workoutForm.duration.trim() || isNaN(Number(workoutForm.duration))) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    try {
      const workoutData = {
        name: workoutForm.name.trim(),
        description: workoutForm.description.trim(),
        duration: Number(workoutForm.duration),
        difficulty: workoutForm.difficulty,
        exercises: editingWorkout?.exercises || [],
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

  const renderWorkout = ({item}: {item: Workout}) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetail', {workoutId: item.id})}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{item.name}</Text>
          <Text style={styles.workoutDifficulty}>{item.difficulty}</Text>
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

      <Text style={styles.workoutDuration}>{item.duration} minutes</Text>

      {item.description && (
        <Text style={styles.workoutDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <Text style={styles.exerciseCount}>
        {item.exercises?.length || 0} exercises
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={item => item.id.toString()}
        style={styles.workoutsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
              value={workoutForm.duration}
              onChangeText={text => setWorkoutForm({...workoutForm, duration: text})}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Difficulty Level</Text>
            <View style={styles.difficultyContainer}>
              {difficulties.map(difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyButton,
                    workoutForm.difficulty === difficulty && styles.selectedDifficultyButton,
                  ]}
                  onPress={() => setWorkoutForm({...workoutForm, difficulty})}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      workoutForm.difficulty === difficulty && styles.selectedDifficultyButtonText,
                    ]}
                  >
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ))}
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
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  workoutsList: {
    flex: 1,
  },
  workoutCard: {
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
    color: '#333',
    marginBottom: 4,
  },
  workoutDifficulty: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  workoutActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  workoutDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 8,
  },
  exerciseCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedDifficultyButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  difficultyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDifficultyButtonText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default WorkoutsScreen;