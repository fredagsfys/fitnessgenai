import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ExercisesScreen from '../screens/ExercisesScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import WorkoutBuilderScreen from '../screens/WorkoutBuilderScreen';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';
import WorkoutExecutionScreen from '../screens/WorkoutExecutionScreen';
import ProgressWorkoutDetailScreen from '../screens/ProgressWorkoutDetailScreen';
import StatsDetailScreen from '../screens/StatsDetailScreen';
import {WorkoutSession, AdvancedWorkoutResult} from '../services/api';

export type RootStackParamList = {
  MainTabs: undefined;
  ExerciseDetail: {exerciseId: number};
  WorkoutDetail: {workoutId?: number; result?: AdvancedWorkoutResult};
  WorkoutBuilder: {programId?: string};
  ProgramDetail: {programId: string};
  WorkoutExecution: {session: WorkoutSession; userId: string};
  StatsDetail: {results: AdvancedWorkoutResult[]};
  WorkoutHistory: {results: AdvancedWorkoutResult[]};
};

export type TabParamList = {
  Exercises: undefined;
  Workouts: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const getTabBarIcon = (routeName: string) => {
  switch (routeName) {
    case 'Exercises':
      return 'fitness-center';
    case 'Workouts':
      return 'playlist-add-check';
    case 'Progress':
      return 'trending-up';
    case 'Profile':
      return 'person';
    default:
      return 'help';
  }
};

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => (
          <Icon name={getTabBarIcon(route.name)} size={size} color={color} />
        ),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: insets.bottom + 5,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        headerShown: false,
      })}>
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{tabBarLabel: 'Exercises'}}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{tabBarLabel: 'Workouts'}}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{tabBarLabel: 'Progress'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerStatusBarHeight: 0,
        }}>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ExerciseDetail"
          component={ExerciseDetailScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="WorkoutBuilder"
          component={WorkoutBuilderScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProgramDetail"
          component={ProgramDetailScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="WorkoutExecution"
          component={WorkoutExecutionScreen}
          options={{title: 'Workout', headerShown: false}}
        />
        <Stack.Screen
          name="WorkoutDetail"
          component={ProgressWorkoutDetailScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="StatsDetail"
          component={StatsDetailScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;