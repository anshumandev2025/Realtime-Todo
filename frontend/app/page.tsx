"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] text-center px-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 mt-5">
        Manage Projects in <span className="text-primary">Realtime</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-[600px] mb-10">
        A Trello-like project management board built for speed, collaboration,
        and simplicity
        keep everyone on the same page instantly.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {isAuthenticated ? (
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
              Go to Dashboard →
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                Get Started For Free
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 text-base"
              >
                Log In to Account
              </Button>
            </Link>
          </>
        )}
      </div>

      <div className="mt-20 w-full max-w-4xl h-[400px] bg-muted/30 rounded-xl border border-border shadow-2xl relative overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground text-sm">— Live Board Preview —</p>
      </div>
    </div>
  );
}
