"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

/**
 * Runs once on every page load (mount).
 * Silently calls /auth/refresh — if the HttpOnly refresh-token cookie is
 * still valid the backend returns a new access token + user, which we store
 * in Zustand.  If it fails we do nothing (user is simply not logged in).
 */
export default function AuthInitializer() {
  const { setUser, isAuthenticated } = useAuthStore();
  const attempted = useRef(false); // prevent double-firing in React Strict Mode

  useEffect(() => {
    if (attempted.current || isAuthenticated) return;
    attempted.current = true;

    api
      .post("/auth/refresh")
      .then(({ data }) => {
        if (data?.data?.user && data?.data?.accessToken) {
          setUser(data.data.user, data.data.accessToken);
        }
      })
      .catch(() => {
        // Refresh token expired / not present — user needs to log in manually
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // purely side-effect, no UI
}
