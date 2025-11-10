import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { UserRequest } from "@/services/api-user";
import type { RoleResponse } from "@/services/api-role";

interface UserTableUpdateRoleCellProps {
  isEditing: boolean;
  currentRoleName: string;
  editRoleId: number | undefined;
  roles: RoleResponse[];
  onFieldChange: (field: keyof UserRequest, value: string | number) => void;
  getRoleDisplayName: (roleName: string) => string;
  getRoleBadgeVariant: (roleName: string) => "default" | "secondary" | "outline";
  getRoleIcon: (roleName: string) => React.ReactNode;
}

export default function UserTableUpdateRoleCell({
  isEditing,
  currentRoleName,
  editRoleId,
  roles,
  onFieldChange,
  getRoleDisplayName,
  getRoleBadgeVariant,
  getRoleIcon,
}: UserTableUpdateRoleCellProps) {
  if (!isEditing) {
    return (
      <Badge
        variant={getRoleBadgeVariant(currentRoleName)}
        className="gap-1"
      >
        {getRoleIcon(currentRoleName)}
        {getRoleDisplayName(currentRoleName)}
      </Badge>
    );
  }

  return (
    <Select
      value={String(editRoleId || roles.find(r => r.roleName === currentRoleName)?.roleId || "1")}
      onValueChange={(value) => onFieldChange("roleId", parseInt(value))}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.roleId} value={String(role.roleId)}>
            {role.roleName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}