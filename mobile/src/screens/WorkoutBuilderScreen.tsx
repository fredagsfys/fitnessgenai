import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  exerciseService,
  programService,
  Exercise,
  WorkoutType,
  BlockType,
  getWorkoutTypeInfo,
  ExerciseBlock,
  BlockItem,
  Prescription,
  Program,
} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

type WorkoutBuilderRouteProp = RouteProp<RootStackParamList, 'WorkoutBuilder'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface BlockForm extends Omit<ExerciseBlock, 'id' | 'items'> {
  items: (BlockItem & {tempId: string})[];
}

interface WorkoutTypeConstraints {
  minExercises: number;
  maxExercises: number | null;
  exerciseLabel: string;
  requiresRounds?: boolean;
  requiresAmrapDuration?: boolean;
  requiresIntervals?: boolean;
  description: string;
  guidance: string[];
}

const getWorkoutTypeConstraints = (workoutType: WorkoutType): WorkoutTypeConstraints => {
  const constraints: Record<WorkoutType, WorkoutTypeConstraints> = {
    STRAIGHT_SETS: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Complete all sets of one exercise before moving to the next',
      guidance: ['Add exercises', 'Set reps and weight for each exercise', 'Configure rest between exercises'],
    },
    SUPERSETS: {
      minExercises: 2,
      maxExercises: 2,
      exerciseLabel: 'exercise',
      description: 'Alternate between 2 exercises with minimal rest',
      guidance: ['Must have exactly 2 exercises', 'Perform back-to-back with minimal rest', 'Rest after completing both'],
    },
    TRISETS: {
      minExercises: 3,
      maxExercises: 3,
      exerciseLabel: 'exercise',
      description: 'Rotate through 3 exercises consecutively',
      guidance: ['Must have exactly 3 exercises', 'Perform all 3 back-to-back', 'Rest after completing the tri-set'],
    },
    GIANT_SETS: {
      minExercises: 4,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Perform 4+ exercises consecutively with minimal rest',
      guidance: ['Minimum 4 exercises required', 'Complete all exercises before resting', 'Great for muscle endurance'],
    },
    CIRCUIT: {
      minExercises: 3,
      maxExercises: null,
      exerciseLabel: 'station',
      requiresRounds: true,
      description: 'Move through stations for multiple rounds',
      guidance: ['Add 3+ exercises as stations', 'Set total rounds in block config', 'Configure rest between stations and after rounds'],
    },
    CIRCUIT_REPS: {
      minExercises: 3,
      maxExercises: null,
      exerciseLabel: 'station',
      requiresRounds: true,
      description: 'Rep-based circuit training',
      guidance: ['Add 3+ exercises', 'Set rep targets for each exercise', 'Complete specified rounds'],
    },
    CIRCUIT_TIME: {
      minExercises: 3,
      maxExercises: null,
      exerciseLabel: 'station',
      requiresRounds: true,
      requiresIntervals: true,
      description: 'Timed circuit with work/rest intervals',
      guidance: ['Add 3+ exercises', 'Set work intervals in block config', 'Set rest intervals between stations'],
    },
    AMRAP: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      requiresAmrapDuration: true,
      description: 'As Many Rounds As Possible in set time',
      guidance: ['Set AMRAP duration in block config', 'Add exercises with rep targets', 'Complete as many rounds as possible'],
    },
    EMOM: {
      minExercises: 1,
      maxExercises: 1,
      exerciseLabel: 'exercise',
      requiresRounds: true,
      description: 'Every Minute On the Minute - single exercise',
      guidance: ['One exercise per block', 'Set total minutes in rounds', 'Complete reps at start of each minute'],
    },
    EMOM_2: {
      minExercises: 2,
      maxExercises: 2,
      exerciseLabel: 'exercise',
      requiresRounds: true,
      description: 'EMOM alternating between 2 exercises',
      guidance: ['Exactly 2 exercises', 'Set total minutes in rounds', 'Alternate exercises each minute'],
    },
    EMOM_3: {
      minExercises: 3,
      maxExercises: 3,
      exerciseLabel: 'exercise',
      requiresRounds: true,
      description: 'EMOM rotating through 3 exercises',
      guidance: ['Exactly 3 exercises', 'Set total minutes in rounds', 'Rotate through exercises each minute'],
    },
    FOR_TIME: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      requiresRounds: true,
      description: 'Complete prescribed work as fast as possible',
      guidance: ['Set total rounds if applicable', 'Complete all work as quickly as possible', 'Time the entire workout'],
    },
    TABATA: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      requiresIntervals: true,
      description: '20s work, 10s rest for 8 rounds (4 min)',
      guidance: ['Typically 20s work / 10s rest', 'Standard is 8 rounds (4 minutes)', 'Set work/rest phases in config'],
    },
    PYRAMID: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Increase then decrease reps/weight each set',
      guidance: ['Start light/high reps', 'Increase weight/decrease reps', 'Reverse back down the pyramid'],
    },
    REVERSE_PYRAMID: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Start heavy, decrease weight/increase reps',
      guidance: ['Start with heaviest set', 'Decrease weight each set', 'Can increase reps as weight decreases'],
    },
    DROP_SETS: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Reduce weight immediately after reaching failure',
      guidance: ['Perform set to failure', 'Immediately drop weight 20-25%', 'Continue to failure again'],
    },
    REST_PAUSE: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Short rest periods within a set',
      guidance: ['Perform reps to near failure', 'Rest 10-15 seconds', 'Continue for additional reps'],
    },
    CLUSTER_SETS: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Short rests between small rep clusters',
      guidance: ['Break set into small clusters (2-3 reps)', 'Rest 10-20s between clusters', 'Maintain heavy weight'],
    },
    WOD: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'CrossFit Workout of the Day',
      guidance: ['Can combine multiple workout types', 'Follow specific WOD programming', 'Track time or rounds'],
    },
    HIIT: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      requiresIntervals: true,
      description: 'High Intensity Interval Training',
      guidance: ['Set work and rest intervals', 'Maximum effort during work phase', 'Active recovery during rest'],
    },
    INTERVAL_TRAINING: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      requiresIntervals: true,
      description: 'Structured work/rest intervals',
      guidance: ['Configure work/rest intervals', 'Set total rounds', 'Maintain consistent effort'],
    },
    STEADY_STATE: {
      minExercises: 1,
      maxExercises: 1,
      exerciseLabel: 'exercise',
      description: 'Maintain consistent pace/intensity',
      guidance: ['Single exercise (usually cardio)', 'Set duration or distance', 'Keep steady, sustainable pace'],
    },
    LISS: {
      minExercises: 1,
      maxExercises: 1,
      exerciseLabel: 'exercise',
      description: 'Low Intensity Steady State cardio',
      guidance: ['Single cardio exercise', 'Low intensity (60-70% max HR)', 'Extended duration (30-60 min)'],
    },
    TEMPO_RUNS: {
      minExercises: 1,
      maxExercises: 1,
      exerciseLabel: 'exercise',
      description: 'Running at comfortably hard pace',
      guidance: ['Running exercise only', 'Pace: 80-90% of max effort', 'Duration: 20-40 minutes'],
    },
    FARTLEK: {
      minExercises: 1,
      maxExercises: 1,
      exerciseLabel: 'exercise',
      description: 'Speed play - varied pace training',
      guidance: ['Running exercise', 'Alternate fast and slow periods', 'Unstructured speed changes'],
    },
    DEATH_BY: {
      minExercises: 1,
      maxExercises: 1,
      exerciseLabel: 'exercise',
      description: 'Add 1 rep each minute until failure',
      guidance: ['One exercise only', 'Minute 1: 1 rep, Minute 2: 2 reps, etc.', 'Continue until you can\'t finish in the minute'],
    },
    WAVE_LOADING: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Wavelike pattern of weight/reps',
      guidance: ['Strength exercise', 'Example: 5-3-2, 5-3-2 reps', 'Increase weight each wave'],
    },
    COMPLEX_TRAINING: {
      minExercises: 2,
      maxExercises: 2,
      exerciseLabel: 'exercise',
      description: 'Heavy strength + explosive power movement',
      guidance: ['Exactly 2 exercises', 'First: Heavy strength (e.g., squat)', 'Second: Explosive power (e.g., jump squat)'],
    },
    CONTRAST_TRAINING: {
      minExercises: 2,
      maxExercises: 2,
      exerciseLabel: 'exercise',
      description: 'Alternate heavy and light loads',
      guidance: ['Exactly 2 exercises', 'Same movement pattern', 'Alternate heavy and light sets'],
    },
    MECHANICAL_DROP_SET: {
      minExercises: 1,
      maxExercises: 3,
      exerciseLabel: 'variation',
      description: 'Change exercise angle to continue set',
      guidance: ['1-3 exercise variations', 'Same muscle group, different angles', 'Move to easier variation when fatigued'],
    },
    PRE_EXHAUSTION: {
      minExercises: 2,
      maxExercises: 2,
      exerciseLabel: 'exercise',
      description: 'Isolation then compound movement',
      guidance: ['Exactly 2 exercises', 'First: Isolation exercise', 'Second: Compound movement'],
    },
    POST_EXHAUSTION: {
      minExercises: 2,
      maxExercises: 2,
      exerciseLabel: 'exercise',
      description: 'Compound then isolation movement',
      guidance: ['Exactly 2 exercises', 'First: Compound movement', 'Second: Isolation exercise'],
    },
    LADDER_SETS: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Progressively increase or decrease reps',
      guidance: ['Ascending: 1,2,3,4... reps', 'Or descending: 10,9,8,7... reps', 'Rest between sets'],
    },
    LADDER_CLIMB: {
      minExercises: 2,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Multiple exercises with changing rep scheme',
      guidance: ['2+ exercises', 'Coordinated rep changes', 'Example: Ex1 increases, Ex2 decreases'],
    },
    DENSITY_TRAINING: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      requiresAmrapDuration: true,
      description: 'Maximum volume in set timeframe',
      guidance: ['Set time limit', 'Complete as much work as possible', 'Focus on total volume'],
    },
    VOLUME_TRAINING: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'High total volume for muscle growth',
      guidance: ['Multiple sets (8-12+)', 'Moderate weight', 'Focus on total volume'],
    },
    MAX_EFFORT: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Maximum weight for low reps (1-3)',
      guidance: ['Heavy compound movements', '1-3 reps per set', 'Long rest periods (3-5 min)'],
    },
    DYNAMIC_EFFORT: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Explosive speed work with submaximal load',
      guidance: ['50-60% of 1RM', 'Maximum bar speed', 'Multiple sets of 2-3 reps'],
    },
    ACTIVE_RECOVERY: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'activity',
      description: 'Light movement to aid recovery',
      guidance: ['Low intensity movement', 'Improve blood flow', 'Reduce muscle soreness'],
    },
    MOBILITY_SESSION: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'movement',
      description: 'Flexibility and mobility work',
      guidance: ['Stretching and mobility drills', 'Hold positions 30-60s', 'Focus on range of motion'],
    },
    CUSTOM: {
      minExercises: 1,
      maxExercises: null,
      exerciseLabel: 'exercise',
      description: 'Custom workout type',
      guidance: ['Design your own workout structure', 'Add exercises as needed', 'Configure rest periods'],
    },
  };

  return constraints[workoutType] || constraints.STRAIGHT_SETS;
};

