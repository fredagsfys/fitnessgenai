import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {progressService, userService, workoutService, UserProgress, User, Workout} from '../services/api';

const ProgressScreen = () => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progressForm, setProgressForm] = useState({
    userId: '',
    workoutId: '',
    duration: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, workoutsData] = await Promise.all([
        userService.getAllUsers(),
        workoutService.getAllWorkouts(),
      ]);

      setUsers(usersData);
      setWorkouts(workoutsData);

      if (usersData.length > 0) {
        const progressData = await progressService.getUserProgress(usersData[0].id);
        setProgress(progressData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load progress data');
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setProgressForm({
      userId: users.length > 0 ? users[0].id.toString() : '',
      workoutId: '',
      duration: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const handleSaveProgress = async () => {
    if (!progressForm.userId || !progressForm.workoutId || !progressForm.duration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(Number(progressForm.duration))) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    try {
      const progressData = {
        userId: Number(progressForm.userId),
        workoutId: Number(progressForm.workoutId),
        duration: Number(progressForm.duration),
        completedAt: new Date().toISOString(),
        notes: progressForm.notes.trim(),
      };

      await progressService.createProgress(progressData);
      Alert.alert('Success', 'Progress recorded successfully');
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save progress');
      console.error('Error saving progress:', error);
    }
  };

  const handleDeleteProgress = (progressItem: UserProgress) => {
    Alert.alert(
      'Delete Progress',
      'Are you sure you want to delete this progress entry?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await progressService.deleteProgress(progressItem.id);
              Alert.alert('Success', 'Progress deleted successfully');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete progress');
              console.error('Error deleting progress:', error);
            }
          },
        },
      ]
    );
  };

  const getWorkoutName = (workoutId: number) => {
    const workout = workouts.find(w => w.id === workoutId);
    return workout?.name || 'Unknown Workout';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const getTotalWorkouts = () => progress.length;
  const getTotalTime = () => progress.reduce((total, item) => total + item.duration, 0);
  const getAverageTime = () => {
    const total = getTotalTime();
    return progress.length > 0 ? Math.round(total / progress.length) : 0;
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderProgress = ({item}: {item: UserProgress}) => (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.workoutName}>{getWorkoutName(item.workoutId)}</Text>
          <Text style={styles.completedDate}>{formatDate(item.completedAt)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProgress(item)}
        >
          <Icon name="delete" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressDetails}>
        <View style={styles.detailItem}>
          <Icon name="schedule" size={16} color="#666" />
          <Text style={styles.detailText}>{item.duration} minutes</Text>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.progressNotes}>{item.notes}</Text>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getTotalWorkouts()}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getTotalTime()}</Text>
          <Text style={styles.statLabel}>Total Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getAverageTime()}</Text>
          <Text style={styles.statLabel}>Avg Minutes</Text>
        </View>
      </View>

      <FlatList
        data={progress}
        renderItem={renderProgress}
        keyExtractor={item => item.id.toString()}
        style={styles.progressList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="trending-up" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No progress recorded yet</Text>
            <TouchableOpacity style={styles.recordFirstButton} onPress={openCreateModal}>
              <Text style={styles.recordFirstButtonText}>Record your first workout</Text>
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
              <Text style={styles.modalTitle}>Record Progress</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Workout</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity style={styles.picker}>
                <Text style={styles.pickerText}>
                  {progressForm.workoutId ? getWorkoutName(Number(progressForm.workoutId)) : 'Select a workout'}
                </Text>
                <Icon name="expand-more" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.workoutsList}>Available Workouts:</Text>
            <FlatList
              data={workouts}
              keyExtractor={item => item.id.toString()}
              style={styles.workoutSelectList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.workoutOption,
                    progressForm.workoutId === item.id.toString() && styles.selectedWorkoutOption,
                  ]}
                  onPress={() => setProgressForm({...progressForm, workoutId: item.id.toString()})}
                >
                  <Text style={[
                    styles.workoutOptionText,
                    progressForm.workoutId === item.id.toString() && styles.selectedWorkoutOptionText,
                  ]}>
                    {item.name}
                  </Text>
                  {progressForm.workoutId === item.id.toString() && (
                    <Icon name="check" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
            />

            <TextInput
              style={styles.input}
              placeholder="Duration (minutes)"
              value={progressForm.duration}
              onChangeText={text => setProgressForm({...progressForm, duration: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes (optional)"
              value={progressForm.notes}
              onChangeText={text => setProgressForm({...progressForm, notes: text})}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProgress}
              >
                <Text style={styles.saveButtonText}>Record</Text>
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressList: {
    flex: 1,
  },
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  progressInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  progressDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  progressNotes: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
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
  recordFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  recordFirstButtonText: {
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  workoutsList: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  workoutSelectList: {
    maxHeight: 120,
    marginBottom: 16,
  },
  workoutOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedWorkoutOption: {
    backgroundColor: '#f0f8ff',
  },
  workoutOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedWorkoutOptionText: {
    color: '#007AFF',
    fontWeight: '600',
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

export default ProgressScreen;