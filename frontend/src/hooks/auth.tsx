import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/api";
import { api, authStore } from "../services/api";
const C = createContext<any>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!authStore.get()) {
      setLoading(false);
      return;
    }
    try {
      setUser(await api.auth.me());
    } catch {
      setUser(null);
      authStore.clear();
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
    const h = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener("pea:unauthorized", h);
    return () => window.removeEventListener("pea:unauthorized", h);
  }, []);
  const login = async (email: string, password: string) => {
    const t = await api.auth.login({ email, password });
    authStore.set(t.access_token);
    await refresh();
  };
  const register = async (name: string, email: string, password: string) => {
    await api.auth.register({ name, email, password });
    await login(email, password);
  };
  return (
    <C.Provider
      value={{
        user,
        loading,
        login,
        register,
        refresh,
        logout: () => {
          authStore.clear();
          setUser(null);
        },
      }}
    >
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
