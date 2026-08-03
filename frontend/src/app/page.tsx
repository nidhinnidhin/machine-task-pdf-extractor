"use client";

import { useEffect, useState } from "react";
import { AuthActions } from "@/actions/auth.action";
import { PublicOnlyRoute } from "@/components/guards";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state on mount — handles bfcache restoring isLoading=true
  // from when the user clicked the Google login button before being redirected
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    AuthActions.initiateGoogleLogin();
  };

  return (
    <PublicOnlyRoute>
      <div className="min-h-screen w-full bg-[#030014] text-slate-100 flex flex-col md:flex-row relative overflow-hidden font-sans">
        {/* Background Ambient Glowing Auroras */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-aurora-1 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[130px] animate-aurora-2 pointer-events-none" />
        <div className="absolute top-[40%] right-[30%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px] animate-aurora-3 pointer-events-none" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1b4b12,#030014_90%)] pointer-events-none" />

        {/* Left Column: Visual Showcase (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col justify-between p-12 lg:p-20 w-1/2 relative z-10 select-none border-r border-white/5 bg-[#030014]/40 backdrop-blur-2xl">
          {/* Feature Copy & Dashboard Graphic */}
          <div className="my-auto space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 max-w-lg">
                Extract and rebuild custom PDFs with{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  zero hassle
                </span>
                .
              </h1>
              <p className="text-slate-400 text-base lg:text-lg max-w-md font-medium leading-relaxed">
                Select target pages from multi-page documents, reorder sections, and merge them into a crisp, freshly generated PDF.
              </p>
            </div>

            {/* Interactive Mock Dashboard Graphic */}
            <div className="relative w-full max-w-md h-72 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-2xl p-6 shadow-2xl overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
              {/* Mesh pattern inside visual */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-indigo-600/10 blur-[40px] pointer-events-none group-hover:bg-indigo-600/20 transition-colors duration-500" />

              {/* Header of widget */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-slate-500 font-mono tracking-tight">
                  pdf-processor.sh
                </span>
              </div>

              {/* Sparkline & Chart Area */}
              <div className="space-y-4">
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                      Extraction Speed
                    </p>
                    <p className="text-lg font-semibold text-slate-200">
                      120 pgs/sec
                    </p>
                  </div>
                  {/* SVG Graph path */}
                  <svg
                    className="w-24 h-8 text-indigo-400"
                    viewBox="0 0 100 30"
                    fill="none"
                  >
                    <path
                      d="M0 25 C10 20, 15 5, 25 15 C35 25, 45 10, 55 22 C65 30, 75 8, 85 12 C95 15, 98 2, 100 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M0 25 C10 20, 15 5, 25 15 C35 25, 45 10, 55 22 C65 30, 75 8, 85 12 C95 15, 98 2, 100 5 L100 30 L0 30 Z"
                      fill="url(#gradient-chart)"
                      opacity="0.1"
                    />
                    <defs>
                      <linearGradient
                        id="gradient-chart"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Status Row Stack */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs bg-white/[0.01] border border-white/[0.03] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      <span className="text-slate-300 font-medium">
                        Parse Source Pages [1, 4, 7..12]
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      Success
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs bg-white/[0.01] border border-white/[0.03] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-500/50" />
                      <span className="text-slate-300 font-medium">
                        Compile Output PDF Document
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 animate-pulse">
                      Building
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Status pill */}
              <div className="absolute top-24 right-4 bg-purple-500/10 border border-purple-500/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2 text-[10px] font-semibold text-purple-300 shadow-lg shadow-black/20 animate-float">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                Lossless Compression
              </div>

              {/* Another Floating badge */}
              <div className="absolute bottom-6 left-12 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2 text-[10px] font-semibold text-cyan-300 shadow-lg shadow-black/20 animate-float-delayed">
                <svg
                  className="w-3 h-3 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Document Ready
              </div>
            </div>
          </div>

          {/* Footer Meta */}
          <div className="text-slate-500 text-xs font-mono">
            © {new Date().getFullYear()} PDF Extractor Inc. All rights reserved.
          </div>
        </div>

        {/* Right Column: Interactive Login Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
          {/* Mobile Header Branding (Shown only on small screens) */}
          <div className="flex md:hidden items-center gap-2.5 mb-12 animate-fade-in-up">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-lg font-black tracking-widest text-white">
              PDF EXTRACTOR
            </span>
          </div>

          {/* Floating background spot behind the card */}
          <div className="absolute w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />

          {/* Glassmorphic Auth Card */}
          <div className="max-w-md w-full backdrop-blur-2xl bg-white/[0.02] border border-white/[0.07] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-indigo-500/5">
            {/* Top highlight glow */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-80" />

            {/* Glowing border detail for hover */}
            <div className="absolute -inset-x-20 top-[-100px] h-[150px] bg-indigo-500/10 blur-[40px] rounded-full opacity-60 pointer-events-none" />

            {/* Form Header */}
            <div className="space-y-3.5 mb-9 text-center md:text-left relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-200">
                Welcome back
              </h2>
            </div>

            {/* Action Button Section */}
            <div className="space-y-6 relative z-10">
              {/* Continue with Google Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 p-[1.5px] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-80 disabled:pointer-events-none"
              >
                {/* Shimmer Border background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-shimmer" />

                {/* Button core content */}
                <div className="relative flex items-center justify-center gap-3.5 w-full bg-[#07060d]/90 hover:bg-[#07060d]/60 text-white rounded-[14px] py-3.5 px-5 font-semibold text-sm transition-all duration-300">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4.5"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="tracking-wide text-slate-200">
                        Connecting securely...
                      </span>
                    </>
                  ) : (
                    <>
                      {/* Google Logo Vector */}
                      <svg
                        className="w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="tracking-wide text-slate-100">
                        Continue with Google
                      </span>
                    </>
                  )}
                </div>
              </button>

              {/* Quick Security Badge */}
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs py-1 border border-white/[0.02] bg-white/[0.01] rounded-xl font-mono">
                <svg
                  className="w-3.5 h-3.5 text-indigo-400/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Secure SSL auth by Google
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-8 z-10">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-white/[0.06]"></div>
              </div>
            </div>
          </div>

          {/* Mobile footer (Shown only on small screens) */}
          <div className="mt-16 text-slate-600 text-xs font-mono md:hidden select-none">
            © {new Date().getFullYear()} PDF Extractor Inc.
          </div>
        </div>
      </div>
    </PublicOnlyRoute>
  );
}