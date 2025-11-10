import { Check, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserResponse } from "@/services/api-user";

interface UserTableUpdateButtonsProps {
  isEditing: boolean;
  user: UserResponse;
  onStartEditing: (user: UserResponse) => void;
  onCancelEditing: () => void;
  onConfirmUpdate: () => void;
  onDeleteUser: (userId: number) => void;
}

export default function UserTableUpdateButtons({
  isEditing,
  user,
  onStartEditing,
  onCancelEditing,
  onConfirmUpdate,
  onDeleteUser,
}: UserTableUpdateButtonsProps) {
  return (
    <div className="flex gap-2 justify-end">
      {!isEditing ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStartEditing(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteUser(user.userId)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onConfirmUpdate}
            className="text-green-500 hover:text-green-600"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancelEditing}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}