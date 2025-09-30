import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {userService, workoutService, progressService, User, UserProgress} from '../services/api';
import {useUser} from '../context/UserContext';

const {width} = Dimensions.get('window');

const ProfileScreen = () => {
  const {userId} = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyGoal: 150,
    weeklyProgress: 0,
  });
  const [recentActivity, setRecentActivity] = useState<UserProgress[]>([]);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const users = await userService.getAllUsers();
      if (users.length > 0) {
        const currentUser = users[0];
        setUser(currentUser);
        setUserForm({
          username: currentUser.username,
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
        });

        // Load progress data
        const progressData = await progressService.getUserProgress(currentUser.id);

        // Calculate stats
        const totalWorkouts = progressData.length;
        const totalMinutes = progressData.reduce((sum, p) => sum + p.duration, 0);

        // Calculate weekly progress (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyMinutes = progressData
          .filter(p => new Date(p.completedAt) >= weekAgo)
          .reduce((sum, p) => sum + p.duration, 0);

        // Calculate streak
        const sortedProgress = [...progressData].sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate: Date | null = null;

        sortedProgress.forEach(p => {
          const pDate = new Date(p.completedAt);
          pDate.setHours(0, 0, 0, 0);

          if (!lastDate) {
            tempStreak = 1;
            currentStreak = 1;
          } else {
            const dayDiff = Math.floor((lastDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
              tempStreak++;
              if (lastDate.toDateString() === new Date().toDateString() ||
                  lastDate.getTime() === new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
                currentStreak = tempStreak;
              }
            } else if (dayDiff > 1) {
              tempStreak = 1;
            }
          }
          longestStreak = Math.max(longestStreak, tempStreak);
          lastDate = pDate;
        });

        setStats({
          totalWorkouts,
          totalMinutes,
          currentStreak,
          longestStreak,
          weeklyGoal: 150,
          weeklyProgress: weeklyMinutes,
        });

        setRecentActivity(progressData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (user) {
      setUserForm({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      setModalVisible(true);
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.username.trim() || !userForm.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const userData = {
        username: userForm.username.trim(),
        email: userForm.email.trim(),
        firstName: userForm.firstName.trim(),
        lastName: userForm.lastName.trim(),
      };

      if (user) {
        const updatedUser = await userService.updateUser(user.id, userData);
        setUser(updatedUser);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        const newUser = await userService.createUser(userData);
        setUser(newUser);
        Alert.alert('Success', 'Profile created successfully');
      }

      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
      console.error('Error saving user:', error);
    }
  };

  const createNewProfile = () => {
    setUserForm({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
    });
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const weeklyProgressPercent = Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {user ? (
          <>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.firstName[0]}{user.lastName[0]}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editAvatarButton}>
                  <Icon name="camera-alt" size={16} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>@{user.username}</Text>
              <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                <Icon name="edit" size={16} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Weekly Goal Progress */}
            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View>
                  <Text style={styles.goalTitle}>Weekly Goal</Text>
                  <Text style={styles.goalSubtitle}>
                    {stats.weeklyProgress} / {stats.weeklyGoal} minutes
                  </Text>
                </View>
                <View style={styles.goalPercentBadge}>
                  <Text style={styles.goalPercentText}>{Math.round(weeklyProgressPercent)}%</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, {width: `${weeklyProgressPercent}%`}]} />
              </View>
              <Text style={styles.goalMessage}>
                {weeklyProgressPercent >= 100
                  ? '🎉 Goal achieved! Keep crushing it!'
                  : `${stats.weeklyGoal - stats.weeklyProgress} minutes to go!`}
              </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="fitness-center" size={24} color="#FF6B6B" />
                </View>
                <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="schedule" size={24} color="#4ECDC4" />
                </View>
                <Text style={styles.statNumber}>{Math.round(stats.totalMinutes / 60)}h</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="local-fire-department" size={24} color="#FF9F43" />
                </View>
                <Text style={styles.statNumber}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="emoji-events" size={24} color="#FFD93D" />
                </View>
                <Text style={styles.statNumber}>{stats.longestStreak}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                <View style={[styles.achievementBadge, stats.totalWorkouts >= 1 && styles.achievementUnlocked]}>
                  <Icon name="star" size={32} color={stats.totalWorkouts >= 1 ? "#FFD93D" : "#ddd"} />
                  <Text style={styles.achievementText}>First Workout</Text>
                </View>
                <View style={[styles.achievementBadge, stats.totalWorkouts >= 10 && styles.achievementUnlocked]}>
                  <Icon name="trending-up" size={32} color={stats.totalWorkouts >= 10 ? "#4ECDC4" : "#ddd"} />
                  <Text style={styles.achievementText}>10 Workouts</Text>
                </View>
                <View style={[styles.achievementBadge, stats.currentStreak >= 7 && styles.achievementUnlocked]}>
                  <Icon name="local-fire-department" size={32} color={stats.currentStreak >= 7 ? "#FF6B6B" : "#ddd"} />
                  <Text style={styles.achievementText}>Week Streak</Text>
                </View>
                <View style={[styles.achievementBadge, stats.totalMinutes >= 300 && styles.achievementUnlocked]}>
                  <Icon name="timer" size={32} color={stats.totalMinutes >= 300 ? "#9B59B6" : "#ddd"} />
                  <Text style={styles.achievementText}>5 Hours</Text>
                </View>
                <View style={[styles.achievementBadge, stats.totalWorkouts >= 50 && styles.achievementUnlocked]}>
                  <Icon name="emoji-events" size={32} color={stats.totalWorkouts >= 50 ? "#F39C12" : "#ddd"} />
                  <Text style={styles.achievementText}>Champion</Text>
                </View>
              </ScrollView>
            </View>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {recentActivity.map((activity, index) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityIconContainer}>
                      <Icon name="fitness-center" size={20} color="#007AFF" />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>Workout Completed</Text>
                      <Text style={styles.activityDate}>{formatDate(activity.completedAt)}</Text>
                    </View>
                    <View style={styles.activityDuration}>
                      <Text style={styles.activityDurationText}>{activity.duration}m</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIconContainer}>
                  <Icon name="notifications" size={24} color="#007AFF" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Notifications</Text>
                  <Text style={styles.actionSubtitle}>Manage your notifications</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIconContainer}>
                  <Icon name="emoji-events" size={24} color="#FFD93D" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Goals & Targets</Text>
                  <Text style={styles.actionSubtitle}>Set your fitness goals</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIconContainer}>
                  <Icon name="share" size={24} color="#4ECDC4" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Share Progress</Text>
                  <Text style={styles.actionSubtitle}>Share with friends</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIconContainer}>
                  <Icon name="help" size={24} color="#9B59B6" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Help & Support</Text>
                  <Text style={styles.actionSubtitle}>Get help and FAQs</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomPadding} />
          </>
        ) : (
          <View style={styles.noProfileContainer}>
            <Icon name="person-outline" size={80} color="#ccc" />
            <Text style={styles.noProfileText}>No profile found</Text>
            <Text style={styles.noProfileSubtext}>Create your profile to start tracking</Text>
            <TouchableOpacity style={styles.createProfileButton} onPress={createNewProfile}>
              <Icon name="add" size={20} color="white" />
              <Text style={styles.createProfileButtonText}>Create Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {user ? 'Edit Profile' : 'Create Profile'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Username *"
              value={userForm.username}
              onChangeText={text => setUserForm({...userForm, username: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={userForm.email}
              onChangeText={text => setUserForm({...userForm, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={userForm.firstName}
              onChangeText={text => setUserForm({...userForm, firstName: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={userForm.lastName}
              onChangeText={text => setUserForm({...userForm, lastName: text})}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveUser}
              >
                <Text style={styles.saveButtonText}>
                  {user ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E3F2FD',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  goalCard: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  goalPercentBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalPercentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E8F4FD',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  goalMessage: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    margin: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  achievementsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  achievementBadge: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    opacity: 0.5,
  },
  achievementUnlocked: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  achievementText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 13,
    color: '#666',
  },
  activityDuration: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activityDurationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
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
    color: '#1a1a1a',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  noProfileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 80,
  },
  noProfileText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 8,
  },
  noProfileSubtext: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  createProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
});

export default ProfileScreen;
