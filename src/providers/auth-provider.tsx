"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types/api";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await api.get<User>("/users/me");
      return res.data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setAuthError(
          err.message || "Your account is deactivated. Contact the owner."
        );
        try {
          await signOut(getFirebaseAuth());
        } catch {
          // ignore; state will reconcile via onAuthStateChanged
        }
      }
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await fetchCurrentUser();
    setUser(fresh);
  }, [fetchCurrentUser]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const dbUser = await fetchCurrentUser();
        setUser(dbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [configured, fetchCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    setAuthError(null);
    await signInWithEmailAndPassword(auth, email, password);
    // Verify the backend accepts this account. If it's deactivated, sign the
    // user back out of Firebase and surface a specific error to the caller.
    try {
      await api.get<User>("/users/me");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        try {
          await signOut(auth);
        } catch {
          // ignore
        }
        const message =
          err.message || "Your account is deactivated. Contact the owner.";
        setAuthError(message);
        throw new ApiError(403, message);
      }
      throw err;
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      setAuthError(null);
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
        await cred.user.getIdToken(true);
        const fresh = await fetchCurrentUser();
        setUser(fresh);
      }
    },
    [fetchCurrentUser]
  );

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    setAuthError(null);
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      user,
      loading,
      configured,
      authError,
      clearAuthError,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [
      firebaseUser,
      user,
      loading,
      configured,
      authError,
      clearAuthError,
      login,
      signup,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
