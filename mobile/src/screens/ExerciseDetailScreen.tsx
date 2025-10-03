import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {exerciseService, Exercise, advancedWorkoutResultService, AdvancedWorkoutResult} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

const {width} = Dimensions.get('window');

type ExerciseDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'ExerciseDetail'
>;
type ExerciseDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ExerciseDetail'
>;

type Props = {
  route: ExerciseDetailScreenRouteProp;
  navigation: ExerciseDetailScreenNavigationProp;
};

const ExerciseDetailScreen: React.FC<Props> = ({route}) => {
  const navigation = useNavigation();
  const {exerciseId} = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState<AdvancedWorkoutResult[]>([]);

  useEffect(() => {
    loadExercise();
    loadHistory();
  }, [exerciseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadExercise = async () => {
    try {
      setLoading(true);
      const exerciseData = await exerciseService.getExerciseById(exerciseId);
      setExercise(exerciseData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load exercise details');
      console.error('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const hardcodedUserId = '00000000-0000-0000-0000-000000000001';
      const results = await advancedWorkoutResultService.getResultsByUser(hardcodedUserId);

      // Filter results that include this exercise
      const filtered = results.filter(r =>
        r.setResults?.some(set => set.exerciseId === exerciseId)
      );
      setWorkoutHistory(filtered.slice(0, 5));
    } catch (error) {
      console.error('Error loading exercise history:', error);
    }
  };

  // Calculate personal records
  const getPersonalRecords = () => {
    if (!exercise || workoutHistory.length === 0) return null;

    let maxWeight = 0;
    let maxReps = 0;
    let maxVolume = 0;
    let totalSets = 0;

    workoutHistory.forEach(result => {
      result.setResults?.forEach(set => {
        if (set.exerciseId === exerciseId) {
          totalSets++;
          if (set.weight && set.weight > maxWeight) maxWeight = set.weight;
          if (set.performedReps && set.performedReps > maxReps) maxReps = set.performedReps;
          const volume = (set.weight || 0) * (set.performedReps || 0);
          if (volume > maxVolume) maxVolume = volume;
        }
      });
    });

    return {maxWeight, maxReps, maxVolume, totalSets};
  };

  const records = getPersonalRecords();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={64} color="#ddd" />
          <Text style={styles.errorText}>Exercise not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getMuscleIcon = (muscle: string) => {
    const lower = muscle.toLowerCase();
    if (lower.includes('chest') || lower.includes('pectoralis')) return 'favorite';
    if (lower.includes('back') || lower.includes('latissimus')) return 'accessibility';
    if (lower.includes('shoulder') || lower.includes('deltoid')) return 'airline-seat-recline-normal';
    if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep')) return 'fitness-center';
    if (lower.includes('leg') || lower.includes('quadriceps') || lower.includes('hamstring')) return 'directions-run';
    if (lower.includes('core') || lower.includes('abs') || lower.includes('abdominal')) return 'center-focus-strong';
    return 'fitness-center';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="favorite-border" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Exercise Image/Video Placeholder */}
        {exercise.imageUrl ? (
          <Image source={{uri: exercise.imageUrl}} style={styles.exerciseImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name={getMuscleIcon(exercise.primaryMuscle || exercise.muscleGroup)} size={80} color="#ddd" />
          </View>
        )}

        {/* Exercise Name & Quick Info */}
        <View style={styles.headerSection}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.tagContainer}>
            <View style={[styles.tag, styles.categoryTag]}>
              <Icon name="label" size={14} color="#007AFF" />
              <Text style={styles.categoryTagText}>{exercise.category}</Text>
            </View>
            <View style={[styles.tag, styles.muscleTag]}>
              <Icon name={getMuscleIcon(exercise.primaryMuscle || exercise.muscleGroup)} size={14} color="#4CAF50" />
              <Text style={styles.muscleTagText}>{exercise.primaryMuscle || exercise.muscleGroup}</Text>
            </View>
            {exercise.equipment && (
              <View style={[styles.tag, styles.equipmentTag]}>
                <Icon name="build" size={14} color="#FF9F43" />
                <Text style={styles.equipmentTagText}>{exercise.equipment}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Personal Records */}
        {records && records.totalSets > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Personal Records</Text>
            <View style={styles.recordsGrid}>
              <View style={styles.recordCard}>
                <Icon name="fitness-center" size={24} color="#007AFF" />
                <Text style={styles.recordValue}>{records.maxWeight}kg</Text>
                <Text style={styles.recordLabel}>Max Weight</Text>
              </View>
              <View style={styles.recordCard}>
                <Icon name="repeat" size={24} color="#4CAF50" />
                <Text style={styles.recordValue}>{records.maxReps}</Text>
                <Text style={styles.recordLabel}>Max Reps</Text>
              </View>
              <View style={styles.recordCard}>
                <Icon name="trending-up" size={24} color="#9C27B0" />
                <Text style={styles.recordValue}>{Math.round(records.maxVolume)}</Text>
                <Text style={styles.recordLabel}>Max Volume</Text>
              </View>
              <View style={styles.recordCard}>
                <Icon name="list" size={24} color="#FF6B6B" />
                <Text style={styles.recordValue}>{records.totalSets}</Text>
                <Text style={styles.recordLabel}>Total Sets</Text>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        {exercise.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>{exercise.description}</Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        {exercise.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How To Perform</Text>
            <View style={styles.instructionsCard}>
              <Icon name="info-outline" size={24} color="#007AFF" style={styles.instructionIcon} />
              <Text style={styles.instructions}>{exercise.instructions}</Text>
            </View>
          </View>
        )}

        {/* Muscle Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Targeted Muscles</Text>
          <View style={styles.muscleCard}>
            <View style={styles.muscleRow}>
              <Icon name="radio-button-checked" size={20} color="#4CAF50" />
              <View style={styles.muscleInfo}>
                <Text style={styles.muscleLabel}>Primary</Text>
                <Text style={styles.muscleValue}>{exercise.primaryMuscle || exercise.muscleGroup}</Text>
              </View>
            </View>
            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
              <View style={styles.muscleRow}>
                <Icon name="radio-button-unchecked" size={20} color="#999" />
                <View style={styles.muscleInfo}>
                  <Text style={styles.muscleLabel}>Secondary</Text>
                  <Text style={styles.muscleValue}>{exercise.secondaryMuscles.join(', ')}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Recent History */}
        {workoutHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent History</Text>
              <Text style={styles.seeAllText}>Last {workoutHistory.length}</Text>
            </View>
            {workoutHistory.map((result, index) => {
              const exerciseSets = result.setResults?.filter(set => set.exerciseId === exerciseId) || [];
              const totalVolume = exerciseSets.reduce((sum, set) =>
                sum + (set.weight || 0) * (set.performedReps || 0), 0
              );

              return (
                <View key={result.id || index} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                    <View style={styles.historyStats}>
                      <View style={styles.historyStat}>
                        <Icon name="list" size={14} color="#666" />
                        <Text style={styles.historyStatText}>{exerciseSets.length} sets</Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Icon name="trending-up" size={14} color="#666" />
                        <Text style={styles.historyStatText}>{Math.round(totalVolume)}kg</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.setsContainer}>
                    {exerciseSets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setChip}>
                        <Text style={styles.setChipText}>
                          {set.weight}kg × {set.performedReps}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  exerciseImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryTag: {
    backgroundColor: '#E3F2FD',
  },
  categoryTagText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  muscleTag: {
    backgroundColor: '#E8F5E9',
  },
  muscleTagText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  equipmentTag: {
    backgroundColor: '#FFF3E0',
  },
  equipmentTagText: {
    color: '#FF9F43',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recordCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  recordValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  recordLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  instructionsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  instructionIcon: {
    marginTop: 2,
  },
  instructions: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  muscleCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  muscleInfo: {
    flex: 1,
  },
  muscleLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  muscleValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  historyStats: {
    flexDirection: 'row',
    gap: 12,
  },
  historyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyStatText: {
    fontSize: 12,
    color: '#666',
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setChip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  setChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  bottomPadding: {
    height: 40,
  },
});

export default ExerciseDetailScreen;