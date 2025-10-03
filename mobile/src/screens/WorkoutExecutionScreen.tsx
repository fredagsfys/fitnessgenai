import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  WorkoutSession,
  ExerciseBlock,
  BlockItem,
  advancedWorkoutResultService,
  AdvancedWorkoutResult,
  SetResultSummary,
  WorkoutType,
  getWorkoutTypeInfo,
} from '../services/api';

type WorkoutExecutionScreenRouteProp = RouteProp<RootStackParamList, 'WorkoutExecution'>;
type WorkoutExecutionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutExecution'>;

type Props = {
  route: WorkoutExecutionScreenRouteProp;
  navigation: WorkoutExecutionScreenNavigationProp;
};

interface SetLog {
  blockLabel: string;
  blockItemOrder: number;
  setNumber: number;
  exerciseName: string;
  targetReps?: number;
  performedReps?: number;
  weight?: number;
  rpe?: number;
  restTakenSec?: number;
}

const WorkoutExecutionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { session, userId } = route.params;
  const [workoutResult, setWorkoutResult] = useState<AdvancedWorkoutResult | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [setLogs, setSetLogs] = useState<SetLog[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState('');

  // Workout-type-specific tracking
  const [totalRounds, setTotalRounds] = useState(0);
  const [wodResult, setWodResult] = useState(''); // For AMRAP/For Time results
  const [emomMinutesCompleted, setEmomMinutesCompleted] = useState(0);
  const [emomFailedMinutes, setEmomFailedMinutes] = useState(0);
  const [tabataRoundsCompleted, setTabataRoundsCompleted] = useState(0);
  const [circuitRoundsCompleted, setCircuitRoundsCompleted] = useState(0);
  const [workoutQuality, setWorkoutQuality] = useState<number | undefined>();
  const [workoutEnjoyment, setWorkoutEnjoyment] = useState<number | undefined>();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, startTime]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = async () => {
    try {
      const result = await advancedWorkoutResultService.startWorkoutSession(session.id, userId);
      setWorkoutResult(result);
      setIsStarted(true);
      setStartTime(new Date());
    } catch (error) {
      console.error('Failed to start workout:', error);
      Alert.alert('Error', 'Failed to start workout session');
    }
  };

  const logSet = (
    block: ExerciseBlock,
    item: BlockItem,
    setNumber: number,
    performedReps: number,
    weight?: number,
    rpe?: number
  ) => {
    const newLog: SetLog = {
      blockLabel: block.label,
      blockItemOrder: item.orderIndex,
      setNumber,
      exerciseName: item.exercise?.name || item.exerciseName || 'Unknown',
      targetReps: item.prescription.targetReps || item.prescription.maxReps,
      performedReps,
      weight,
      rpe,
    };
    setSetLogs([...setLogs, newLog]);
  };

  const finishWorkout = async () => {
    if (!workoutResult) return;

    try {
      // Convert setLogs to SetResultSummary format
      const setResults: SetResultSummary[] = setLogs.map((log, index) => ({
        id: `temp-${index}`,
        blockLabel: log.blockLabel,
        blockItemOrder: log.blockItemOrder,
        setNumber: log.setNumber,
        exerciseName: log.exerciseName,
        targetReps: log.targetReps,
        performedReps: log.performedReps,
        weight: log.weight,
        weightUnit: 'KG',
        rpe: log.rpe,
        restTakenSec: log.restTakenSec,
      }));

      // Build workout-type-specific data
      const updateData: Partial<AdvancedWorkoutResult> = {
        notes,
        setResults,
        workoutQuality,
        workoutEnjoyment,
        totalRounds: totalRounds > 0 ? totalRounds : undefined,
        wodResult: wodResult || undefined,
        emomMinutesCompleted: emomMinutesCompleted > 0 ? emomMinutesCompleted : undefined,
        emomFailedMinutes: emomFailedMinutes > 0 ? emomFailedMinutes : undefined,
        tabataRoundsCompleted: tabataRoundsCompleted > 0 ? tabataRoundsCompleted : undefined,
        circuitRoundsCompleted: circuitRoundsCompleted > 0 ? circuitRoundsCompleted : undefined,
      };

      // Update with all data
      await advancedWorkoutResultService.updateResult(workoutResult.id, updateData);

      // Finish the session (calculates duration and metrics)
      await advancedWorkoutResultService.finishWorkoutSession(workoutResult.id);

      Alert.alert('Success', 'Workout completed!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to finish workout:', error);
      Alert.alert('Error', 'Failed to complete workout');
    }
  };

  const currentBlock = session.blocks[currentBlockIndex];
  const isLastBlock = currentBlockIndex === session.blocks.length - 1;
  const workoutType = currentBlock?.workoutType;
  const workoutTypeInfo = workoutType ? getWorkoutTypeInfo(workoutType) : null;

  // Determine if this is a time-based, round-based, or traditional workout
  const isTimeBased = workoutType && ['TABATA', 'EMOM', 'EMOM_2', 'EMOM_3', 'FOR_TIME', 'AMRAP', 'HIIT'].includes(workoutType);
  const isRoundBased = workoutType && ['AMRAP', 'CIRCUIT', 'CIRCUIT_REPS', 'CIRCUIT_TIME'].includes(workoutType);
  const isEMOM = workoutType && ['EMOM', 'EMOM_2', 'EMOM_3'].includes(workoutType);
  const isTabata = workoutType === 'TABATA';

  if (!isStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.preStartHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.preStartTitle}>{session.title}</Text>
        </View>

        <ScrollView style={styles.previewContainer}>
          <View style={styles.sessionInfo}>
            <Icon name="fitness-center" size={48} color="#007AFF" />
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionSubtitle}>
              {session.blocks.length} block{session.blocks.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {session.blocks.map((block, idx) => {
            const blockTypeInfo = block.workoutType ? getWorkoutTypeInfo(block.workoutType) : null;
            return (
              <View key={idx} style={styles.blockPreview}>
                <View style={styles.blockPreviewHeader}>
                  <Text style={styles.blockLabel}>{block.label}</Text>
                  {blockTypeInfo && (
                    <View style={[styles.typeBadge, { backgroundColor: blockTypeInfo.color + '20' }]}>
                      <Icon name={blockTypeInfo.icon} size={14} color={blockTypeInfo.color} />
                      <Text style={[styles.typeBadgeText, { color: blockTypeInfo.color }]}>
                        {blockTypeInfo.displayName}
                      </Text>
                    </View>
                  )}
                </View>
                {block.items.map((item, itemIdx) => (
                  <Text key={itemIdx} style={styles.exercisePreview}>
                    • {item.exercise?.name || item.exerciseName}
                    {item.prescription.sets && ` - ${item.prescription.sets} sets`}
                    {item.prescription.targetReps && ` × ${item.prescription.targetReps} reps`}
                    {item.prescription.weight && ` @ ${item.prescription.weight}${item.prescription.weightUnit || 'kg'}`}
                  </Text>
                ))}
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
          <Icon name="play-arrow" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{session.title}</Text>
          {workoutTypeInfo && (
            <Text style={styles.workoutTypeLabel}>{workoutTypeInfo.displayName}</Text>
          )}
        </View>
        <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
      </View>

      <ScrollView style={styles.workoutContainer}>
        {currentBlock && (
          <View style={styles.currentBlock}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockLabel}>{currentBlock.label}</Text>
              <Text style={styles.blockInfo}>
                Block {currentBlockIndex + 1} of {session.blocks.length}
              </Text>
            </View>

            {/* Workout Type-Specific Controls */}
            {isRoundBased && (
              <View style={styles.roundTracker}>
                <Text style={styles.roundLabel}>Rounds Completed:</Text>
                <View style={styles.roundControls}>
                  <TouchableOpacity
                    style={styles.roundButton}
                    onPress={() => {
                      if (workoutType === 'CIRCUIT' || workoutType?.startsWith('CIRCUIT')) {
                        setCircuitRoundsCompleted(Math.max(0, circuitRoundsCompleted - 1));
                      } else {
                        setTotalRounds(Math.max(0, totalRounds - 1));
                      }
                    }}
                  >
                    <Icon name="remove" size={24} color="#007AFF" />
                  </TouchableOpacity>
                  <Text style={styles.roundCount}>
                    {workoutType === 'CIRCUIT' || workoutType?.startsWith('CIRCUIT') ? circuitRoundsCompleted : totalRounds}
                  </Text>
                  <TouchableOpacity
                    style={styles.roundButton}
                    onPress={() => {
                      if (workoutType === 'CIRCUIT' || workoutType?.startsWith('CIRCUIT')) {
                        setCircuitRoundsCompleted(circuitRoundsCompleted + 1);
                      } else {
                        setTotalRounds(totalRounds + 1);
                      }
                    }}
                  >
                    <Icon name="add" size={24} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isEMOM && (
              <View style={styles.emomTracker}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Minutes Completed:</Text>
                  <View style={styles.metricControls}>
                    <TouchableOpacity
                      style={styles.metricButton}
                      onPress={() => setEmomMinutesCompleted(Math.max(0, emomMinutesCompleted - 1))}
                    >
                      <Icon name="remove" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.metricValue}>{emomMinutesCompleted}</Text>
                    <TouchableOpacity
                      style={styles.metricButton}
                      onPress={() => setEmomMinutesCompleted(emomMinutesCompleted + 1)}
                    >
                      <Icon name="add" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Failed Minutes:</Text>
                  <View style={styles.metricControls}>
                    <TouchableOpacity
                      style={styles.metricButton}
                      onPress={() => setEmomFailedMinutes(Math.max(0, emomFailedMinutes - 1))}
                    >
                      <Icon name="remove" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                    <Text style={styles.metricValue}>{emomFailedMinutes}</Text>
                    <TouchableOpacity
                      style={styles.metricButton}
                      onPress={() => setEmomFailedMinutes(emomFailedMinutes + 1)}
                    >
                      <Icon name="add" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {isTabata && (
              <View style={styles.tabataTracker}>
                <Text style={styles.metricLabel}>Tabata Rounds:</Text>
                <View style={styles.metricControls}>
                  <TouchableOpacity
                    style={styles.metricButton}
                    onPress={() => setTabataRoundsCompleted(Math.max(0, tabataRoundsCompleted - 1))}
                  >
                    <Icon name="remove" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <Text style={styles.metricValue}>{tabataRoundsCompleted}</Text>
                  <TouchableOpacity
                    style={styles.metricButton}
                    onPress={() => setTabataRoundsCompleted(tabataRoundsCompleted + 1)}
                  >
                    <Icon name="add" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {workoutType === 'FOR_TIME' && (
              <View style={styles.forTimeTracker}>
                <Text style={styles.metricLabel}>Completion Time:</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="e.g., 12:34"
                  value={wodResult}
                  onChangeText={setWodResult}
                />
              </View>
            )}

            {workoutType === 'AMRAP' && (
              <View style={styles.amrapTracker}>
                <Text style={styles.metricLabel}>Result (rounds + reps):</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="e.g., 5 rounds + 12 reps"
                  value={wodResult}
                  onChangeText={setWodResult}
                />
              </View>
            )}

            {/* Exercise Items */}
            {currentBlock.items.map((item, idx) => (
              <ExerciseCard
                key={idx}
                item={item}
                blockType={workoutType}
                onLogSet={(setNum, reps, weight, rpe) =>
                  logSet(currentBlock, item, setNum, reps, weight, rpe)
                }
              />
            ))}
          </View>
        )}

        {/* Quality Ratings */}
        <View style={styles.ratingsSection}>
          <Text style={styles.sectionTitle}>How was your workout?</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Quality (1-10):</Text>
            <TextInput
              style={styles.ratingInput}
              keyboardType="numeric"
              placeholder="10"
              value={workoutQuality?.toString() || ''}
              onChangeText={(text) => setWorkoutQuality(parseInt(text) || undefined)}
            />
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Enjoyment (1-10):</Text>
            <TextInput
              style={styles.ratingInput}
              keyboardType="numeric"
              placeholder="10"
              value={workoutEnjoyment?.toString() || ''}
              onChangeText={(text) => setWorkoutEnjoyment(parseInt(text) || undefined)}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Add workout notes..."
          />
        </View>

        {/* Set Log Summary */}
        <View style={styles.setLogSection}>
          <Text style={styles.setLogTitle}>Sets Completed: {setLogs.length}</Text>
          {setLogs.slice(-5).reverse().map((log, idx) => (
            <Text key={idx} style={styles.setLogItem}>
              {log.exerciseName}: {log.performedReps} reps
              {log.weight && ` @ ${log.weight}kg`}
              {log.rpe && ` (RPE ${log.rpe})`}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentBlockIndex > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={() => setCurrentBlockIndex(currentBlockIndex - 1)}
          >
            <Icon name="arrow-back" size={20} color="#fff" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}

        {!isLastBlock ? (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={() => setCurrentBlockIndex(currentBlockIndex + 1)}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Icon name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.finishButton]}
            onPress={finishWorkout}
          >
            <Icon name="check" size={20} color="#fff" />
            <Text style={styles.navButtonText}>Finish Workout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ExerciseCard: React.FC<{
  item: BlockItem;
  blockType?: WorkoutType;
  onLogSet: (setNumber: number, reps: number, weight?: number, rpe?: number) => void;
}> = ({ item, blockType, onLogSet }) => {
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState(item.prescription.targetReps?.toString() || '');
  const [weight, setWeight] = useState(item.prescription.weight?.toString() || '');
  const [rpe, setRpe] = useState('');

  const handleLogSet = () => {
    const repsNum = parseInt(reps) || 0;
    const weightNum = parseFloat(weight) || undefined;
    const rpeNum = parseInt(rpe) || undefined;

    onLogSet(currentSet, repsNum, weightNum, rpeNum);
    setCurrentSet(currentSet + 1);
    setReps(item.prescription.targetReps?.toString() || '');
    setRpe('');
  };

  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>
        {item.exercise?.name || item.exerciseName}
      </Text>
      <Text style={styles.exerciseTarget}>
        Target: {item.prescription.sets} sets × {item.prescription.targetReps || item.prescription.maxReps} reps
        {item.prescription.weight && ` @ ${item.prescription.weight}${item.prescription.weightUnit || 'kg'}`}
      </Text>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>RPE</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={rpe}
            onChangeText={setRpe}
            placeholder="1-10"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logSetButton} onPress={handleLogSet}>
        <Icon name="check-circle" size={20} color="#fff" />
        <Text style={styles.logSetButtonText}>Log Set {currentSet}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  preStartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  preStartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  workoutTypeLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  previewContainer: {
    flex: 1,
  },
  sessionInfo: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  sessionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  blockPreview: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  blockPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  exercisePreview: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  workoutContainer: {
    flex: 1,
    padding: 16,
  },
  currentBlock: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockInfo: {
    fontSize: 14,
    color: '#666',
  },
  roundTracker: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  roundLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  roundControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
  },
  roundCount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 24,
    color: '#007AFF',
  },
  emomTracker: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tabataTracker: {
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  forTimeTracker: {
    backgroundColor: '#f5fff5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  amrapTracker: {
    backgroundColor: '#fffaf0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  metricControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  timeInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  exerciseCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseTarget: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  logSetButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
  },
  logSetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ratingsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#666',
  },
  ratingInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  notesSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  setLogSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  setLogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setLogItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  prevButton: {
    backgroundColor: '#9E9E9E',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
});

export default WorkoutExecutionScreen;
