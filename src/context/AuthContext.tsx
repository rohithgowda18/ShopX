import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  setUserRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  devLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDevRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (isDevRef.current) return;
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const setUserRole = async (role: UserRole) => {
    if (!currentUser) return;
    const profile: UserProfile = {
      id: currentUser.uid,
      name: currentUser.displayName || 'User',
      phone: currentUser.phoneNumber || '',
      role,
      preferredLanguage: 'en',
      createdAt: Date.now(),
    };
    if (!isDevRef.current) {
      await setDoc(doc(db, 'users', currentUser.uid), profile);
    }
    setUserProfile(profile);
  };

  const devLogin = (role: UserRole) => {
    if (!import.meta.env.DEV) {
      console.warn('Dev login is disabled in production builds');
      return;
    }
    isDevRef.current = true;
    const mockUid = 'dev-' + role;
    const mockUser = { uid: mockUid, displayName: 'Dev ' + role, phoneNumber: '+910000000000' } as User;
    setCurrentUser(mockUser);
    setUserProfile({
      id: mockUid,
      name: 'Dev ' + (role === 'customer' ? 'Customer' : 'Shop Owner'),
      phone: '+910000000000',
      role,
      preferredLanguage: 'en',
      createdAt: Date.now(),
    });
    setLoading(false);
  };

  const signOut = async () => {
    if (isDevRef.current) {
      isDevRef.current = false;
      setCurrentUser(null);
      setUserProfile(null);
    } else {
      await firebaseSignOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, setUserRole, signOut, devLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
