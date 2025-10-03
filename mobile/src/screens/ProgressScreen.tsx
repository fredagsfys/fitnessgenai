import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  userService,
  workoutService,
  advancedWorkoutResultService,
  AdvancedWorkoutResult,
} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

const {width} = Dimensions.get('window');
type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProgressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [results, setResults] = useState<AdvancedWorkoutResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const hardcodedUserId = '00000000-0000-0000-0000-000000000001';
      const data = await advancedWorkoutResultService.getResultsByUser(hardcodedUserId);
      setResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Last 7 days for recent activity
  const recentResults = results
    .filter(r => {
      const date = new Date(r.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Stats - all time
  const totalWorkouts = results.length;
  const totalVolume = results.reduce((sum, r) => sum + (r.totalVolumeLoad || 0), 0);
  const thisWeekWorkouts = recentResults.length;

  // Streak calculation
  const getStreak = () => {
    if (results.length === 0) return 0;
    const dates = [...new Set(results.map(r => r.date))].sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );
    let streak = 0;
    let currentDate = new Date();
    for (const dateStr of dates) {
      const workoutDate = new Date(dateStr);
      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1 + streak) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) return `${daysDiff} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWorkoutTypeIcon = (result: AdvancedWorkoutResult) => {
    if (result.emomMinutesCompleted !== undefined) return 'schedule';
    if (result.tabataRoundsCompleted !== undefined) return 'flash-on';
    if (result.circuitRoundsCompleted !== undefined) return 'repeat';
    if (result.totalRounds !== undefined) return 'loop';
    return 'fitness-center';
  };

  const getWorkoutTypeColor = (result: AdvancedWorkoutResult) => {
    if (result.emomMinutesCompleted !== undefined) return '#00BCD4';
    if (result.tabataRoundsCompleted !== undefined) return '#E74C3C';
    if (result.circuitRoundsCompleted !== undefined) return '#4ECDC4';
    if (result.totalRounds !== undefined) return '#FF9F43';
    return '#007AFF';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => navigation.navigate('StatsDetail' as any, { results })}
        >
          <Icon name="analytics" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Stats */}
        <View style={styles.heroSection}>
          <View style={styles.heroStat}>
            <Text style={styles.heroNumber}>{totalWorkouts}</Text>
            <Text style={styles.heroLabel}>Total Workouts</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <View style={styles.streakContainer}>
              <Icon name="local-fire-department" size={32} color="#FF6B6B" />
              <Text style={styles.heroNumber}>{getStreak()}</Text>
            </View>
            <Text style={styles.heroLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsSection}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatNumber}>{thisWeekWorkouts}</Text>
            <Text style={styles.quickStatLabel}>This Week</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatNumber}>{Math.round(totalVolume / 1000)}k</Text>
            <Text style={styles.quickStatLabel}>Total Volume</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {results.length > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory' as any, { results })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentResults.length > 0 ? (
            recentResults.map((result) => {
              const workoutTypeColor = getWorkoutTypeColor(result);
              const workoutTypeIcon = getWorkoutTypeIcon(result);

              return (
                <TouchableOpacity
                  key={result.id}
                  style={styles.activityCard}
                  onPress={() => navigation.navigate('WorkoutDetail' as any, { result })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.activityIcon, { backgroundColor: workoutTypeColor + '15' }]}>
                    <Icon name={workoutTypeIcon} size={24} color={workoutTypeColor} />
                  </View>

                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {result.sessionTitle || 'Workout'}
                    </Text>
                    <Text style={styles.activityDate}>{formatDate(result.date)}</Text>
                  </View>

                  <View style={styles.activityStats}>
                    {result.totalDurationSeconds && (
                      <View style={styles.activityStat}>
                        <Icon name="schedule" size={14} color="#999" />
                        <Text style={styles.activityStatText}>
                          {Math.round(result.totalDurationSeconds / 60)}m
                        </Text>
                      </View>
                    )}
                    {result.totalVolumeLoad && (
                      <View style={styles.activityStat}>
                        <Icon name="fitness-center" size={14} color="#999" />
                        <Text style={styles.activityStatText}>
                          {Math.round(result.totalVolumeLoad)}kg
                        </Text>
                      </View>
                    )}
                  </View>

                  <Icon name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Icon name="fitness-center" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySubtext}>Start your first workout!</Text>
            </View>
          )}
        </View>

        {/* Insights Card */}
        {results.length > 0 && (
          <TouchableOpacity
            style={styles.insightsCard}
            onPress={() => navigation.navigate('StatsDetail' as any, { results })}
          >
            <View style={styles.insightsHeader}>
              <Icon name="insights" size={24} color="#007AFF" />
              <Text style={styles.insightsTitle}>View Detailed Stats</Text>
            </View>
            <Text style={styles.insightsSubtext}>
              See your personal records, charts, and analytics
            </Text>
            <Icon name="arrow-forward" size={20} color="#007AFF" style={styles.insightsArrow} />
          </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  statsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  heroDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickStatsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  },
  seeAllText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 13,
    color: '#999',
  },
  activityStats: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 12,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityStatText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  insightsCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  insightsSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  insightsArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
  },
});

export default ProgressScreen;
