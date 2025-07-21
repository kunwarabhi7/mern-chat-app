"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/Auth.Context";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, signup, loading, error: authError } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    console.log("Signup page check:", { user, loading });
    if (!loading && user) {
      console.log("User already logged in, redirecting to /chat");
      router.push("/chat");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", { username, email, password, loading });
    try {
      await signup(username, email, password);
      router.push("/chat");
    } catch (err: any) {
      console.error("Signup failed:", err.message);
      setPassword(""); // Clear password on failure
    }
  };

  const isDisabled = loading || !username || !email || !password;
  console.log("Button state:", {
    loading,
    username,
    email,
    password,
    isDisabled,
    authError,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-500 dark:text-blue-400">
            Signup
          </CardTitle>
        </CardHeader>
        <CardContent>
          {authError && (
            <p key={authError} className="text-red-500 mb-4">
              {authError}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  console.log("Username input:", e.target.value);
                  setUsername(e.target.value);
                }}
                className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  console.log("Email input:", e.target.value);
                  setEmail(e.target.value);
                }}
                className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  console.log("Password input:", e.target.value);
                  setPassword(e.target.value);
                }}
                className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-required="true"
              />
            </div>
            <Button type="submit" disabled={isDisabled} className="w-full">
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Signing up...
                </span>
              ) : (
                "Signup"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
