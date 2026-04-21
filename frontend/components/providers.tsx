"use client";

// Simple pass-through — no QueryClient needed anymore.
// Kept as a named component so future global providers (e.g. theme, modal root)
// can be added here without touching layout.tsx.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
