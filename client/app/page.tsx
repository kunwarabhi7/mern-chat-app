"use client";

import { useAuth } from "@/context/Auth.Context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const heroImage =
  "https://cdn.prod.website-files.com/624af442a8151d5a2ef5644c/6411ae2da44e40ce2a5f7689_chat_hero-p-1080.png";

export default function Home() {
  const { user, loading, error } = useAuth();

  // Animation variants for buttons
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  // Animation for hero section
  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-4 sm:mb-6"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-500 dark:text-blue-400 mb-2 mt-20 sm:mt-28 md:32 sm:mb-4">
          ChatApp
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
          Connect instantly, chat effortlessly, and share moments with friends!
        </p>
        <div className="relative w-full max-w-[500px] mx-auto">
          <Image
            src={heroImage}
            alt="ChatApp Hero"
            width={500}
            height={333}
            className="w-full h-auto rounded-lg shadow-lg object-contain"
            priority
          />
        </div>
      </motion.div>

      {/* Card Section */}
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-blue-500 dark:text-blue-400 text-2xl sm:text-3xl font-bold text-center">
            {user ? `Welcome back, ${user.username}!` : "Join the Conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <p className="text-gray-700 dark:text-gray-300 text-center text-sm sm:text-base">
            {user
              ? "Jump into your chats or update your profile."
              : "Log in or sign up to start chatting with friends instantly!"}
          </p>
          <div className="flex flex-col space-y-3">
            {user ? (
              <>
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    asChild
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 text-base sm:text-lg"
                  >
                    <Link href="/chat">Go to Chat</Link>
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
                    <Link href="/profile">View Profile</Link>
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    asChild
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 text-base sm:text-lg"
                  >
                    <Link href="/login">Log In</Link>
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
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
