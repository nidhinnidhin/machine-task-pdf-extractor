"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthActions } from "@/actions/auth.action";
import { UserProfile } from "@/types/auth";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await AuthActions.fetchUserProfile();
      setUser(profile);
    } catch {
      // Profile fetch failed — user is not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial session check on first mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Re-check auth when page is restored from bfcache (browser back/forward cache).
  // useEffect with [] does NOT re-run after bfcache restore, so we listen
  // for pageshow with event.persisted=true to force a fresh profile check.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetchProfile();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [fetchProfile]);

  const logout = async () => {
    try {
      await AuthActions.logoutUser();
    } catch (err: unknown) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
