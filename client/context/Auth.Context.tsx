"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Axios instance
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true, // Send cookies
  });

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/user/me");
        setUser(data.user);
      } catch (err) {
        console.error("Session check error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const signup = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post("/user/signup", {
        username,
        email,
        password,
      });
      setUser(data.user);
      router.push("/chat");
    } catch (err: any) {
      const errorMessage =
        (err as AxiosError<{ message: string }>).response?.data?.message ||
        "Signup failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post("/user/login", { email, password });
      setUser(data.user);
      router.push("/chat");
    } catch (err: any) {
      const errorMessage =
        (err as AxiosError<{ message: string }>).response?.data?.message ||
        "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post("/user/logout");
      setUser(null);
      router.push("/login");
    } catch (err: any) {
      console.error("Logout error:", err);
      const errorMessage =
        (err as AxiosError<{ message: string }>).response?.data?.message ||
        "Logout failed";
      setError(errorMessage);
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
