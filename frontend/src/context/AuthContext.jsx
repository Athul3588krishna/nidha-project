import React, { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
          console.warn("Session expired or invalid token:", err.message);
          // Fall back to stored user if offline, or logout if 401
          if (err.response?.status === 401) {
            logout();
          } else {
            const storedUser = localStorage.getItem("user");
            if (storedUser) setUser(JSON.parse(storedUser));
          }
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setToken(res.data.token);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const setAuthSession = (authData) => {
    if (authData?.token) {
      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData));
      setToken(authData.token);
      setUser(authData);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        return res.data;
      } catch (err) {
        console.error("Failed to refresh user:", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setAuthSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
