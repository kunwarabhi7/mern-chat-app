import { User } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <Select
      onValueChange={(value) => {
        const user = users.find((u) => u.id === value) || null;
        setSelectedUser(user);
      }}
      value={selectedUser?.id || ""}
      disabled={!users.length}
    >
      <SelectTrigger className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
        <SelectValue placeholder="Select a user to chat with" />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.username} ({user.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
