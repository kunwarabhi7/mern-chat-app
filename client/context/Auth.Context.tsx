"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  error: string | null;
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getAllUsers: () => Promise<User[]>;
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
        setUser(null);
        if (
          ![
            "No token provided",
            "Token expired",
            "Invalid token",
            "Token is blacklisted",
          ].includes(error.response.data.message)
        ) {
          setError(error.response.data.message || "Unauthorized");
        }
      } else if (error.response.status === 500) {
        setError(error.response.data.message || "Server error occurred");
      }
      return Promise.reject(error);
    }
  );

  const checkSession = async () => {
    try {
      console.log("Checking session...");
      setLoading(true);
      const { data } = await api.get("/user/me");
      if (!data.user?.id) throw new Error("Invalid user ID");

      setUser({
        id: data.user.id.toString(),
        username: data.user.username,
        email: data.user.email,
        dp: data.user.dp || "/images/default-dp.png",
      });
    } catch (err: any) {
      console.error("Session check error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setUser(null);
      if (
        err.response?.status !== 401 ||
        ![
          "No token provided",
          "Token expired",
          "Invalid token",
          "Token is blacklisted",
        ].includes(err.response?.data?.message)
      ) {
        setError(err.response?.data?.message || "Session check failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signup = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      const { data } = await api.post("/user/signup", {
        username,
        email,
        password,
      });
      if (!data.user?.id) throw new Error("Invalid user ID in signup response");

      setUser({
        id: data.user.id.toString(),
        username: data.user.username,
        email: data.user.email,
        dp: data.user.dp || "/images/default-dp.png",
      });
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

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      const { data } = await api.post("/user/login", { username, password });
      if (!data.user?.id) throw new Error("Invalid user ID in login response");

      setUser({
        id: data.user.id.toString(),
        username: data.user.username,
        email: data.user.email,
        dp: data.user.dp || "/images/default-dp.png",
      });
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
      clearError();
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

  const getAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/user/list");
      if (!data.user) return [];

      const mappedUsers = data.user
        .map((u: any) =>
          u.id
            ? {
                id: u.id,
                username: u.username || "Unknown",
                email: u.email || "",
                dp: u.dp || "/images/default-dp.png",
                isOnline: false,
              }
            : null
        )
        .filter(Boolean);

      return mappedUsers;
    } catch (err: any) {
      console.error("Get all users error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || "Failed to fetch users");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const userMemo = useMemo(() => user, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user: userMemo,
        loading,
        error,
        signup,
        login,
        logout,
        clearError,
        setUser,
        getAllUsers,
      }}
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
