"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/Auth.Context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const { user, loading, logout, error: authError } = useAuth();
  const router = useRouter();
  useEffect(() => {
    console.log("Profile page check:", { user, loading, authError });
  }, [user, loading, authError]);

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await logout();
      router.push("/login");
    } catch (err: any) {
      console.error("Logout failed:", err.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-500 dark:text-blue-400">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {authError && (
              <p key={authError} className="text-red-500 mb-4">
                {authError}
              </p>
            )}
            {user ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Username:</strong> {user.username}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Email:</strong> {user.email}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </Button>
                <p className="mt-4 text-center">
                  Back to{" "}
                  <a href="/chat" className="text-blue-500 hover:underline">
                    Chat
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                No user data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default page;
