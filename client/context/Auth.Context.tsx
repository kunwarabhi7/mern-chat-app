// context/Auth.Context.tsx
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
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    withCredentials: true,
    timeout: 5000,
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API error:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (!error.response) {
        setError("Network error: Server unreachable");
      } else if (error.response.status === 401) {
        // Only set error for specific 401 cases, not "No token provided"
        if (
          error.response.data.message !== "No token provided" &&
          error.response.data.message !== "Token expired" &&
          error.response.data.message !== "Invalid token" &&
          error.response.data.message !== "Token is blacklisted"
        ) {
          setError(error.response.data.message || "Unauthorized");
        }
        setUser(null);
      } else if (error.response.status === 500) {
        setError(error.response.data.message || "Server error occurred");
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        setLoading(true);
        const { data } = await api.get("/user/me");
        console.log("Session check response:", data);
        setUser(data.user);
      } catch (err: any) {
        console.error("Session check error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setUser(null);
        // Suppress 401 errors for "No token provided" and similar
        if (
          err.response?.status !== 401 ||
          (err.response?.data?.message !== "No token provided" &&
            err.response?.data?.message !== "Token expired" &&
            err.response?.data?.message !== "Invalid token" &&
            err.response?.data?.message !== "Token is blacklisted")
        ) {
          setError(err.response?.data?.message || "Session check failed");
        }
      } finally {
        console.log("Session check complete, loading:", false);
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const clearError = () => {
    console.log("Clearing error state");
    setError(null);
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post("/user/signup", {
        username,
        email,
        password,
      });
      console.log("Signup response:", data);
      setUser(data.user);
      router.push("/chat");
    } catch (err: any) {
      console.error("Signup error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      const errorMessage = err.response?.data?.message || "Signup failed";
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
      console.log("Login response:", data);
      setUser(data.user);
      router.push("/chat");
    } catch (err: any) {
      console.error("Login error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      const errorMessage = err.response?.data?.message || "Login failed";
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
      console.log("Initiating logout...");
      const response = await api.post("/user/logout");
      console.log("Logout response:", response.data);
      setUser(null);
      router.push("/login");
    } catch (err: any) {
      console.error("Logout error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || "Logout failed");
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signup, login, logout, clearError }}
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
