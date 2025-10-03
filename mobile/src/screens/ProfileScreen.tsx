import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {advancedWorkoutResultService, AdvancedWorkoutResult} from '../services/api';

const ProfileScreen = () => {
  const [results, setResults] = useState<AdvancedWorkoutResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // Track if user is registered
  const [userName, setUserName] = useState('Anonymous');

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

  // Calculate lifetime stats
  const totalWorkouts = results.length;
  const totalDuration = results.reduce((sum, r) => sum + (r.totalDurationSeconds || 0), 0);

  // Current streak
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

  // Longest streak
  const getLongestStreak = () => {
    if (results.length === 0) return 0;
    const dates = [...new Set(results.map(r => r.date))].sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );
    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i + 1]);
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    return Math.max(longestStreak, currentStreak);
  };

  // Member since
  const getMemberSince = () => {
    if (results.length === 0) return 'Just started';
    const oldestDate = new Date(Math.min(...results.map(r => new Date(r.date).getTime())));
    const monthsAgo = Math.floor((new Date().getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (monthsAgo === 0) return 'This month';
    if (monthsAgo < 12) return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
    const yearsAgo = Math.floor(monthsAgo / 12);
    return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
  };

  // Average workout quality
  const getAvgQuality = () => {
    const withQuality = results.filter(r => r.workoutQuality);
    if (withQuality.length === 0) return 0;
    return withQuality.reduce((sum, r) => sum + (r.workoutQuality || 0), 0) / withQuality.length;
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {isRegistered ? userName.split(' ').map(n => n[0]).join('') : '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {isRegistered ? (
            <>
              <Text style={styles.userEmail}>@{userName.toLowerCase().replace(' ', '')}</Text>
              <View style={styles.memberBadge}>
                <Icon name="verified" size={16} color="#007AFF" />
                <Text style={styles.memberText}>Member since {getMemberSince()}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.anonymousText}>Training without an account</Text>
              <TouchableOpacity style={styles.registerButton}>
                <Icon name="person-add" size={18} color="#fff" />
                <Text style={styles.registerButtonText}>Create Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Lifetime Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifetime Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="fitness-center" size={28} color="#007AFF" />
              <Text style={styles.statValue}>{totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="schedule" size={28} color="#4CAF50" />
              <Text style={styles.statValue}>{Math.round(totalDuration / 3600)}h</Text>
              <Text style={styles.statLabel}>Training Time</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="local-fire-department" size={28} color="#FF6B6B" />
              <Text style={styles.statValue}>{getStreak()}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="emoji-events" size={28} color="#FFD93D" />
              <Text style={styles.statValue}>{getLongestStreak()}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Quality Rating */}
        {getAvgQuality() > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Quality</Text>
            <View style={styles.qualityCard}>
              <View style={styles.qualityHeader}>
                <Icon name="star" size={32} color="#FFD93D" />
                <Text style={styles.qualityValue}>{getAvgQuality().toFixed(1)}/10</Text>
              </View>
              <Text style={styles.qualityLabel}>Average Rating</Text>
              <View style={styles.qualityBarContainer}>
                <View style={[styles.qualityBar, {width: `${getAvgQuality() * 10}%`}]} />
              </View>
            </View>
          </View>
        )}

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsGrid}>
            <View style={[styles.achievementCard, totalWorkouts >= 1 && styles.achievementUnlocked]}>
              <Icon name="star" size={40} color={totalWorkouts >= 1 ? "#FFD93D" : "#ddd"} />
              <Text style={styles.achievementTitle}>First Step</Text>
              <Text style={styles.achievementDesc}>Complete 1 workout</Text>
            </View>
            <View style={[styles.achievementCard, totalWorkouts >= 10 && styles.achievementUnlocked]}>
              <Icon name="trending-up" size={40} color={totalWorkouts >= 10 ? "#4ECDC4" : "#ddd"} />
              <Text style={styles.achievementTitle}>Committed</Text>
              <Text style={styles.achievementDesc}>Complete 10 workouts</Text>
            </View>
            <View style={[styles.achievementCard, getStreak() >= 7 && styles.achievementUnlocked]}>
              <Icon name="local-fire-department" size={40} color={getStreak() >= 7 ? "#FF6B6B" : "#ddd"} />
              <Text style={styles.achievementTitle}>On Fire</Text>
              <Text style={styles.achievementDesc}>7 day streak</Text>
            </View>
            <View style={[styles.achievementCard, totalWorkouts >= 50 && styles.achievementUnlocked]}>
              <Icon name="emoji-events" size={40} color={totalWorkouts >= 50 ? "#F39C12" : "#ddd"} />
              <Text style={styles.achievementTitle}>Champion</Text>
              <Text style={styles.achievementDesc}>Complete 50 workouts</Text>
            </View>
            <View style={[styles.achievementCard, getLongestStreak() >= 30 && styles.achievementUnlocked]}>
              <Icon name="military-tech" size={40} color={getLongestStreak() >= 30 ? "#9C27B0" : "#ddd"} />
              <Text style={styles.achievementTitle}>Unstoppable</Text>
              <Text style={styles.achievementDesc}>30 day streak</Text>
            </View>
            <View style={[styles.achievementCard, totalDuration >= 36000 && styles.achievementUnlocked]}>
              <Icon name="timer" size={40} color={totalDuration >= 36000 ? "#00BCD4" : "#ddd"} />
              <Text style={styles.achievementTitle}>Dedication</Text>
              <Text style={styles.achievementDesc}>10 hours trained</Text>
            </View>
          </View>
        </View>

        {/* Account & Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>

          {!isRegistered && (
            <View style={styles.anonymousBanner}>
              <Icon name="info" size={20} color="#FF9F43" />
              <View style={styles.anonymousBannerContent}>
                <Text style={styles.anonymousBannerTitle}>You're training anonymously</Text>
                <Text style={styles.anonymousBannerText}>
                  Create an account to sync across devices and never lose your progress
                </Text>
              </View>
            </View>
          )}

          {isRegistered ? (
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Icon name="person" size={24} color="#007AFF" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Edit Profile</Text>
                <Text style={styles.actionSubtitle}>Name, email, photo</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Icon name="person-add" size={24} color="#007AFF" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Create Account</Text>
                <Text style={styles.actionSubtitle}>Save your progress forever</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Icon name="emoji-events" size={24} color="#FFD93D" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Goals & Targets</Text>
              <Text style={styles.actionSubtitle}>Set weekly goals</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Icon name="notifications" size={24} color="#9C27B0" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Notifications</Text>
              <Text style={styles.actionSubtitle}>Push, email preferences</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          {isRegistered && (
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Icon name="share" size={24} color="#4CAF50" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Share App</Text>
                <Text style={styles.actionSubtitle}>Invite friends</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Icon name="help" size={24} color="#666" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Help & Support</Text>
              <Text style={styles.actionSubtitle}>FAQs, contact us</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Icon name="info" size={24} color="#999" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>About</Text>
              <Text style={styles.actionSubtitle}>Version 1.0.0</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          {isRegistered && (
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Icon name="logout" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, {color: '#FF6B6B'}]}>Sign Out</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomPadding} />
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#666',
  },
  anonymousText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  memberText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  anonymousBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9F43',
  },
  anonymousBannerContent: {
    flex: 1,
  },
  anonymousBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  anonymousBannerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
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
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  qualityCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  qualityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  qualityValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  qualityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  qualityBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  qualityBar: {
    height: '100%',
    backgroundColor: '#FFD93D',
    borderRadius: 4,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    opacity: 0.5,
  },
  achievementUnlocked: {
    opacity: 1,
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  bottomPadding: {
    height: 40,
  },
});

export default ProfileScreen;
