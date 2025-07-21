"use client";
import { useAuth } from "@/context/Auth.Context";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }
  return user ? <>{children}</> : null;
};
