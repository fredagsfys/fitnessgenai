import axios from 'axios';
import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to access host machine's localhost
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080/api'
  : 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  primaryMuscle: string;
  muscleGroup: string; // Alias for primaryMuscle for backward compatibility
  equipment?: string;
  instructions?: string;
  imageUrl?: string;
}

// Legacy workout interface (for backward compatibility)
export interface Workout {
  id: number;
  userId: number;
  name: string;
  description?: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedDurationMinutes?: number;
  actualDurationMinutes?: number;
  caloriesBurned?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  exercises?: Exercise[];
}

// Advanced workout types (supports all workout methodologies)
export type WorkoutType =
  | 'STRAIGHT_SETS' | 'SUPERSETS' | 'TRISETS' | 'GIANT_SETS' | 'DROP_SETS'
  | 'REST_PAUSE' | 'CLUSTER_SETS' | 'CIRCUIT' | 'CIRCUIT_REPS' | 'CIRCUIT_TIME'
  | 'WOD' | 'AMRAP' | 'FOR_TIME' | 'EMOM' | 'EMOM_2' | 'EMOM_3' | 'TABATA'
  | 'HIIT' | 'INTERVAL_TRAINING' | 'FARTLEK' | 'PYRAMID' | 'REVERSE_PYRAMID'
  | 'WAVE_LOADING' | 'MAX_EFFORT' | 'DYNAMIC_EFFORT' | 'MECHANICAL_DROP_SET'
  | 'PRE_EXHAUSTION' | 'POST_EXHAUSTION' | 'STEADY_STATE' | 'LISS' | 'TEMPO_RUNS'
  | 'COMPLEX_TRAINING' | 'CONTRAST_TRAINING' | 'DENSITY_TRAINING' | 'VOLUME_TRAINING'
  | 'LADDER_SETS' | 'DEATH_BY' | 'LADDER_CLIMB' | 'ACTIVE_RECOVERY' | 'MOBILITY_SESSION'
  | 'CUSTOM';

export type BlockType =
  | 'STRAIGHT_SETS' | 'SUPERSET' | 'TRISET' | 'GIANT_SET' | 'CIRCUIT'
  | 'EMOM' | 'TABATA' | 'AMRAP' | 'FOR_TIME' | 'COMPLEX' | 'LADDER'
  | 'PYRAMID' | 'WAVE' | 'CLUSTER' | 'REST_PAUSE' | 'DROP_SET'
  | 'MECHANICAL_DROP_SET' | 'DEATH_BY' | 'CUSTOM';

export interface Prescription {
  sets?: number;
  minReps?: number;
  maxReps?: number;
  targetReps?: number;
  weight?: number;
  weightUnit?: 'KG' | 'LBS' | 'BODYWEIGHT';
  tempo?: string; // Format: "3-1-2-1" (eccentric-pause-concentric-pause)
  restSeconds?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  rir?: number; // Reps in Reserve
  percentage1RM?: number;
  notes?: string;
}

export interface BlockItem {
  orderIndex: number;
  exercise: Exercise;
  prescription: Prescription;
}

export interface ExerciseBlock {
  id?: string;
  label: string;
  orderIndex: number;
  blockType?: BlockType;
  workoutType?: WorkoutType;
  items: BlockItem[];
  // Time-based configuration
  blockDurationSeconds?: number;
  restBetweenItemsSeconds?: number;
  restAfterBlockSeconds?: number;
  totalRounds?: number;
  // Circuit/superset flags
  isSuperset?: boolean;
  isCircuit?: boolean;
  isGiantSet?: boolean;
  // EMOM/Tabata specific
  intervalSeconds?: number;
  workPhaseSeconds?: number;
  restPhaseSeconds?: number;
  // AMRAP configuration
  isAMRAP?: boolean;
  amrapDurationSeconds?: number;
  // Complex training
  isComplex?: boolean;
  // Instructions
  blockInstructions?: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  orderIndex: number;
  blocks: ExerciseBlock[];
}

