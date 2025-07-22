// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { logout, loading, error, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          ChatApp
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Welcome, {user.username}
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
                size="icon"
                className="text-blue-500 dark:text-blue-400"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              {user ? (
                <>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                    Welcome, {user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button
                      variant="ghost"
                      className="w-full text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
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
                      className="text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/signup"
                      className="text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      Signup
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <DarkModeToggle />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  );
}
