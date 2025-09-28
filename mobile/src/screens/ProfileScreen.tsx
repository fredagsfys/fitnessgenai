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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {userService, User} from '../services/api';

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
  });

  const loadUser = async () => {
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
      }
    } catch (error) {
      console.error('Error loading user:', error);
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

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {user ? (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Icon name="person" size={64} color="#007AFF" />
              </View>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                <Icon name="edit" size={20} color="white" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Information</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{user.username}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>First Name</Text>
                <Text style={styles.infoValue}>{user.firstName}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Last Name</Text>
                <Text style={styles.infoValue}>{user.lastName}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <TouchableOpacity style={styles.settingItem}>
                <Icon name="notifications" size={24} color="#666" />
                <Text style={styles.settingText}>Notifications</Text>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <Icon name="security" size={24} color="#666" />
                <Text style={styles.settingText}>Privacy & Security</Text>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <Icon name="help" size={24} color="#666" />
                <Text style={styles.settingText}>Help & Support</Text>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <Icon name="info" size={24} color="#666" />
                <Text style={styles.settingText}>About</Text>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.noProfileContainer}>
            <Icon name="person-outline" size={64} color="#ccc" />
            <Text style={styles.noProfileText}>No profile found</Text>
            <TouchableOpacity style={styles.createProfileButton} onPress={createNewProfile}>
              <Text style={styles.createProfileButtonText}>Create Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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
    </View>
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
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  noProfileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noProfileText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  createProfileButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileScreen;