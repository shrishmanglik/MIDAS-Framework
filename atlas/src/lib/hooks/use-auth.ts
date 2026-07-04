"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { apiClient, ApiError } from "@/lib/api/client";
import type { User, AuthState, LoginRequest } from "@/types/auth";

const AUTH_TOKEN_KEY = "atlas_token";

async function fetchUser(): Promise<User | null> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(AUTH_TOKEN_KEY)
      : null;
  if (!token) return null;

  try {
    return await apiClient.get<User>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
    throw error;
  }
}

export function useAuth(): AuthState & {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
} {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data: user,
    error,
    isLoading: swrLoading,
    mutate,
  } = useSWR("auth-user", fetchUser, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await apiClient.post<{ token: string; user: User }>(
        "/auth/login",
        credentials
      );
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await mutate(response.user, false);
    },
    [mutate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    mutate(null, false);
  }, [mutate]);

  return {
    user: user ?? null,
    isLoading: !isInitialized || swrLoading,
    isAuthenticated: !!user && !error,
    login,
    logout,
  };
}
