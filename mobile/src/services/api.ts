import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Simple base64 encoding function for React Native
const encodeBase64 = (_str: string): string => {
  // For demo purposes - in production, use proper authentication
  // Using hardcoded value for demo - admin:password = YWRtaW46cGFzc3dvcmQ=
  return 'YWRtaW46cGFzc3dvcmQ=';
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Basic auth for demo purposes - in production, use proper authentication
    const credentials = 'admin:password';
    const token = 'Basic ' + encodeBase64(credentials);
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Exercise {
  id: number;
  name: string;
  description: string;
  category: string;
  muscleGroup: string;
  equipment?: string;
  instructions?: string;
  imageUrl?: string;
}

export interface Workout {
  id: number;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  exercises: Exercise[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
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

  getExerciseById: (id: number): Promise<Exercise> =>
    apiClient.get(`/exercises/${id}`).then(response => response.data),

  getExercisesByCategory: (category: string): Promise<Exercise[]> =>
    apiClient.get(`/exercises/category/${category}`).then(response => response.data),

  getExercisesByMuscleGroup: (muscleGroup: string): Promise<Exercise[]> =>
    apiClient.get(`/exercises/muscle-group/${muscleGroup}`).then(response => response.data),

  getMuscleGroups: (): Promise<string[]> =>
    apiClient.get('/exercises/muscle-groups').then(response => response.data),

  createExercise: (exercise: Omit<Exercise, 'id'>): Promise<Exercise> =>
    apiClient.post('/exercises', exercise).then(response => response.data),

  updateExercise: (id: number, exercise: Partial<Exercise>): Promise<Exercise> =>
    apiClient.put(`/exercises/${id}`, exercise).then(response => response.data),

  deleteExercise: (id: number): Promise<void> =>
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

export const progressService = {
  getUserProgress: (userId: number): Promise<UserProgress[]> =>
    apiClient.get(`/users/${userId}/progress`).then(response => response.data),

  createProgress: (progress: Omit<UserProgress, 'id'>): Promise<UserProgress> =>
    apiClient.post('/workout-results', progress).then(response => response.data),

  updateProgress: (id: number, progress: Partial<UserProgress>): Promise<UserProgress> =>
    apiClient.put(`/workout-results/${id}`, progress).then(response => response.data),

  deleteProgress: (id: number): Promise<void> =>
    apiClient.delete(`/workout-results/${id}`),
};

export default apiClient;