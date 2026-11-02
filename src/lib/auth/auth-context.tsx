"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { components } from "@/lib/api/schema";
import { tokenStore, type User } from "@/lib/auth/token-store";
import { api } from "@/lib/api/client";

type RegisterRequest = components["schemas"]["RegisterRequest"];

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterRequest) => Promise<User>;
  loginWithOtp: (email: string, code: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const applyAuth = useCallback((access: string, refresh: string, u: User) => {
    tokenStore.setTokens(access, refresh);
    tokenStore.setUser(u);
    setUser(u);
  }, []);

  useEffect(() => {
    const stored = tokenStore.getUser();
    setUser(stored);
    setReady(true);

    // Если есть access-токен — актуализируем профиль через /auth/profile.
    if (tokenStore.getAccess()) {
      api
        .GET("/auth/profile")
        .then(({ data, error }) => {
          if (data) {
            tokenStore.setUser(data);
            setUser(data);
          } else if (error) {
            tokenStore.clear();
            setUser(null);
          }
        })
        .catch(() => {});
    }

    const onUnauthorized = () => {
      tokenStore.clear();
      setUser(null);
    };
    window.addEventListener("highlander:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("highlander:unauthorized", onUnauthorized);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await api.POST("/auth/login", {
        body: { email, password },
      });
      if (error || !data) throw error;
      applyAuth(data.access_token, data.refresh_token, data.user);
      return data.user;
    },
    [applyAuth],
  );

  const register = useCallback(
    async (input: RegisterRequest) => {
      const { data, error } = await api.POST("/auth/register", { body: input });
      if (error || !data) throw error;
      applyAuth(data.access_token, data.refresh_token, data.user);
      return data.user;
    },
    [applyAuth],
  );

  const loginWithOtp = useCallback(
    async (email: string, code: string) => {
      const { data, error } = await api.POST("/auth/otp/verify", {
        body: { email, code },
      });
      if (error || !data) throw error;
      applyAuth(data.access_token, data.refresh_token, data.user);
      return data.user;
    },
    [applyAuth],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.GET("/auth/profile");
    if (data) {
      tokenStore.setUser(data);
      setUser(data);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      loginWithOtp,
      logout,
      refreshUser,
    }),
    [user, ready, login, register, loginWithOtp, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return ctx;
}
