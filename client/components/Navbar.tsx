"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "./DarkModeToggle";

export function Navbar() {
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
          <Button
            variant="ghost"
            asChild
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Link href="/chat">Chat</Link>
          </Button>
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
