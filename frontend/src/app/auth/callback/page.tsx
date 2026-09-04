"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * /auth/callback
 *
 * This page is the OAuth redirect target in production only.
 *
 * WHY THIS EXISTS:
 * The backend (AWS / pdf.nidhintech.site) and the frontend (Vercel /
 * machine-task-pdf-extractor.vercel.app) are on different domains.
 * Browsers do NOT share cookies across different domains, so httpOnly
 * cookies set by the backend cannot be read by the Next.js middleware
 * running on the Vercel domain.
 *
 * SOLUTION:
 * The backend redirects here with the JWT tokens as URL search params.
 * This page reads them, stores the access_token in a regular (non-httpOnly)
 * cookie on the CURRENT domain (Vercel), which the Next.js middleware CAN read,
 * then replaces the URL with /dashboard to prevent token leakage in browser history.
 */
function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken) {
      // No token — something went wrong, go back to login
      router.replace("/");
      return;
    }

    // ── Set access_token cookie on the Vercel domain ──────────────────────
    // This cookie is readable by Next.js middleware (not httpOnly by design,
    // because middleware needs to check it to decide on redirects).
    // Expiry: 15 minutes (matches JWT_ACCESS_EXPIRES_IN)
    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000);
    document.cookie = `access_token=${accessToken}; path=/; expires=${accessExpiry.toUTCString()}; SameSite=Lax; Secure`;

    // ── Store refresh token ───────────────────────────────────────────────
    // The refresh token is stored in sessionStorage so the api-client
    // can send it to the backend /auth/refresh endpoint when the access
    // token expires. Storing it in a cookie is also acceptable.
    if (refreshToken) {
      // 7 days (matches JWT_REFRESH_EXPIRES_IN)
      const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = `refresh_token=${refreshToken}; path=/auth/refresh; expires=${refreshExpiry.toUTCString()}; SameSite=Lax; Secure`;
    }

    // ── Redirect to dashboard, replacing history so the token URL is gone ─
    router.replace("/dashboard");
  }, [searchParams, router]);

  return (
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
        <p className="text-slate-400 font-mono text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
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
            <p className="text-slate-400 font-mono text-sm">Completing sign-in...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
