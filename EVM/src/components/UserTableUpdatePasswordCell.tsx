import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { UserRequest } from "@/services/api-user";

interface UserTableUpdatePasswordCellProps {
  isEditing: boolean;
  editPassword: string | undefined;
  showPassword: boolean;
  onFieldChange: (field: keyof UserRequest, value: string | number) => void;
  onTogglePasswordVisibility: () => void;
}

export default function UserTableUpdatePasswordCell({
  isEditing,
  editPassword,
  showPassword,
  onFieldChange,
  onTogglePasswordVisibility,
}: UserTableUpdatePasswordCellProps) {
  if (!isEditing) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-muted-foreground">
          {showPassword ? "password123" : "••••••••"}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        type={showPassword ? "text" : "password"}
        value={editPassword || ""}
        onChange={(e) => onFieldChange("password", e.target.value)}
        placeholder="Để trống để giữ nguyên"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}