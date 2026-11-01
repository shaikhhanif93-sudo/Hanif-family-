import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types/accounts';

interface SignUpInput {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthContextType {
  authUser: User | null;
  profile: UserProfile | null;
  isSuperAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUpFamilyHead: (input: SignUpInput) => Promise<void>;
  signUpInvitedMember: (input: SignUpInput) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  const message = (err as { message?: string })?.message || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check your network.';
    default:
      return message || 'Something went wrong. Please try again.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      setAuthUser(user);

      if (!user) {
        setProfile(null);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Super admin is a document you create by hand in the Firebase console
      try {
        const snap = await getDoc(doc(db, 'superAdmins', user.uid));
        setIsSuperAdmin(snap.exists());
      } catch {
        setIsSuperAdmin(false);
      }

      unsubProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          setProfile(snap.exists() ? ({ ...(snap.data() as UserProfile), uid: user.uid }) : null);
          setLoading(false);
        },
        () => {
          setProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  };

  const signUpFamilyHead = async ({ name, phone, email, password }: SignUpInput) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: cleanEmail,
      name: name.trim(),
      phone: phone.trim(),
      role: 'head',
      status: 'pending',
      relation: 'Family Head',
      createdAt: serverTimestamp(),
    });
  };

  const signUpInvitedMember = async ({ name, phone, email, password }: SignUpInput) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);

    try {
      const found = await getDocs(
        query(
          collection(db, 'invites'),
          where('email', '==', cleanEmail),
          where('status', '==', 'invited')
        )
      );

      if (found.empty) {
        throw new Error('NO_INVITE');
      }

      const inviteDoc = found.docs[0];
      const invite = inviteDoc.data() as { familyId: string; relation?: string };

      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: cleanEmail,
        name: name.trim(),
        phone: phone.trim(),
        role: 'member',
        status: 'approved',
        familyId: invite.familyId,
        relation: invite.relation || 'Family Member',
        inviteId: inviteDoc.id,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'invites', inviteDoc.id), {
        status: 'accepted',
        acceptedByUid: cred.user.uid,
      });
    } catch (err) {
      // Clean up the half-created login so the person can try again
      try {
        await cred.user.delete();
      } catch {
        await fbSignOut(auth);
      }
      if ((err as Error).message === 'NO_INVITE') {
        throw new Error(
          'No invitation found for this email. Ask your family head to add this exact email address first.'
        );
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        profile,
        isSuperAdmin,
        loading,
        signIn,
        signUpFamilyHead,
        signUpInvitedMember,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
