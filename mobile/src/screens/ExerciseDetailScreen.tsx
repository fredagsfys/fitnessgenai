import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {exerciseService, Exercise} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

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
  const {exerciseId} = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercise();
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading exercise details...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {exercise.imageUrl && (
        <Image source={{uri: exercise.imageUrl}} style={styles.exerciseImage} />
      )}

      <View style={styles.content}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{exercise.category}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{exercise.muscleGroup}</Text>
          </View>
          {exercise.equipment && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exercise.equipment}</Text>
            </View>
          )}
        </View>

        {exercise.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{exercise.description}</Text>
          </View>
        )}

        {exercise.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructions}>{exercise.instructions}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target Muscle:</Text>
            <Text style={styles.detailValue}>{exercise.muscleGroup}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{exercise.category}</Text>
          </View>
          {exercise.equipment && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Equipment:</Text>
              <Text style={styles.detailValue}>{exercise.equipment}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
  exerciseImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
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
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
});

export default ExerciseDetailScreen;