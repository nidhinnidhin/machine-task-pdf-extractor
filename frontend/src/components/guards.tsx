"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

interface RouteGuardProps {
  children: React.ReactNode;
}

const SessionLoader: React.FC = () => (
  <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center font-sans">
    <div className="flex flex-col items-center gap-4">
      <svg
        className="animate-spin h-8 w-8 text-indigo-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-slate-400 font-mono text-sm">Verifying session...</p>
    </div>
  </div>
);

// ─── ProtectedRoute ────────────────────────────────────────────────────────────
// Guards authenticated routes. If loading is done and user is not authenticated,
// redirects to the login page. Middleware handles this for server-side nav,
// but this guard catches bfcache restores and client-side token expiry.
export const ProtectedRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // User is not authenticated — send to login page
      router.replace("/");
    }
  }, [loading, isAuthenticated, router]);

  // Show loader while session is being checked
  if (loading) return <SessionLoader />;

  // If not authenticated, render nothing while the redirect happens
  if (!isAuthenticated) return <SessionLoader />;

  return <>{children}</>;
};

// ─── PublicOnlyRoute ───────────────────────────────────────────────────────────
// Guards the login page. If the user is already authenticated (e.g. back button
// after login, bfcache restore), redirects them to the dashboard immediately.
// This is the critical fix for the "back button returns to login" bug.
export const PublicOnlyRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // User is already logged in — push them to dashboard and replace history
      // so pressing back again does NOT return to login page.
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  // Show loader while session is being checked
  if (loading) return <SessionLoader />;

  // If authenticated, render nothing while the redirect is happening
  if (isAuthenticated) return <SessionLoader />;

  return <>{children}</>;
};
