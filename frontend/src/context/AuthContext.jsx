// Feature 1 (Sprint 1) - Frontend auth state + JWT session handling - Owner: MUNEEM
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API, setToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("clubDiaryAuth");
    return saved ? JSON.parse(saved) : { token: "", user: null };
  });

  useEffect(() => {
    setToken(auth.token || "");
  }, [auth.token]);

  const persistAuth = (next) => {
    setAuth(next);
    if (next.token) localStorage.setItem("clubDiaryAuth", JSON.stringify(next));
    else localStorage.removeItem("clubDiaryAuth");
  };

  const login = async (payload, isRegister = false) => {
    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    const { data } = await API.post(endpoint, payload);
    persistAuth({ token: data.token, user: data.user });
    return data.user;
  };

  const logout = () => {
    persistAuth({ token: "", user: null });
  };

  const patchUser = (partial) => {
    setAuth((prev) => {
      if (!prev.user) return prev;
      const next = { ...prev, user: { ...prev.user, ...partial } };
      localStorage.setItem("clubDiaryAuth", JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(() => ({ auth, login, logout, patchUser }), [auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
