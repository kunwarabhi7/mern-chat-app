"use client";

import { User, UserListProps } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function UserList({
  users,
  selectedUser,
  setSelectedUser,
}: UserListProps) {
  const handleUserClick = (user: User) => {
    console.log("Selecting user:", user);
    setSelectedUser(user);
  };

  const userVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };
  console.log("Users in UserList:", users);

  return (
    <ScrollArea className="h-[50vh] border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-gray-100 dark:bg-gray-700">
      {users.length > 0 ? (
        users.map((user) => (
          <motion.div
            key={user.id}
            className={`p-2 mb-2 rounded-md cursor-pointer flex items-center space-x-2 ${
              selectedUser?.id === user.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
            }`}
            onClick={() => handleUserClick(user)}
            variants={userVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <img
              src={
                user.dp
                  ? `${process.env.NEXT_PUBLIC_API_URL}${
                      user.dp
                    }?t=${Date.now()}`
                  : "/images/default-dp.png"
              }
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm sm:text-base">{user.username}</p>
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.isOnline ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </motion.div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
          No users available.
        </p>
      )}
    </ScrollArea>
  );
}
