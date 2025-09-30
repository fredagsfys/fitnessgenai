import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../services/api';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userId: number | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  userId: null,
  isLoading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      } else {
        // Create a default demo user for PoC
        const demoUser: User = {
          id: 1,
          username: 'demo',
          email: 'demo@fitnesscoach.com',
          firstName: 'Demo',
          lastName: 'User',
        };
        setUserState(demoUser);
        await AsyncStorage.setItem('currentUser', JSON.stringify(demoUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem('currentUser');
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        userId: user?.id || null,
        isLoading,
      }}>
      {children}
    </UserContext.Provider>
  );
};