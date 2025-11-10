
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { UserResponse, UserRequest } from "@/services/api-user";
import type { RoleResponse } from "@/services/api-role";
import UserTableUpdateCell from "@/components/UserTableUpdateCell";
import UserTableUpdateRoleCell from "@/components/UserTableUpdateRoleCell";
import UserTableUpdatePasswordCell from "@/components/UserTableUpdatePasswordCell";
import UserTableUpdateButtons from "@/components/UserTableUpdateButtons";

interface UserTableProps {
  users: UserResponse[];
  roles: RoleResponse[];
  editingUserId: number | null;
  editedUser: Partial<UserRequest>;
  showPassword: { [key: number]: boolean };
  onStartEditing: (user: UserResponse) => void;
  onCancelEditing: () => void;
  onConfirmUpdate: () => void;
  onDeleteUser: (userId: number) => void;
  onTogglePasswordVisibility: (userId: number) => void;
  onEditedUserChange: (field: keyof UserRequest, value: string | number) => void;
  getRoleDisplayName: (roleName: string) => string;
  getRoleBadgeVariant: (roleName: string) => "default" | "secondary" | "outline";
  getRoleIcon: (roleName: string) => React.ReactNode;
}

export default function UserTable({
  users,
  roles,
  editingUserId,
  editedUser,
  showPassword,
  onStartEditing,
  onCancelEditing,
  onConfirmUpdate,
  onDeleteUser,
  onTogglePasswordVisibility,
  onEditedUserChange,
  getRoleDisplayName,
  getRoleBadgeVariant,
  getRoleIcon,
}: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">Email</TableHead>
          <TableHead className="text-left">Họ tên</TableHead>
          <TableHead className="text-left">Số điện thoại</TableHead>
          <TableHead className="text-left">Địa chỉ</TableHead>
          <TableHead className="text-left">Vai trò</TableHead>
          <TableHead className="text-left">Mật khẩu</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isEditing = editingUserId === user.userId;
          return (
            <TooltipProvider key={user.userId}>
              <TableRow>
                <TableCell>
                  <UserTableUpdateCell
                    isEditing={isEditing}
                    type="text"
                    currentValue={user.email}
                    editValue={editedUser.email}
                    placeholder="Email"
                    field="email"
                    onFieldChange={onEditedUserChange}
                  />
                </TableCell>
                <TableCell>
                  <UserTableUpdateCell
                    isEditing={isEditing}
                    type="text"
                    currentValue={user.name}
                    editValue={editedUser.name}
                    placeholder="Họ tên"
                    field="name"
                    onFieldChange={onEditedUserChange}
                  />
                </TableCell>
                <TableCell>
                  <UserTableUpdateCell
                    isEditing={isEditing}
                    type="tel"
                    currentValue={user.phoneNumber}
                    editValue={editedUser.phoneNumber}
                    placeholder="Số điện thoại"
                    field="phoneNumber"
                    onFieldChange={onEditedUserChange}
                  />
                </TableCell>
                <TableCell>
                  <UserTableUpdateCell
                    isEditing={isEditing}
                    type="text"
                    currentValue={user.address}
                    editValue={editedUser.address}
                    placeholder="Địa chỉ"
                    field="address"
                    onFieldChange={onEditedUserChange}
                  />
                </TableCell>
                <TableCell>
                  <UserTableUpdateRoleCell
                    isEditing={isEditing}
                    currentRoleName={user.roleName}
                    editRoleId={editedUser.roleId}
                    roles={roles}
                    onFieldChange={onEditedUserChange}
                    getRoleDisplayName={getRoleDisplayName}
                    getRoleBadgeVariant={getRoleBadgeVariant}
                    getRoleIcon={getRoleIcon}
                  />
                </TableCell>
                <TableCell>
                  <UserTableUpdatePasswordCell
                    isEditing={isEditing}
                    editPassword={editedUser.password}
                    showPassword={showPassword[user.userId]}
                    onFieldChange={onEditedUserChange}
                    onTogglePasswordVisibility={() => onTogglePasswordVisibility(user.userId)}
                  />
                </TableCell>
                <TableCell>
                  <UserTableUpdateButtons
                    isEditing={isEditing}
                    user={user}
                    onStartEditing={onStartEditing}
                    onCancelEditing={onCancelEditing}
                    onConfirmUpdate={onConfirmUpdate}
                    onDeleteUser={onDeleteUser}
                  />
                </TableCell>
              </TableRow>
            </TooltipProvider>
          );
        })}
      </TableBody>
    </Table>
  );
}