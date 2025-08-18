"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/Auth.Context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { io } from "socket.io-client";

export default function Profile() {
  const { user, setUser, updateProfilePhoto, loading, error } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Handle live update via socket
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
    });

    socket.on("userUpdated", (updatedUser) => {
      if (user && updatedUser.id === user.id) {
        setUser((prev) => (prev ? { ...prev, dp: updatedUser.dp } : prev));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, setUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (e.g., <2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;

    try {
      await updateProfilePhoto(preview); // Send Base64 string directly
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
        Please log in
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 pt-20">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-blue-500 dark:text-blue-400 text-2xl font-bold">
                Profile
              </CardTitle>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Update your profile picture
              </p>
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-center mb-4">
                <img
                  key={user.dp || "default"} // Added key to force re-render when dp changes
                  src={preview ?? user.dp ?? "/images/default-dp.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                />
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={loading || !file}
                >
                  {loading ? "Uploading..." : "Update DP"}
                </Button>
                <Button
                  asChild
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Link href="/chat">Go to Chat</Link>
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