export interface Program {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  totalWeeks: number;
  sessions: WorkoutSession[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface WorkoutResult {
  id: number;
  workoutId: number;
  userId: number;
  completedAt: string;
  duration: number;
  notes?: string;
  caloriesBurned?: number;
}

export interface UserProgress {
  id: number;
  userId: number;
  workoutId: number;
  completedAt: string;
  duration: number;
  notes?: string;
}

export const exerciseService = {
  getAllExercises: (): Promise<Exercise[]> =>
    apiClient.get('/exercises').then(response => response.data),

  getExerciseById: (id: string): Promise<Exercise> =>
    apiClient.get(`/exercises/${id}`).then(response => response.data),

  getExercisesByCategory: (category: string): Promise<Exercise[]> =>
    apiClient.get(`/exercises/category/${category}`).then(response => response.data),

  getExercisesByMuscleGroup: (muscleGroup: string): Promise<Exercise[]> =>
    apiClient.get(`/exercises/muscle/${muscleGroup}`).then(response => response.data),

  getMuscleGroups: async (): Promise<string[]> => {
    const exercises = await apiClient.get('/exercises').then(response => response.data);
    const muscles = new Set<string>();
    exercises.forEach((ex: Exercise) => {
      if (ex.primaryMuscle) muscles.add(ex.primaryMuscle);
    });
    return Array.from(muscles);
  },

  createExercise: (exercise: Omit<Exercise, 'id'>): Promise<Exercise> =>
    apiClient.post('/exercises', exercise).then(response => response.data),

  updateExercise: (id: string, exercise: Partial<Exercise>): Promise<Exercise> =>
    apiClient.put(`/exercises/${id}`, exercise).then(response => response.data),

  deleteExercise: (id: string): Promise<void> =>
    apiClient.delete(`/exercises/${id}`),
};

export const workoutService = {
  getAllWorkouts: (): Promise<Workout[]> =>
    apiClient.get('/workouts').then(response => response.data),

  getWorkoutById: (id: number): Promise<Workout> =>
    apiClient.get(`/workouts/${id}`).then(response => response.data),

  getUserWorkouts: (userId: number): Promise<Workout[]> =>
    apiClient.get(`/workouts/user/${userId}`).then(response => response.data),

  createWorkout: (workout: Omit<Workout, 'id'>): Promise<Workout> =>
    apiClient.post('/workouts', workout).then(response => response.data),

  updateWorkout: (id: number, workout: Partial<Workout>): Promise<Workout> =>
    apiClient.put(`/workouts/${id}`, workout).then(response => response.data),

  deleteWorkout: (id: number): Promise<void> =>
    apiClient.delete(`/workouts/${id}`),
};

export const userService = {
  getAllUsers: (): Promise<User[]> =>
    apiClient.get('/users').then(response => response.data),

  getUserById: (id: number): Promise<User> =>
    apiClient.get(`/users/${id}`).then(response => response.data),

  createUser: (user: Omit<User, 'id'>): Promise<User> =>
    apiClient.post('/users', user).then(response => response.data),

  updateUser: (id: number, user: Partial<User>): Promise<User> =>
    apiClient.put(`/users/${id}`, user).then(response => response.data),

  deleteUser: (id: number): Promise<void> =>
    apiClient.delete(`/users/${id}`),
};

export const workoutResultService = {
  getUserWorkoutResults: (userId: number): Promise<WorkoutResult[]> =>
    apiClient.get(`/api/workout-results/user/${userId}`).then(response => response.data),

  createWorkoutResult: (workoutId: number, result: Omit<WorkoutResult, 'id'>): Promise<WorkoutResult> =>
    apiClient.post(`/workouts/${workoutId}/complete-with-results`, result).then(response => response.data),

  updateWorkoutResult: (id: number, result: Partial<WorkoutResult>): Promise<WorkoutResult> =>
    apiClient.put(`/api/workout-results/${id}`, result).then(response => response.data),

  deleteWorkoutResult: (id: number): Promise<void> =>
    apiClient.delete(`/api/workout-results/${id}`),
};

export const progressService = {
  getUserProgress: (userId: number): Promise<UserProgress[]> =>
    apiClient.get(`/user-progress/user/${userId}`).then(response => response.data),

  createProgress: (progress: Omit<UserProgress, 'id'>): Promise<UserProgress> =>
    apiClient.post('/user-progress', progress).then(response => response.data),

  deleteProgress: (id: number): Promise<void> =>
    apiClient.delete(`/user-progress/${id}`),
};

// Workout type display helpers
export const WorkoutTypeInfo: Record<WorkoutType, { displayName: string; description: string; icon: string; color: string }> = {
  STRAIGHT_SETS: { displayName: 'Straight Sets', description: 'Traditional sets with rest', icon: 'fitness-center', color: '#007AFF' },
  SUPERSETS: { displayName: 'Supersets', description: 'Two exercises back-to-back', icon: 'filter-2', color: '#FF6B6B' },
  TRISETS: { displayName: 'Trisets', description: 'Three exercises consecutively', icon: 'filter-3', color: '#FF6B6B' },
  GIANT_SETS: { displayName: 'Giant Sets', description: 'Four+ exercises consecutively', icon: 'filter-4-plus', color: '#FF6B6B' },
  DROP_SETS: { displayName: 'Drop Sets', description: 'Reduce weight without rest', icon: 'trending-down', color: '#9B59B6' },
  REST_PAUSE: { displayName: 'Rest-Pause', description: 'Brief rest within sets', icon: 'pause', color: '#9B59B6' },
  CLUSTER_SETS: { displayName: 'Cluster Sets', description: 'Mini-rests within sets', icon: 'scatter-plot', color: '#9B59B6' },
  CIRCUIT: { displayName: 'Circuit', description: 'Stations with timed intervals', icon: 'loop', color: '#4ECDC4' },
  CIRCUIT_REPS: { displayName: 'Circuit (Reps)', description: 'Rep-based circuit', icon: 'repeat', color: '#4ECDC4' },
  CIRCUIT_TIME: { displayName: 'Circuit (Time)', description: 'Time-based circuit', icon: 'timer', color: '#4ECDC4' },
  WOD: { displayName: 'WOD', description: 'Workout of the Day', icon: 'today', color: '#FF9F43' },
  AMRAP: { displayName: 'AMRAP', description: 'As Many Rounds As Possible', icon: 'all-inclusive', color: '#FF9F43' },
  FOR_TIME: { displayName: 'For Time', description: 'Complete as fast as possible', icon: 'timer', color: '#FF9F43' },
  EMOM: { displayName: 'EMOM', description: 'Every Minute on the Minute', icon: 'schedule', color: '#4ECDC4' },
  EMOM_2: { displayName: 'E2MOM', description: 'Every 2 Minutes', icon: 'schedule', color: '#4ECDC4' },
  EMOM_3: { displayName: 'E3MOM', description: 'Every 3 Minutes', icon: 'schedule', color: '#4ECDC4' },
  TABATA: { displayName: 'Tabata', description: '20s work / 10s rest', icon: 'timer', color: '#E74C3C' },
  HIIT: { displayName: 'HIIT', description: 'High-Intensity Intervals', icon: 'flash-on', color: '#E74C3C' },
  INTERVAL_TRAINING: { displayName: 'Intervals', description: 'Work/rest intervals', icon: 'sync-alt', color: '#E74C3C' },
  FARTLEK: { displayName: 'Fartlek', description: 'Varying intensities', icon: 'trending-up', color: '#3498DB' },
  PYRAMID: { displayName: 'Pyramid', description: 'Increase then decrease', icon: 'change-history', color: '#9B59B6' },
  REVERSE_PYRAMID: { displayName: 'Reverse Pyramid', description: 'Decrease then increase', icon: 'change-history', color: '#9B59B6' },
  WAVE_LOADING: { displayName: 'Wave Loading', description: 'Undulating loads', icon: 'show-chart', color: '#34495E' },
  MAX_EFFORT: { displayName: 'Max Effort', description: 'Work up to 1-3RM', icon: 'fitness-center', color: '#2C3E50' },
  DYNAMIC_EFFORT: { displayName: 'Dynamic Effort', description: 'Speed/explosive work', icon: 'flash-on', color: '#F39C12' },
  MECHANICAL_DROP_SET: { displayName: 'Mechanical Drop', description: 'Change angle/leverage', icon: 'swap-vert', color: '#16A085' },
  PRE_EXHAUSTION: { displayName: 'Pre-Exhaustion', description: 'Isolation then compound', icon: 'arrow-forward', color: '#27AE60' },
  POST_EXHAUSTION: { displayName: 'Post-Exhaustion', description: 'Compound then isolation', icon: 'arrow-back', color: '#27AE60' },
  STEADY_STATE: { displayName: 'Steady State', description: 'Consistent pace', icon: 'horizontal-rule', color: '#3498DB' },
  LISS: { displayName: 'LISS', description: 'Low-Intensity Steady State', icon: 'trending-flat', color: '#3498DB' },
  TEMPO_RUNS: { displayName: 'Tempo Runs', description: 'Comfortably hard pace', icon: 'directions-run', color: '#3498DB' },
  COMPLEX_TRAINING: { displayName: 'Complex', description: 'Heavy + explosive', icon: 'layers', color: '#8E44AD' },
  CONTRAST_TRAINING: { displayName: 'Contrast', description: 'Heavy + light + explosive', icon: 'layers', color: '#8E44AD' },
  DENSITY_TRAINING: { displayName: 'Density', description: 'More work in same time', icon: 'compress', color: '#E67E22' },
  VOLUME_TRAINING: { displayName: 'Volume', description: 'High volume accumulation', icon: 'bar-chart', color: '#E67E22' },
  LADDER_SETS: { displayName: 'Ladder Sets', description: 'Ascending/descending reps', icon: 'stairs', color: '#16A085' },
  DEATH_BY: { displayName: 'Death By', description: 'Add one rep until failure', icon: 'warning', color: '#C0392B' },
  LADDER_CLIMB: { displayName: 'Ladder Climb', description: '1, 2, 3, 4... reps', icon: 'trending-up', color: '#16A085' },
  ACTIVE_RECOVERY: { displayName: 'Active Recovery', description: 'Low-intensity movement', icon: 'self-improvement', color: '#95A5A6' },
  MOBILITY_SESSION: { displayName: 'Mobility', description: 'Stretching and mobility', icon: 'accessibility', color: '#95A5A6' },
  CUSTOM: { displayName: 'Custom', description: 'User-defined structure', icon: 'settings', color: '#7F8C8D' },
};

export const getWorkoutTypeInfo = (type: WorkoutType) => WorkoutTypeInfo[type] || WorkoutTypeInfo.CUSTOM;

export const isTimeBased = (type: WorkoutType): boolean => {
  return ['TABATA', 'EMOM', 'EMOM_2', 'EMOM_3', 'FOR_TIME', 'AMRAP', 'CIRCUIT_TIME', 'HIIT', 'INTERVAL_TRAINING', 'DEATH_BY'].includes(type);
};

export const isSuperset = (type: WorkoutType): boolean => {
  return ['SUPERSETS', 'TRISETS', 'GIANT_SETS', 'CIRCUIT', 'CIRCUIT_REPS', 'CIRCUIT_TIME'].includes(type);
};

export const isDropSet = (type: WorkoutType): boolean => {
  return ['DROP_SETS', 'MECHANICAL_DROP_SET', 'REST_PAUSE', 'CLUSTER_SETS'].includes(type);
};

// Program/Advanced Workout API
export const programService = {
  getAllPrograms: (): Promise<Program[]> =>
    apiClient.get('/programs').then(response => response.data),

  getProgramById: (id: string): Promise<Program> =>
    apiClient.get(`/programs/${id}`).then(response => response.data),

  createProgram: (program: Omit<Program, 'id'>): Promise<Program> =>
    apiClient.post('/programs', program).then(response => response.data),

  updateProgram: (id: string, program: Partial<Program>): Promise<Program> =>
    apiClient.put(`/programs/${id}`, program).then(response => response.data),

  deleteProgram: (id: string): Promise<void> =>
    apiClient.delete(`/programs/${id}`),

  startProgram: (id: string, startDate?: string): Promise<Program> =>
    apiClient.post(`/programs/${id}/start`, null, {params: {startDate}}).then(response => response.data),
};

export default apiClient;