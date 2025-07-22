// app/chat/component/UserList.tsx
"use client";

import { User } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

export default function UserList({
  users,
  selectedUser,
  setSelectedUser,
}: UserListProps) {
  // Animation variants
  const selectVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Select
        onValueChange={(value) => {
          const user = users.find((u) => u.id === value) || null;
          console.log("Selected user:", user);
          setSelectedUser(user);
        }}
        value={selectedUser?.id || ""}
        disabled={!users.length}
      >
        <SelectTrigger className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400">
          <SelectValue placeholder="Select a user to chat with" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <motion.div
              key={user.id}
              variants={selectVariants}
              whileHover="hover"
            >
              <SelectItem value={user.id}>
                {user.username} ({user.email})
              </SelectItem>
            </motion.div>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}
