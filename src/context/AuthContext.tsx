'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/mockData';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, fullName: string, role: UserRole) => Promise<boolean>;
  signInWithGoogle: (role?: UserRole) => Promise<boolean>;
  setupPhoneRecaptcha: (containerId: string) => RecaptchaVerifier | null;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult | null>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, code: string, fullName?: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUserRole: (role: UserRole) => Promise<void>;
  quickLoginAs: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync server session from /api/auth/me on mount
  useEffect(() => {
    async function checkServerSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAppUser({
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.fullName,
              role: data.user.role,
              phoneNumber: data.user.phoneNumber || '',
              phoneVerified: Boolean(data.user.phoneVerified),
              isActive: true,
              createdAt: data.user.createdAt || new Date().toISOString(),
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Session check error:', err);
      }

      setAppUser(null);
      setLoading(false);
    }

    checkServerSession();
  }, []);

  // Sync Firebase Auth state if configured
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user && !appUser) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              setAppUser(userSnap.data() as User);
            }
          } catch (err: any) {
            console.warn('Firestore fetch failed:', err.message);
          }
        }
      });
    } catch (err: any) {
      console.warn('Firebase Auth state listener error:', err.message);
    }

    return () => unsubscribe();
  }, [appUser]);

  // 1. Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        setAppUser(snap.data() as User);
      }
      return true;
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      setError(err.message || 'Failed to sign in with email/password');
      return false;
    }
  };

  // 2. Email & Password Sign Up
  const signUpWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole = 'customer'
  ): Promise<boolean> => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: fullName });

      const newUser: User = {
        id: cred.user.uid,
        email,
        phoneNumber: '',
        phoneVerified: false,
        fullName,
        role,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), newUser);
      } catch (e) {
        console.warn('Could not write new user to Firestore directly:', e);
      }

      setAppUser(newUser);
      return true;
    } catch (err: any) {
      console.error('Email sign-up error:', err);
      setError(err.message || 'Failed to create account');
      return false;
    }
  };

  // 3. Google Sign-In
  const signInWithGoogle = async (role: UserRole = 'customer'): Promise<boolean> => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        setAppUser(snap.data() as User);
      } else {
        const newUser: User = {
          id: user.uid,
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          phoneVerified: !!user.phoneNumber,
          fullName: user.displayName || 'Google User',
          role,
          isActive: true,
          avatarUrl: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, newUser);
        } catch (e) {
          console.warn('Error saving Google user to Firestore:', e);
        }
        setAppUser(newUser);
      }
      return true;
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to authenticate with Google');
      return false;
    }
  };

  // 4. Phone Authentication with reCAPTCHA
  const setupPhoneRecaptcha = (containerId: string): RecaptchaVerifier | null => {
    try {
      if (typeof window === 'undefined') return null;
      // Clear existing if any
      const existingVerifier = (window as any).recaptchaVerifier;
      if (existingVerifier) {
        existingVerifier.clear();
      }

      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
        },
      });
      (window as any).recaptchaVerifier = verifier;
      return verifier;
    } catch (err: any) {
      console.error('reCAPTCHA setup error:', err);
      setError(err.message || 'Failed to initialize phone verification');
      return null;
    }
  };

  const sendPhoneOtp = async (
    phoneNumber: string,
    appVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult | null> => {
    setError(null);
    try {
      // Ensure phone number includes country code e.g. +91
      const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/^0+/, '')}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formatted, appVerifier);
      return confirmationResult;
    } catch (err: any) {
      console.error('Phone OTP error:', err);
      setError(err.message || 'Failed to send OTP to the provided phone number');
      return null;
    }
  };

  const confirmPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    code: string,
    fullName: string = 'Phone User',
    role: UserRole = 'customer'
  ): Promise<boolean> => {
    setError(null);
    try {
      const cred = await confirmationResult.confirm(code);
      const user = cred.user;

      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        setAppUser(snap.data() as User);
      } else {
        const newUser: User = {
          id: user.uid,
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          phoneVerified: true,
          fullName,
          role,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, newUser);
        } catch (e) {
          console.warn('Error saving Phone user:', e);
        }
        setAppUser(newUser);
      }
      return true;
    } catch (err: any) {
      console.error('Phone OTP verification error:', err);
      setError(err.message || 'Invalid OTP code. Please check and try again.');
      return false;
    }
  };

  // 5. Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    setFirebaseUser(null);
    setAppUser(null);
    window.location.href = '/login';
  };

  // 6. Role Switcher for testing/multi-role access
  const switchUserRole = async (newRole: UserRole) => {
    if (appUser) {
      const updated = { ...appUser, role: newRole };
      setAppUser(updated);
      try {
        await updateDoc(doc(db, 'users', appUser.id), { role: newRole });
      } catch (e) {
        // local update suffices if permissions are restricted
      }
    }
  };

  // 7. Quick Role Login for Instant Demo / Testing
  const quickLoginAs = (role: UserRole) => {
    const demo = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setAppUser({ ...demo, role });
    setError(null);
  };

  // 8. Password Reset Email
  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        loading,
        error,
        clearError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        setupPhoneRecaptcha,
        sendPhoneOtp,
        confirmPhoneOtp,
        logout,
        switchUserRole,
        quickLoginAs,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
