import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkAdminRole = async (uid: string): Promise<boolean> => {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      return adminDoc.exists() && adminDoc.data()?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  // Create admin account and store in Firestore
  const createAdminAccount = async (email: string, password: string) => {
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store admin info in Firestore
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        role: 'admin',
        createdAt: new Date(),
      });

      return user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // If account exists, just sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      }
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user is admin
        const adminStatus = await checkAdminRole(user.uid);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      // Check if this is the admin email
      const ADMIN_EMAIL = 'thedreamteamservices@gmail.com';
      const ADMIN_PASSWORD = 'DreamTeam@5';

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Try to sign in first
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // Verify admin role in Firestore
          const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
          
          if (!adminDoc.exists()) {
            // Create admin document if it doesn't exist
            await setDoc(doc(db, 'admins', userCredential.user.uid), {
              email: userCredential.user.email,
              role: 'admin',
              createdAt: new Date(),
            });
          }
        } catch (error: any) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            // Account doesn't exist, create it
            await createAdminAccount(ADMIN_EMAIL, ADMIN_PASSWORD);
          } else {
            throw error;
          }
        }
      } else {
        // Regular email/password sign in
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
