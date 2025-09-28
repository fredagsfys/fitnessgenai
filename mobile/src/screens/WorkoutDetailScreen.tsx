import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {workoutService, Workout, Exercise} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

type WorkoutDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'WorkoutDetail'
>;
type WorkoutDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutDetail'
>;

type Props = {
  route: WorkoutDetailScreenRouteProp;
  navigation: WorkoutDetailScreenNavigationProp;
};

const WorkoutDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const {workoutId} = route.params;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const workoutData = await workoutService.getWorkoutById(workoutId);
      setWorkout(workoutData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout details');
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = () => {
    Alert.alert(
      'Start Workout',
      `Ready to start "${workout?.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Start',
          onPress: () => {
            Alert.alert('Workout Started', 'Workout tracking feature coming soon!');
          },
        },
      ]
    );
  };


  const renderExercise = ({item, index}: {item: Exercise; index: number}) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('ExerciseDetail', {exerciseId: item.id})}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseNumber}>{index + 1}</Text>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.exerciseCategory}>{item.category}</Text>
          <Text style={styles.exerciseMuscleGroup}>Target: {item.muscleGroup}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading workout details...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutName}>{workout.name}</Text>

          <View style={styles.workoutMeta}>
            <View style={styles.metaItem}>
              <Icon name="schedule" size={20} color="#666" />
              <Text style={styles.metaText}>{workout.duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="bar-chart" size={20} color="#666" />
              <Text style={styles.metaText}>{workout.difficulty}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="fitness-center" size={20} color="#666" />
              <Text style={styles.metaText}>
                {workout.exercises?.length || 0} exercises
              </Text>
            </View>
          </View>
        </View>

        {workout.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{workout.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workout.exercises && workout.exercises.length > 0 ? (
            <FlatList
              data={workout.exercises}
              renderItem={renderExercise}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyExercises}>
              <Icon name="fitness-center" size={48} color="#ccc" />
              <Text style={styles.emptyExercisesText}>
                No exercises in this workout yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
          <Icon name="play-arrow" size={24} color="white" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  workoutHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  workoutName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  exerciseCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 30,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  exerciseMuscleGroup: {
    fontSize: 12,
    color: '#666',
  },
  separator: {
    height: 8,
  },
  emptyExercises: {
    alignItems: 'center',
    padding: 40,
  },
  emptyExercisesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  actionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  startButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WorkoutDetailScreen;