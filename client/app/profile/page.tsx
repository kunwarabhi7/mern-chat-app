"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/Auth.Context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import axios from "axios";
import socket from "@/lib/socket";
import Link from "next/link";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on("userUpdated", (updatedUser) => {
      console.log("Received userUpdated event:", updatedUser);
      if (user && updatedUser.id === user.id) {
        // Type guard: ensure user is not null
        setUser({
          ...user,
          dp: updatedUser.dp,
        });
      }
    });

    return () => {
      socket.off("userUpdated");
    };
  }, [user, setUser]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
        setError("Only JPEG or PNG images are allowed");
        setFile(null);
        setPreview(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      console.log("Selected file:", {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      });
    } else {
      setFile(null);
      setPreview(null);
      setError("No file selected");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("dp", file);
    console.log("FormData contents:", [...formData.entries()]);

    try {
      setLoading(true);
      setError(null);
      console.log("Uploading DP...");
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/user/dp",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (user) {
        // Type guard: ensure user is not null
        setUser({ ...user, dp: data.dp });
      }
      setFile(null);
      setPreview(null);
      console.log("DP updated:", data.dp);
    } catch (err: any) {
      console.error("Error uploading DP:", err.message, err.response?.data);
      setError(err.response?.data?.message || "Failed to upload DP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        Please log in
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 pt-16">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-blue-500 dark:text-blue-400 text-2xl sm:text-3xl font-bold">
                Profile
              </CardTitle>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Update your profile picture
              </p>
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-center mb-4">
                <img
                  src={
                    preview ||
                    (user.dp
                      ? `http://localhost:5000${user.dp}`
                      : "/images/default-dp.png")
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                />
              </div>
              <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="space-y-4"
              >
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  name="dp"
                  onChange={handleFileChange}
                  className="text-sm"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={loading || !file}
                >
                  {loading ? "Uploading..." : "Update DP"}
                </Button>
                <Link
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  href="/chat"
                >
                  Go to Chat
                </Link>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
