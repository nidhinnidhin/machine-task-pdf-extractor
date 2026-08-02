"use client";

import { useAuth } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/guards";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030014] text-slate-100 font-sans relative overflow-hidden flex flex-col">
      {/* Ambient background blur */}
      <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Navigation bar */}
      <header className="border-b border-white/10 bg-[#030014]/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="text-lg font-extrabold tracking-wider text-white">ANTIGRAVITY</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full space-y-8 relative z-10">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {user.role} Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Google Authentication verified successfully. Your HttpOnly access and refresh token sessions are active.
          </p>
        </div>

        {/* User Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-2">
            <span className="text-xs font-mono text-slate-500 uppercase">User Email</span>
            <p className="text-lg font-semibold text-slate-200 break-all">{user.email}</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-2">
            <span className="text-xs font-mono text-slate-500 uppercase">User ID</span>
            <p className="text-lg font-mono text-indigo-300 break-all text-sm">{user.id}</p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-2">
            <span className="text-xs font-mono text-slate-500 uppercase">Account Created</span>
            <p className="text-lg font-semibold text-slate-200">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  </ProtectedRoute>
);
}
