"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api/v1";

export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<User>(
    typeof window !== "undefined" && localStorage.getItem("token")
      ? `${API_BASE_URL}/auth/me`
      : null
  );

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      localStorage.setItem("token", response.access_token);
      await mutate();
      return response;
    },
    [mutate]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data
      );
      localStorage.setItem("token", response.access_token);
      await mutate();
      return response;
    },
    [mutate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    mutate(undefined, false);
  }, [mutate]);

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
    login,
    register,
    logout,
  };
}
