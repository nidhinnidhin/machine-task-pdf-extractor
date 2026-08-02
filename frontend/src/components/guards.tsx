"use client";

import React, { useEffect } from "react";
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
// Middleware already blocks unauthenticated access to this route.
// This guard just blocks back-button traversal through Google OAuth history
// and shows a loading state while the user profile is being fetched for the UI.
export const ProtectedRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const { loading } = useAuth();

  // Prevent browser back-button from navigating into Google OAuth history pages.
  // Each time popstate fires (back pressed), we push the current URL again.
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (loading) return <SessionLoader />;

  return <>{children}</>;
};

// ─── PublicOnlyRoute ───────────────────────────────────────────────────────────
// Middleware already blocks authenticated users from this route.
// This guard only shows a loading state while the initial session check runs.
export const PublicOnlyRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const { loading } = useAuth();

  if (loading) return <SessionLoader />;

  return <>{children}</>;
};
