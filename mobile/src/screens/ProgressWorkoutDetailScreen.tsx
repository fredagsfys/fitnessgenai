import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AdvancedWorkoutResult} from '../services/api';

type WorkoutDetailRouteProp = RouteProp<{WorkoutDetail: {result: AdvancedWorkoutResult}}, 'WorkoutDetail'>;

const ProgressWorkoutDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<WorkoutDetailRouteProp>();
  const {result} = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title Card */}
        <View style={styles.titleCard}>
          <Text style={styles.workoutTitle}>{result.sessionTitle || 'Workout Session'}</Text>
          <Text style={styles.workoutDate}>{formatDate(result.date)}</Text>
          <Text style={styles.workoutTime}>{formatTime(result.date)}</Text>
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          {result.totalDurationSeconds && (
            <View style={styles.statCard}>
              <Icon name="schedule" size={32} color="#007AFF" />
              <Text style={styles.statValue}>{Math.round(result.totalDurationSeconds / 60)}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          )}
          {result.totalReps && (
            <View style={styles.statCard}>
              <Icon name="fitness-center" size={32} color="#FF6B6B" />
              <Text style={styles.statValue}>{result.totalReps}</Text>
              <Text style={styles.statLabel}>Reps</Text>
            </View>
          )}
          {result.totalVolumeLoad && (
            <View style={styles.statCard}>
              <Icon name="trending-up" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{Math.round(result.totalVolumeLoad)}</Text>
              <Text style={styles.statLabel}>Volume (kg)</Text>
            </View>
          )}
          {result.setResults && result.setResults.length > 0 && (
            <View style={styles.statCard}>
              <Icon name="list" size={32} color="#9C27B0" />
              <Text style={styles.statValue}>{result.setResults.length}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
          )}
        </View>

        {/* Workout Type Specific */}
        {(result.totalRounds !== undefined ||
          result.emomMinutesCompleted !== undefined ||
          result.tabataRoundsCompleted !== undefined ||
          result.circuitRoundsCompleted !== undefined) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Details</Text>
            {result.totalRounds !== undefined && (
              <View style={styles.detailRow}>
                <Icon name="loop" size={20} color="#FF9F43" />
                <Text style={styles.detailText}>
                  {result.totalRounds} Rounds{result.wodResult && ` • ${result.wodResult}`}
                </Text>
              </View>
            )}
            {result.emomMinutesCompleted !== undefined && (
              <View style={styles.detailRow}>
                <Icon name="schedule" size={20} color="#00BCD4" />
                <Text style={styles.detailText}>
                  EMOM: {result.emomMinutesCompleted}/{result.emomMinutesTarget} minutes
                  {result.emomFailedMinutes ? ` (${result.emomFailedMinutes} failed)` : ''}
                </Text>
              </View>
            )}
            {result.tabataRoundsCompleted !== undefined && (
              <View style={styles.detailRow}>
                <Icon name="flash-on" size={20} color="#E74C3C" />
                <Text style={styles.detailText}>Tabata: {result.tabataRoundsCompleted} rounds</Text>
              </View>
            )}
            {result.circuitRoundsCompleted !== undefined && (
              <View style={styles.detailRow}>
                <Icon name="repeat" size={20} color="#4ECDC4" />
                <Text style={styles.detailText}>Circuit: {result.circuitRoundsCompleted} rounds</Text>
              </View>
            )}
          </View>
        )}

        {/* Quality Ratings */}
        {(result.workoutQuality || result.workoutEnjoyment) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ratings</Text>
            {result.workoutQuality && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Quality</Text>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBar, {width: `${result.workoutQuality * 10}%`}]} />
                  <Text style={styles.ratingValue}>{result.workoutQuality}/10</Text>
                </View>
              </View>
            )}
            {result.workoutEnjoyment && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Enjoyment</Text>
                <View style={styles.ratingBarContainer}>
                  <View style={[styles.ratingBar, {width: `${result.workoutEnjoyment * 10}%`, backgroundColor: '#FF9F43'}]} />
                  <Text style={styles.ratingValue}>{result.workoutEnjoyment}/10</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Sets Breakdown */}
        {result.setResults && result.setResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sets ({result.setResults.length})</Text>
            {result.setResults.map((set, index) => (
              <View key={index} style={styles.setCard}>
                <View style={styles.setHeader}>
                  <Text style={styles.setExercise}>{set.exerciseName}</Text>
                  <Text style={styles.setNumber}>Set {set.setNumber}</Text>
                </View>
                <View style={styles.setDetails}>
                  {set.performedReps && (
                    <View style={styles.setDetail}>
                      <Icon name="repeat" size={16} color="#666" />
                      <Text style={styles.setDetailText}>{set.performedReps} reps</Text>
                    </View>
                  )}
                  {set.weight && (
                    <View style={styles.setDetail}>
                      <Icon name="fitness-center" size={16} color="#666" />
                      <Text style={styles.setDetailText}>{set.weight} kg</Text>
                    </View>
                  )}
                  {set.rpe && (
                    <View style={styles.setDetail}>
                      <Icon name="speed" size={16} color="#666" />
                      <Text style={styles.setDetailText}>RPE {set.rpe}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {result.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{result.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  titleCard: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workoutTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  workoutTime: {
    fontSize: 13,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  ratingRow: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  ratingBarContainer: {
    height: 32,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  ratingBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    zIndex: 1,
  },
  setCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  setNumber: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  setDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  setDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setDetailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: '#fffbf0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
});

export default ProgressWorkoutDetailScreen;
