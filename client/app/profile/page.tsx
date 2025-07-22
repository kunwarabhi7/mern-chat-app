// app/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/Auth.Context";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, loading, logout, error: authError, clearError } = useAuth();
  const router = useRouter();

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  // Log profile page state and clear errors
  useEffect(() => {
    console.log("Profile page check:", { user, loading, authError });
    clearError(); // Clear any leftover errors
  }, [user, loading, authError, clearError]);

  const handleLogout = async () => {
    try {
      console.log("Triggering logout...");
      await logout();
      router.push("/login");
    } catch (err: any) {
      console.error("Logout failed:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-[95vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-4 sm:mb-6"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-500 dark:text-blue-400 mb-2 sm:mb-4">
            Your Profile
          </h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
            Manage your account and connect with friends on ChatSphere!
          </p>
        </motion.div>

        {/* Card Section */}
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-blue-500 dark:text-blue-400 text-2xl sm:text-3xl font-bold text-center">
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {authError && (
                <p className="text-red-500 text-center text-sm">{authError}</p>
              )}
              {user ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                      <strong>Username:</strong> {user.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                      <strong>Email:</strong> {user.email}
                    </p>
                  </div>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={handleLogout}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 text-base sm:text-lg"
                      disabled={loading}
                    >
                      Logout
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white py-2 text-base sm:text-lg"
                    >
                      <Link href="/chat">Back to Chat</Link>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 text-center">
                  No user data available. Please{" "}
                  <Link href="/login" className="text-blue-500 hover:underline">
                    log in
                  </Link>
                  .
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
