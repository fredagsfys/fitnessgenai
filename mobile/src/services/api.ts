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

export default apiClient;