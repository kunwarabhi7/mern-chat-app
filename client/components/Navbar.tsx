"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/Auth.Context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DarkModeToggle } from "./DarkModeToggle";
import { motion } from "framer-motion";
import { Menu, MessageSquare, X } from "lucide-react";
import { io, Socket } from "socket.io-client";

export function Navbar() {
  const { logout, loading, user, setUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle userUpdated event for real-time DP update
  useEffect(() => {
    if (!user) return;
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("userUpdated", (updatedUser) => {
      console.log("Received userUpdated event in Navbar:", updatedUser);
      if (updatedUser.id === user.id) {
        setUser({ ...user, dp: updatedUser.dp });
      }
    });

    return () => {
      socket.off("userUpdated");
    };
  }, [user, setUser]);

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const handleLogout = async () => {
    try {
      console.log("Triggering logout...");
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setIsMenuOpen(false);
  };
  console.log(
    "Image src2:",
    user?.dp
      ? `${process.env.NEXT_PUBLIC_API_URL}${user.dp}`
      : "/images/default-dp.png"
  );
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-blue-500 dark:text-blue-400"
        >
          <div className="flex items-center justify-center space-x-4">
            <span>ChatApp</span>
            <MessageSquare />
          </div>
        </Link>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm sm:text-base">
                <span>Welcome, {user.username}</span>
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={user.dp || ""}
                  alt={user.username || "Profile"}
                />
              </span>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? "Logging out..." : "Logout"}
                </Button>
              </motion.div>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  asChild
                  variant="ghost"
                  className="text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Link href="/profile">Profile</Link>
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
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                >
                  <Link href="/login">Login</Link>
                </Button>
              </motion.div>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  asChild
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Link href="/signup">Signup</Link>
                </Button>
              </motion.div>
            </>
          )}
          <DarkModeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 dark:text-blue-400"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 w-56 p-2"
              align="end"
            >
              {user ? (
                <>
                  <DropdownMenuItem
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 px-3 py-2 text-sm font-medium rounded-md"
                    disabled
                  >
                    <img
                      className="w-8 h-8 rounded-full object-cover"
                      src={user.dp || ""}
                      alt={user.username || "Profile"}
                    />
                    <span>Welcome, {user.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex  items-center justify-center w-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 px-3 py-2 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      className="flex items-start justify-center  w-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 px-3 py-2 rounded-md"
                      onClick={handleLogout}
                      disabled={loading}
                    >
                      {loading ? "Logging out..." : "Logout"}
                    </Button>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/login"
                      className="flex items-center w-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 px-3 py-2 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/signup"
                      className="flex items-center w-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 px-3 py-2 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Signup
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="flex items-center justify-center px-3 py-2">
                <DarkModeToggle />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  );
}
