import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMemo } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  principal: string | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const { identity, login, clear, loginStatus } = useInternetIdentity();

  const principal = useMemo(() => {
    if (!identity) return null;
    try {
      return identity.getPrincipal().toText();
    } catch {
      return null;
    }
  }, [identity]);

  const isAuthenticated = useMemo(() => {
    if (!principal) return false;
    return principal !== "2vxsx-fae";
  }, [principal]);

  const isLoading =
    loginStatus === "logging-in" || loginStatus === "initializing";

  return {
    isAuthenticated,
    principal,
    login,
    logout: clear,
    isLoading,
  };
}
