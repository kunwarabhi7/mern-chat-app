"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/Auth.Context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Submitting login with:", { email, password });
      await login(email, password);
      router.push("/chat");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      setPassword(""); // Clear password on failure
    }
  };

  const handleInputChange = () => setError(null);

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-blue-500 dark:text-blue-400">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  setEmail(e.target.value);
                  handleInputChange();
                  console.log("Email updated:", e.target.value);
                }}
                className="bg-gray-100 dark:bg-gray-700"
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
                  setPassword(e.target.value);
                  handleInputChange();
                  console.log("Password updated:", e.target.value);
                }}
                className="bg-gray-100 dark:bg-gray-700"
                aria-required="true"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full"
            >
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
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
