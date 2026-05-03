"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user,
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
