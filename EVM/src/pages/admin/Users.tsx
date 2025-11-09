import { useEffect, useState } from "react";
import { Shield, User, Users as UsersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserResponse, UserRequest } from "@/services/api-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useUsers } from "@/hooks/use-users";
import UserTable from "@/components/UserTable";
import DeleteAlert from "@/components/DeleteAlert";
import UserCreationForm from "@/components/UserCreationForm";
import UserPagination from "@/components/UserPagination";
import UserRoleFilter from "@/components/UserRoleFilter";

export default function Users() {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<UserRequest>>({});
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [sortBy, setSortBy] = useState<"date" | "role">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const { toast } = useToast();

  //Custom Hooks
  const { 
    users, 
    loading, 
    roles,
    rolesLoading,
    fetchUsers, 
    fetchRoles,
    updateUser, 
    deleteUser, 
    createUser, 
    generateRandomPassword 
  } = useUsers();


  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);



  // Helper functions using RoleService data
  const getRoleDisplayName = (roleName: string): string => {
    const role = roles.find(r => r.roleName === roleName);
    return role?.roleName || roleName;
  };

  const getRoleBadgeVariant = (roleName: string) => {
    if (roleName === "ADMIN") return "default";
    if (roleName === "EV_STAFF") return "secondary";
    return "outline";
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName === "ADMIN") return <Shield className="h-3.5 w-3.5" />;
    if (roleName === "EV_STAFF") return <UsersIcon className="h-3.5 w-3.5" />;
    return <User className="h-3.5 w-3.5" />;
  };

  const startEditing = (user: UserResponse) => {
    setEditingUserId(user.userId);
    const userRole = roles.find(r => r.roleName === user.roleName);
    setEditedUser({
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber || undefined,
      address: user.address || undefined,
      roleId: userRole?.roleId || 1
    });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditedUser({});
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length > 0;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone number validation (10-11 digits)
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  // Data validation for update method
  const validateEditedUser = (user?: Partial<UserRequest>): string | null => {
    if (!user) return "Dữ liệu người dùng không hợp lệ";
    if (user.email && !validateEmail(user.email)) return "Email không hợp lệ";
    if (user.name && !validateName(user.name)) return "Tên không được để trống";
    if (user.phoneNumber && !validatePhoneNumber(user.phoneNumber)) return "Số điện thoại không hợp lệ (10-11 chữ số)";
    if (user.password && user.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    return null;
  };



  const confirmUpdate = async () => {
    if (!editingUserId || !editedUser) return;

    const validationError = validateEditedUser(editedUser);
    if (validationError) {
      toast({
        title: "Lỗi",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const userToUpdate: UserRequest = {
      email: editedUser.email || "",
      name: editedUser.name || "",
      phoneNumber: editedUser.phoneNumber || undefined,
      address: editedUser.address || undefined,
      password: editedUser.password || "unchanged", // Use a special value to indicate no change
      roleId: editedUser.roleId || 1,
    };

    // Delegate API call, toast and refresh to the hook
    const ok = await updateUser(editingUserId, userToUpdate);
    if (ok) {
      cancelEditing();
    }
  };

  const togglePasswordVisibility = (userId: number) => {
    setShowPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleEditedUserChange = (field: keyof UserRequest, value: string | number) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUser(deleteUserId);
    } finally {
      setDeleteUserId(null);
    }
  };



  // Get all unique role names from users
  const getAvailableRoles = () => {
    const uniqueBackendRoles = [...new Set(users.map(u => u.roleName))];
    return uniqueBackendRoles.map(roleName => getRoleDisplayName(roleName));
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = users;

    if (filterRole !== "all") {
      filtered = filtered.filter(user => getRoleDisplayName(user.roleName) === filterRole);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        // Sort by userId as a proxy for creation date
        return sortOrder === "asc" 
          ? a.userId - b.userId 
          : b.userId - a.userId;
      } else {
        const roleA = getRoleDisplayName(a.roleName);
        const roleB = getRoleDisplayName(b.roleName);
        return sortOrder === "asc"
          ? roleA.localeCompare(roleB)
          : roleB.localeCompare(roleA);
      }
    });
  };

  const filteredAndSortedUsers = getFilteredAndSortedUsers();
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);
  
  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Quản lý người dùng
        </h1>
        <p className="text-muted-foreground mt-2">
          Xem và quản lý thông tin người dùng trong hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Danh sách người dùng
          </CardTitle>
            <UserRoleFilter
              filterRole={filterRole}
              onFilterRoleChange={setFilterRole}
              availableRoles={getAvailableRoles()}
            />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filterRole !== "all" 
                ? "Không tìm thấy người dùng với vai trò này"
                : "Chưa có người dùng nào"}
            </div>
          ) : (
            <>
              <UserTable
                users={paginatedUsers}
                roles={roles}
                editingUserId={editingUserId}
                editedUser={editedUser}
                showPassword={showPassword}
                onStartEditing={startEditing}
                onCancelEditing={cancelEditing}
                onConfirmUpdate={confirmUpdate}
                onDeleteUser={setDeleteUserId}
                onTogglePasswordVisibility={togglePasswordVisibility}
                onEditedUserChange={handleEditedUserChange}
                getRoleDisplayName={getRoleDisplayName}
                getRoleBadgeVariant={getRoleBadgeVariant}
                getRoleIcon={getRoleIcon}
              />
              
              <div className="mt-4 flex items-center justify-between">
                <UserCreationForm
                  roles={roles}
                  rolesLoading={rolesLoading}
                  onCreateUser={createUser}
                  generateRandomPassword={generateRandomPassword}
                />

                <UserPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <DeleteAlert
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        description="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}