// Workout type categories for selection modal
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

interface SessionForm {
  title: string;
  blocks: BlockForm[];
}

const WorkoutBuilderScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WorkoutBuilderRouteProp>();
  const {programId} = route.params || {};

  const [workoutName, setWorkoutName] = useState('');
  const [totalWeeks, setTotalWeeks] = useState('4');
  const [sessions, setSessions] = useState<SessionForm[]>([
    {title: 'Session 1', blocks: []},
  ]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [blocks, setBlocks] = useState<BlockForm[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [blockConfigModalVisible, setBlockConfigModalVisible] = useState(false);
  const [workoutTypeModalVisible, setWorkoutTypeModalVisible] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadExercises();
    if (programId) {
      loadProgram();
    }
  }, [programId]);

  const loadProgram = async () => {
    if (!programId) return;

    try {
      setLoading(true);
      const program = await programService.getProgramById(programId);

      setWorkoutName(program.title);
      setTotalWeeks(program.totalWeeks.toString());
      setIsEditing(true);

      // Convert program sessions
      if (program.sessions && program.sessions.length > 0) {
        const loadedSessions: SessionForm[] = await Promise.all(
          program.sessions.map(async (session) => {
            const loadedBlocks: BlockForm[] = [];

            if (session.blocks) {
              for (const block of session.blocks) {
                const items: (BlockItem & {tempId: string})[] = [];

                if (block.items) {
                  for (const item of block.items) {
                    const exercise = await exerciseService.getExerciseById(item.exerciseId || '');
                    items.push({
                      tempId: `${Date.now()}-${Math.random()}`,
                      orderIndex: item.orderIndex,
                      exercise: exercise,
                      prescription: item.prescription || {
                        sets: 3,
                        targetReps: 10,
                        restSeconds: 60,
                        weightUnit: 'KG',
                      },
                    });
                  }
                }

                loadedBlocks.push({
                  label: block.label,
                  orderIndex: block.orderIndex,
                  blockType: block.blockType,
                  workoutType: block.workoutType,
                  restBetweenItemsSeconds: block.restBetweenItemsSeconds,
                  restAfterBlockSeconds: block.restAfterBlockSeconds,
                  totalRounds: block.totalRounds,
                  amrapDurationSeconds: block.amrapDurationSeconds,
                  intervalSeconds: block.intervalSeconds,
                  workPhaseSeconds: block.workPhaseSeconds,
                  restPhaseSeconds: block.restPhaseSeconds,
                  blockInstructions: block.blockInstructions,
                  notes: block.notes,
                  items: items,
                });
              }
            }

            return {
              title: session.title,
              blocks: loadedBlocks,
            };
          })
        );

        setSessions(loadedSessions);
        setCurrentSessionIndex(0);
        setBlocks(loadedSessions[0]?.blocks || []);
      }
    } catch (error) {
      console.error('Error loading program:', error);
      Alert.alert('Error', 'Failed to load workout for editing');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const exercises = await exerciseService.getAllExercises();
      setAllExercises(exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const addBlock = (workoutType?: WorkoutType) => {
    const newBlock: BlockForm = {
      label: `Block ${blocks.length + 1}`,
      orderIndex: blocks.length,
      blockType: 'STRAIGHT_SETS',
      workoutType: workoutType || 'STRAIGHT_SETS',
      items: [],
      restBetweenItemsSeconds: 60,
      restAfterBlockSeconds: 120,
    };
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);

    // Update session with new blocks
    const newSessions = [...sessions];
    newSessions[currentSessionIndex].blocks = updatedBlocks;
    setSessions(newSessions);
  };

  const addExerciseToBlock = (blockIndex: number, exercise: Exercise) => {
    const newBlocks = [...blocks];
    const block = newBlocks[blockIndex];
    const constraints = getWorkoutTypeConstraints(block.workoutType || 'STRAIGHT_SETS');

    // Check if max exercises reached
    if (constraints.maxExercises && block.items.length >= constraints.maxExercises) {
      Alert.alert(
        'Exercise Limit Reached',
        `${getWorkoutTypeInfo(block.workoutType || 'STRAIGHT_SETS').displayName} requires exactly ${constraints.maxExercises} ${constraints.exerciseLabel}${constraints.maxExercises > 1 ? 's' : ''}.`
      );
      return;
    }

    const newItem: BlockItem & {tempId: string} = {
      tempId: `${Date.now()}-${Math.random()}`,
      orderIndex: newBlocks[blockIndex].items.length,
      exercise: exercise,
      prescription: {
        sets: 3,
        targetReps: 10,
        restSeconds: 60,
        weightUnit: 'KG',
      },
    };
    newBlocks[blockIndex].items.push(newItem);
    setBlocks(newBlocks);

    // Update session
    const newSessions = [...sessions];
    newSessions[currentSessionIndex].blocks = newBlocks;
    setSessions(newSessions);
  };

  const updatePrescription = (
    blockIndex: number,
    itemIndex: number,
    prescription: Partial<Prescription>
  ) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].items[itemIndex].prescription = {
      ...newBlocks[blockIndex].items[itemIndex].prescription,
      ...prescription,
    };
    setBlocks(newBlocks);

    // Update session
    const newSessions = [...sessions];
    newSessions[currentSessionIndex].blocks = newBlocks;
    setSessions(newSessions);
  };

  const updateBlockConfig = (
    blockIndex: number,
    config: Partial<ExerciseBlock>
  ) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex] = {...newBlocks[blockIndex], ...config};
    setBlocks(newBlocks);

    // Update session
    const newSessions = [...sessions];
    newSessions[currentSessionIndex].blocks = newBlocks;
    setSessions(newSessions);
  };

  const removeBlock = (blockIndex: number) => {
    Alert.alert('Remove Block', 'Are you sure you want to remove this block?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updatedBlocks = blocks.filter((_, i) => i !== blockIndex);
          setBlocks(updatedBlocks);

          // Update session
          const newSessions = [...sessions];
          newSessions[currentSessionIndex].blocks = updatedBlocks;
          setSessions(newSessions);
        },
      },
    ]);
  };

  const removeExercise = (blockIndex: number, itemIndex: number) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].items = newBlocks[blockIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setBlocks(newBlocks);

    // Update session
    const newSessions = [...sessions];
    newSessions[currentSessionIndex].blocks = newBlocks;
    setSessions(newSessions);
  };

  const openExerciseSelector = (blockIndex: number) => {
    setSelectedBlockIndex(blockIndex);
    setSearchQuery('');
    setExerciseModalVisible(true);
  };

  const openBlockConfig = (blockIndex: number) => {
    setSelectedBlockIndex(blockIndex);
    setBlockConfigModalVisible(true);
  };

  const addSession = () => {
    // Save current session's blocks first
    const updatedSessions = [...sessions];
    updatedSessions[currentSessionIndex].blocks = blocks;

    // Add new session
    const newSessions = [...updatedSessions, {
      title: `Session ${updatedSessions.length + 1}`,
      blocks: [],
    }];
    setSessions(newSessions);
    setCurrentSessionIndex(newSessions.length - 1);
    setBlocks([]);
  };

  const switchSession = (index: number) => {
    // Save current session's blocks
    const updatedSessions = [...sessions];
    updatedSessions[currentSessionIndex].blocks = blocks;
    setSessions(updatedSessions);

    // Switch to new session
    setCurrentSessionIndex(index);
    setBlocks(updatedSessions[index].blocks);
  };

  const deleteSession = (index: number) => {
    if (sessions.length <= 1) {
      Alert.alert('Error', 'Program must have at least one session');
      return;
    }

    Alert.alert(
      'Delete Session',
      `Delete "${sessions[index].title}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newSessions = sessions.filter((_, i) => i !== index);
            setSessions(newSessions);
            setCurrentSessionIndex(Math.max(0, Math.min(currentSessionIndex, newSessions.length - 1)));
            setBlocks(newSessions[Math.max(0, Math.min(currentSessionIndex, newSessions.length - 1))]?.blocks || []);
          },
        },
      ]
    );
  };

  const renameSession = (index: number, newTitle: string) => {
    const newSessions = [...sessions];
    newSessions[index].title = newTitle;
    setSessions(newSessions);
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    const weeksNum = parseInt(totalWeeks) || 1;
    if (weeksNum < 1 || weeksNum > 52) {
      Alert.alert('Error', 'Total weeks must be between 1 and 52');
      return;
    }

    // Sync current session blocks before saving
    const finalSessions = [...sessions];
    finalSessions[currentSessionIndex].blocks = blocks;

    if (finalSessions.length === 0 || finalSessions.every(s => s.blocks.length === 0)) {
      Alert.alert('Error', 'Please add at least one block to a session');
      return;
    }

    try {
      // Convert sessions to API format
      const apiSessions = finalSessions.map((session, index) => ({
        title: session.title,
        orderIndex: index,
        blocks: session.blocks.map(block => ({
            label: block.label,
            orderIndex: block.orderIndex,
            blockType: block.blockType,
            workoutType: block.workoutType,
            restBetweenItemsSeconds: block.restBetweenItemsSeconds,
            restAfterBlockSeconds: block.restAfterBlockSeconds,
            totalRounds: block.totalRounds,
            amrapDurationSeconds: block.amrapDurationSeconds,
            intervalSeconds: block.intervalSeconds,
            workPhaseSeconds: block.workPhaseSeconds,
            restPhaseSeconds: block.restPhaseSeconds,
            blockInstructions: block.blockInstructions,
            notes: block.notes,
            items: block.items.map(item => ({
              orderIndex: item.orderIndex,
              exerciseId: item.exercise?.id || '',
              prescription: {
                sets: item.prescription.sets,
                minReps: item.prescription.minReps,
                maxReps: item.prescription.maxReps,
                targetReps: item.prescription.targetReps,
                weight: item.prescription.weight,
                weightUnit: item.prescription.weightUnit,
                tempo: item.prescription.tempo,
                restSeconds: item.prescription.restSeconds,
                rpe: item.prescription.rpe,
                rir: item.prescription.rir,
                percentage1RM: item.prescription.percentage1RM,
                notes: item.prescription.notes,
              },
            })),
          })),
        }));

      const programData: Omit<Program, 'id'> = {
        title: workoutName,
        totalWeeks: weeksNum,
        sessions: apiSessions,
      };

      if (isEditing && programId) {
        await programService.updateProgram(programId, programData);
        Alert.alert('Success', 'Workout updated successfully!');
      } else {
        await programService.createProgram(programData);
        Alert.alert('Success', 'Workout created successfully!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Workout' : 'Workout Builder'}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isEditing ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Program Configuration */}
        <View style={styles.nameSection}>
          <Text style={styles.sectionLabel}>Program Name</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g., 12-Week Strength Builder"
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholderTextColor="#999"
          />

          <Text style={[styles.sectionLabel, {marginTop: 16}]}>Program Duration</Text>
          <View style={styles.weeksInputContainer}>
            <TextInput
              style={styles.weeksInput}
              placeholder="4"
              value={totalWeeks}
              onChangeText={setTotalWeeks}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.weeksLabel}>weeks</Text>
          </View>
        </View>

        {/* Session Tabs */}
        <View style={styles.sessionsSection}>
          <View style={styles.sessionTabsHeader}>
            <Text style={styles.sectionLabel}>Sessions ({sessions.length})</Text>
            <TouchableOpacity style={styles.addSessionButton} onPress={addSession}>
              <Icon name="add" size={18} color="#007AFF" />
              <Text style={styles.addSessionText}>Add Session</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sessionTabs}>
            {sessions.map((session, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sessionTab,
                  currentSessionIndex === index && styles.sessionTabActive,
                ]}
                onPress={() => switchSession(index)}
                onLongPress={() => {
                  Alert.prompt(
                    'Rename Session',
                    'Enter new session name:',
                    [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Rename',
                        onPress: (text?: string) => text && renameSession(index, text),
                      },
                    ],
                    'plain-text',
                    session.title
                  );
                }}
              >
                <Text style={[
                  styles.sessionTabText,
                  currentSessionIndex === index && styles.sessionTabTextActive,
                ]}>
                  {session.title}
                </Text>
                {sessions.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteSessionButton}
                    onPress={() => deleteSession(index)}
                  >
                    <Icon name="close" size={16} color={currentSessionIndex === index ? '#007AFF' : '#666'} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Blocks Section */}
        <View style={styles.blocksSection}>
          <View style={styles.blocksSectionHeader}>
            <Text style={styles.sectionLabel}>Blocks ({blocks.length})</Text>
            <TouchableOpacity
              style={styles.addBlockButton}
              onPress={() => setWorkoutTypeModalVisible(true)}
            >
              <Icon name="add" size={20} color="white" />
              <Text style={styles.addBlockButtonText}>Add Block</Text>
            </TouchableOpacity>
          </View>

          {blocks.map((block, blockIndex) => {
            const typeInfo = getWorkoutTypeInfo(block.workoutType || 'STRAIGHT_SETS');
            const constraints = getWorkoutTypeConstraints(block.workoutType || 'STRAIGHT_SETS');
            const exerciseCount = block.items.length;
            const isValid = exerciseCount >= constraints.minExercises && (!constraints.maxExercises || exerciseCount <= constraints.maxExercises);

            return (
              <View key={blockIndex} style={styles.blockCard}>
                <View style={styles.blockHeader}>
                  <View style={styles.blockHeaderLeft}>
                    <View style={[styles.blockTypeIcon, {backgroundColor: typeInfo.color}]}>
                      <Icon name={typeInfo.icon} size={20} color="white" />
                    </View>
                    <View>
                      <Text style={styles.blockLabel}>{block.label}</Text>
                      <Text style={styles.blockType}>{typeInfo.displayName}</Text>
                    </View>
                  </View>
                  <View style={styles.blockActions}>
                    <TouchableOpacity onPress={() => openBlockConfig(blockIndex)}>
                      <Icon name="settings" size={22} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeBlock(blockIndex)}>
                      <Icon name="delete" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Guidance Section */}
                <View style={styles.guidanceSection}>
                  <Text style={styles.guidanceDescription}>{constraints.description}</Text>
                  <View style={styles.guidanceList}>
                    {constraints.guidance.map((tip, idx) => (
                      <View key={idx} style={styles.guidanceItem}>
                        <Icon name="check-circle" size={14} color={isValid ? '#34C759' : '#666'} />
                        <Text style={styles.guidanceTip}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.exerciseCountBadge}>
                    <Icon
                      name={isValid ? 'check-circle' : 'info'}
                      size={16}
                      color={isValid ? '#34C759' : '#FF9500'}
                    />
                    <Text style={[styles.exerciseCountText, {color: isValid ? '#34C759' : '#FF9500'}]}>
                      {exerciseCount} {constraints.exerciseLabel}{exerciseCount !== 1 ? 's' : ''}
                      {constraints.maxExercises ? ` (needs ${constraints.minExercises === constraints.maxExercises ? 'exactly' : 'min'} ${constraints.minExercises})` : exerciseCount < constraints.minExercises ? ` (min ${constraints.minExercises} required)` : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.blockExercises}>
                  {block.items.map((item, itemIndex) => (
                    <View key={item.tempId} style={styles.exerciseItem}>
                      <View style={styles.exerciseItemHeader}>
                        <Text style={styles.exerciseName}>{item.exercise?.name || 'Unknown Exercise'}</Text>
                        <TouchableOpacity
                          onPress={() => removeExercise(blockIndex, itemIndex)}
                        >
                          <Icon name="close" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.prescriptionRow}>
                        <View style={styles.prescriptionInput}>
                          <Text style={styles.prescriptionLabel}>Sets</Text>
                          <TextInput
                            style={styles.prescriptionValue}
                            value={item.prescription.sets?.toString() || ''}
                            onChangeText={text =>
                              updatePrescription(blockIndex, itemIndex, {
                                sets: parseInt(text) || 0,
                              })
                            }
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                          />
                        </View>

                        <View style={styles.prescriptionInput}>
                          <Text style={styles.prescriptionLabel}>Reps</Text>
                          <TextInput
                            style={styles.prescriptionValue}
                            value={item.prescription.targetReps?.toString() || ''}
                            onChangeText={text =>
                              updatePrescription(blockIndex, itemIndex, {
                                targetReps: parseInt(text) || 0,
                              })
                            }
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                          />
                        </View>

                        <View style={styles.prescriptionInput}>
                          <Text style={styles.prescriptionLabel}>Rest (s)</Text>
                          <TextInput
                            style={styles.prescriptionValue}
                            value={item.prescription.restSeconds?.toString() || ''}
                            onChangeText={text =>
                              updatePrescription(blockIndex, itemIndex, {
                                restSeconds: parseInt(text) || 0,
                              })
                            }
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                          />
                        </View>

                        <View style={styles.prescriptionInput}>
                          <Text style={styles.prescriptionLabel}>Weight</Text>
                          <TextInput
                            style={styles.prescriptionValue}
                            value={item.prescription.weight?.toString() || ''}
                            onChangeText={text =>
                              updatePrescription(blockIndex, itemIndex, {
                                weight: parseFloat(text) || 0,
                              })
                            }
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addExerciseButton}
                    onPress={() => openExerciseSelector(blockIndex)}
                  >
                    <Icon name="add-circle-outline" size={20} color="#007AFF" />
                    <Text style={styles.addExerciseText}>Add Exercise</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {blocks.length === 0 && (
            <View style={styles.emptyBlocks}>
              <Icon name="format-list-bulleted" size={48} color="#ccc" />
              <Text style={styles.emptyBlocksText}>No blocks yet</Text>
              <Text style={styles.emptyBlocksSubtext}>
                Add a block to start building your workout
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Workout Type Selection Modal */}
      <Modal
        visible={workoutTypeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWorkoutTypeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setWorkoutTypeModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Block Type</Text>
                <TouchableOpacity onPress={() => setWorkoutTypeModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(WORKOUT_TYPE_CATEGORIES).map(([category, types]) => (
                  <View key={category}>
                    <Text style={styles.categoryHeader}>{category}</Text>
                    {types.map(type => {
                      const info = getWorkoutTypeInfo(type);
                      return (
                        <TouchableOpacity
                          key={type}
                          style={styles.typeOption}
                          onPress={() => {
                            addBlock(type);
                            setWorkoutTypeModalVisible(false);
                          }}
                        >
                          <View style={[styles.typeIcon, {backgroundColor: info.color}]}>
                            <Icon name={info.icon} size={24} color="white" />
                          </View>
                          <View style={styles.typeInfo}>
                            <Text style={styles.typeName}>{info.displayName}</Text>
                            <Text style={styles.typeDesc}>{info.description}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Exercise Selection Modal */}
      <Modal
        visible={exerciseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setExerciseModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Exercise</Text>
                <TouchableOpacity onPress={() => setExerciseModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              <FlatList
                data={filteredExercises}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.exerciseOption}
                    onPress={() => {
                      if (selectedBlockIndex !== null) {
                        addExerciseToBlock(selectedBlockIndex, item);
                        setExerciseModalVisible(false);
                      }
                    }}
                  >
                    <Icon name="fitness-center" size={24} color="#007AFF" />
                    <View style={styles.exerciseOptionInfo}>
                      <Text style={styles.exerciseOptionName}>{item.name}</Text>
                      <Text style={styles.exerciseOptionMuscle}>
                        {item.primaryMuscle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Block Config Modal */}
      <Modal
        visible={blockConfigModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBlockConfigModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBlockConfigModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Block Settings</Text>
                <TouchableOpacity onPress={() => setBlockConfigModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {selectedBlockIndex !== null && (
                <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.configLabel}>Block Name</Text>
                <TextInput
                  style={styles.configInput}
                  value={blocks[selectedBlockIndex].label}
                  onChangeText={text =>
                    updateBlockConfig(selectedBlockIndex, {label: text})
                  }
                  placeholderTextColor="#999"
                />

                <Text style={styles.configLabel}>Rest Between Exercises (seconds)</Text>
                <TextInput
                  style={styles.configInput}
                  value={blocks[selectedBlockIndex].restBetweenItemsSeconds?.toString() || ''}
                  onChangeText={text =>
                    updateBlockConfig(selectedBlockIndex, {
                      restBetweenItemsSeconds: parseInt(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />

                <Text style={styles.configLabel}>Rest After Block (seconds)</Text>
                <TextInput
                  style={styles.configInput}
                  value={blocks[selectedBlockIndex].restAfterBlockSeconds?.toString() || ''}
                  onChangeText={text =>
                    updateBlockConfig(selectedBlockIndex, {
                      restAfterBlockSeconds: parseInt(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />

                {blocks[selectedBlockIndex].workoutType === 'AMRAP' && (
                  <>
                    <Text style={styles.configLabel}>AMRAP Duration (seconds)</Text>
                    <TextInput
                      style={styles.configInput}
                      value={blocks[selectedBlockIndex].amrapDurationSeconds?.toString() || ''}
                      onChangeText={text =>
                        updateBlockConfig(selectedBlockIndex, {
                          amrapDurationSeconds: parseInt(text) || 0,
                        })
                      }
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </>
                )}
              </ScrollView>
            )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  nameSection: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  weeksInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weeksInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    width: 80,
    textAlign: 'center',
  },
  weeksLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  sessionsSection: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 8,
  },
  sessionTabsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addSessionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  sessionTabs: {
    paddingHorizontal: 16,
  },
  sessionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 8,
  },
  sessionTabActive: {
    backgroundColor: '#007AFF',
  },
  sessionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sessionTabTextActive: {
    color: 'white',
  },
  deleteSessionButton: {
    padding: 2,
  },
  blocksSection: {
    padding: 16,
  },
  blocksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addBlockButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  blockCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blockTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  blockType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  blockActions: {
    flexDirection: 'row',
    gap: 12,
  },
  guidanceSection: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  guidanceDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  guidanceList: {
    gap: 6,
    marginBottom: 8,
  },
  guidanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidanceTip: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  exerciseCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
  },
  exerciseCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  blockExercises: {
    gap: 12,
  },
  exerciseItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  exerciseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  prescriptionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prescriptionInput: {
    flex: 1,
  },
  prescriptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  prescriptionValue: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 12,
    borderStyle: 'dashed',
    gap: 6,
  },
  addExerciseText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyBlocks: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyBlocksText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyBlocksSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
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
    color: '#1a1a1a',
  },
  searchInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
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
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  typeDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#F8F9FA',
  },
  exerciseOptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  exerciseOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  exerciseOptionMuscle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  configInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
});

export default WorkoutBuilderScreen;
