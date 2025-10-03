import React, {useState} from 'react';
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

type StatsDetailRouteProp = RouteProp<{StatsDetail: {results: AdvancedWorkoutResult[]}}, 'StatsDetail'>;

type Period = 'week' | 'month' | 'year' | 'all';

const StatsDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<StatsDetailRouteProp>();
  const {results} = route.params;
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  const getFilteredResults = () => {
    const now = new Date();
    return results.filter(r => {
      const date = new Date(r.date);
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return date >= monthAgo;
        case 'year':
          const yearAgo = new Date(now);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return date >= yearAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredResults = getFilteredResults();

  const totalWorkouts = filteredResults.length;
  const totalVolume = filteredResults.reduce((sum, r) => sum + (r.totalVolumeLoad || 0), 0);
  const totalReps = filteredResults.reduce((sum, r) => sum + (r.totalReps || 0), 0);
  const totalDuration = filteredResults.reduce((sum, r) => sum + (r.totalDurationSeconds || 0), 0);
  const avgQuality = filteredResults.filter(r => r.workoutQuality).length > 0
    ? filteredResults.reduce((sum, r) => sum + (r.workoutQuality || 0), 0) / filteredResults.filter(r => r.workoutQuality).length
    : 0;

  // Personal Records
  const getPersonalRecords = () => {
    const exerciseMaxes: {[key: string]: {weight: number, reps: number, date: string}} = {};

    filteredResults.forEach(result => {
      result.setResults?.forEach(set => {
        const key = set.exerciseName || 'Unknown';
        const weight = set.weight || 0;
        const reps = set.performedReps || 0;

        if (!exerciseMaxes[key] || weight > exerciseMaxes[key].weight) {
          exerciseMaxes[key] = {
            weight,
            reps,
            date: result.date
          };
        }
      });
    });

    return Object.entries(exerciseMaxes)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 5);
  };

  const personalRecords = getPersonalRecords();

  // Workout frequency by day of week
  const getWorkoutsByDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);

    filteredResults.forEach(result => {
      const day = new Date(result.date).getDay();
      counts[day]++;
    });

    return days.map((day, idx) => ({day, count: counts[idx]}));
  };

  const workoutsByDay = getWorkoutsByDay();
  const maxDayCount = Math.max(...workoutsByDay.map(d => d.count), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detailed Stats</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year', 'all'] as Period[]).map(period => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="fitness-center" size={28} color="#007AFF" />
              <Text style={styles.statValue}>{totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="trending-up" size={28} color="#4CAF50" />
              <Text style={styles.statValue}>{Math.round(totalVolume / 1000)}k</Text>
              <Text style={styles.statLabel}>Volume (kg)</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="repeat" size={28} color="#FF6B6B" />
              <Text style={styles.statValue}>{totalReps}</Text>
              <Text style={styles.statLabel}>Total Reps</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="schedule" size={28} color="#9C27B0" />
              <Text style={styles.statValue}>{Math.round(totalDuration / 3600)}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
          </View>
        </View>

        {/* Average Quality */}
        {avgQuality > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Average Quality</Text>
            <View style={styles.qualityCard}>
              <View style={styles.qualityBarContainer}>
                <View style={[styles.qualityBar, {width: `${avgQuality * 10}%`}]} />
              </View>
              <Text style={styles.qualityValue}>{avgQuality.toFixed(1)}/10</Text>
            </View>
          </View>
        )}

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            {personalRecords.map(([exercise, record]) => (
              <View key={exercise} style={styles.recordCard}>
                <View style={styles.recordIcon}>
                  <Icon name="emoji-events" size={24} color="#FFD700" />
                </View>
                <View style={styles.recordContent}>
                  <Text style={styles.recordExercise}>{exercise}</Text>
                  <Text style={styles.recordDetails}>
                    {record.weight}kg × {record.reps} reps
                  </Text>
                </View>
                <Text style={styles.recordDate}>
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Workout Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Frequency</Text>
          <View style={styles.chartContainer}>
            {workoutsByDay.map(({day, count}) => (
              <View key={day} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, {height: `${(count / maxDayCount) * 100}%`}]} />
                </View>
                <Text style={styles.barLabel}>{day}</Text>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Workout Type Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Types</Text>
          {filteredResults.filter(r => r.emomMinutesCompleted).length > 0 && (
            <View style={styles.typeRow}>
              <Icon name="schedule" size={20} color="#00BCD4" />
              <Text style={styles.typeLabel}>EMOM</Text>
              <Text style={styles.typeCount}>{filteredResults.filter(r => r.emomMinutesCompleted).length}</Text>
            </View>
          )}
          {filteredResults.filter(r => r.tabataRoundsCompleted).length > 0 && (
            <View style={styles.typeRow}>
              <Icon name="flash-on" size={20} color="#E74C3C" />
              <Text style={styles.typeLabel}>Tabata</Text>
              <Text style={styles.typeCount}>{filteredResults.filter(r => r.tabataRoundsCompleted).length}</Text>
            </View>
          )}
          {filteredResults.filter(r => r.circuitRoundsCompleted).length > 0 && (
            <View style={styles.typeRow}>
              <Icon name="repeat" size={20} color="#4ECDC4" />
              <Text style={styles.typeLabel}>Circuit</Text>
              <Text style={styles.typeCount}>{filteredResults.filter(r => r.circuitRoundsCompleted).length}</Text>
            </View>
          )}
          {filteredResults.filter(r => r.totalRounds).length > 0 && (
            <View style={styles.typeRow}>
              <Icon name="loop" size={20} color="#FF9F43" />
              <Text style={styles.typeLabel}>AMRAP/For Time</Text>
              <Text style={styles.typeCount}>{filteredResults.filter(r => r.totalRounds).length}</Text>
            </View>
          )}
        </View>
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontSize: 28,
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
  qualityCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
  },
  qualityBarContainer: {
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  qualityBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  qualityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  recordDetails: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  recordDate: {
    fontSize: 12,
    color: '#999',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingVertical: 16,
    gap: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: '100%',
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
  },
  barCount: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  typeLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  typeCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default StatsDetailScreen;
