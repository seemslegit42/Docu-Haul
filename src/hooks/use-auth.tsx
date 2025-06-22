'use client';

import type { User } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true, isPremium: false, isAdmin: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase was initialized correctly.
    // If auth is null, it means Firebase config is missing.
    if (!auth) {
      // We stop loading and treat the user as unauthenticated.
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Check for custom claims to determine premium status
        const idTokenResult = await user.getIdTokenResult();
        // A backend function (e.g., a Cloud Function triggered by Stripe)
        // would be needed to set this custom claim.
        const isUserPremium = idTokenResult.claims.premium === true;
        const isUserAdmin = idTokenResult.claims.admin === true;
        setIsPremium(isUserPremium);
        setIsAdmin(isUserAdmin);
      } else {
        setUser(null);
        setIsPremium(false);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isPremium, isAdmin }}>
      {children}
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
