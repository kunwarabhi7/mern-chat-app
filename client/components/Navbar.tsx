"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "./DarkModeToggle";
import { useAuth } from "@/context/Auth.Context";
import { useState } from "react";
import { useTheme } from "next-themes";

export function Navbar() {
  const { logout, loading, error, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-blue-500 dark:text-blue-400"
        >
          ChatSphere
        </Link>
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <span className="text-gray-700 dark:text-gray-300">
                Welcome, {user.username}
              </span>
              <Button onClick={handleLogout} disabled={loading}>
                {loading ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Signup</Button>
              </Link>
            </>
          )}
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
