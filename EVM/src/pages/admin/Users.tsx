import { useEffect, useState } from "react";
import { Check, Edit, Eye, EyeOff, Filter, Plus, Shield, Trash2, User, Users as UsersIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";;
import type { UserResponse, UserRequest } from "@/services/api-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useUsers } from "@/hooks/use-users";

export default function Users() {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<UserRequest>>({});
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [sortBy, setSortBy] = useState<"date" | "role">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhoneNumber, setNewUserPhoneNumber] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserRoleId, setNewUserRoleId] = useState<number>(1); // Default to user role
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

  // Data validation for add method
  const validateNewUser = (data: {
    email: string;
    name: string;
    phoneNumber?: string;
    address: string;
  }): string | null => {
    if (!data.email || !validateEmail(data.email)) return "Email không hợp lệ";
    if (!data.name || !validateName(data.name)) return "Tên không được để trống";
    if (data.phoneNumber && !validatePhoneNumber(data.phoneNumber)) return "Số điện thoại không hợp lệ (10-11 chữ số)";
    if (!data.address || !data.address.trim()) return "Địa chỉ không được để trống";
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

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUser(deleteUserId);
    } finally {
      setDeleteUserId(null);
    }
  };

  // use generateRandomPassword from the hook

  const handleAddUser = async () => {
    const addError = validateNewUser({
      email: newUserEmail,
      name: newUserName,
      phoneNumber: newUserPhoneNumber,
      address: newUserAddress,
    });
    if (addError) {
      toast({
        title: "Lỗi",
        description: addError,
        variant: "destructive",
      });
      return;
    }

    const password = generateRandomPassword(10);

    const userToAdd: UserRequest = {
      email: newUserEmail,
      name: newUserName,
      phoneNumber: newUserPhoneNumber || undefined,
      address: newUserAddress,
      password,
      roleId: newUserRoleId,
    };

    const ok = await createUser(userToAdd, { showPassword: password });
    if (ok) {
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPhoneNumber("");
      setNewUserAddress("");
      setNewUserRoleId(1);
      setIsAddDialogOpen(false);
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
          <div className="flex items-center gap-2 mt-6">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
                            <SelectContent className="bg-background border">
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {getAvailableRoles().map((roleName, index) => (
                  <SelectItem key={`${roleName}-${index}`} value={roleName}>
                    {roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                  {paginatedUsers.map((user) => {
                    const isEditing = editingUserId === user.userId;
                    return (
                      <TooltipProvider key={user.userId}>
                        <TableRow>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editedUser.email || user.email}
                                onChange={(e) =>
                                  setEditedUser((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                                placeholder="Email"
                              />
                            ) : (
                              user.email
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editedUser.name || user.name}
                                onChange={(e) =>
                                  setEditedUser((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Họ tên"
                              />
                            ) : (
                              user.name
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editedUser.phoneNumber || user.phoneNumber || ""}
                                onChange={(e) =>
                                  setEditedUser((prev) => ({
                                    ...prev,
                                    phoneNumber: e.target.value,
                                  }))
                                }
                                placeholder="Số điện thoại"
                                type="tel"
                              />
                            ) : (
                              <span className={user.phoneNumber ? "" : "text-muted-foreground italic"}>
                                {user.phoneNumber || "Chưa có"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={editedUser.address || user.address || ""}
                                onChange={(e) =>
                                  setEditedUser((prev) => ({
                                    ...prev,
                                    address: e.target.value,
                                  }))
                                }
                                placeholder="Địa chỉ"
                              />
                            ) : (
                              <span 
                                className={user.address ? "max-w-xs truncate block" : "text-muted-foreground italic"}
                                title={user.address || undefined}
                              >
                                {user.address || "Chưa có"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select
                                value={String(editedUser.roleId || roles.find(r => r.roleName === user.roleName)?.roleId || "1")}
                                onValueChange={(value) =>
                                  setEditedUser((prev) => ({
                                    ...prev,
                                    roleId: parseInt(value),
                                  }))
                                }
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
                            ) : (
                              <Badge
                                variant={getRoleBadgeVariant(user.roleName)}
                                className="gap-1"
                              >
                                {getRoleIcon(user.roleName)}
                                {getRoleDisplayName(user.roleName)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  type={showPassword[user.userId] ? "text" : "password"}
                                  value={editedUser.password || ""}
                                  onChange={(e) =>
                                    setEditedUser((prev) => ({
                                      ...prev,
                                      password: e.target.value,
                                    }))
                                  }
                                  placeholder="Để trống để giữ nguyên"
                                />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => togglePasswordVisibility(user.userId)}
                                    >
                                      {showPassword[user.userId] ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{showPassword[user.userId] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            ) : (
                              <div className="flex gap-2 items-center">
                                <span className="text-muted-foreground">
                                  {showPassword[user.userId] ? "password123" : "••••••••"}
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => togglePasswordVisibility(user.userId)}
                                    >
                                      {showPassword[user.userId] ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{showPassword[user.userId] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              {!isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditing(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteUserId(user.userId)}
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
                                    onClick={confirmUpdate}
                                    className="text-green-500 hover:text-green-600"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={cancelEditing}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </TooltipProvider>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex items-center justify-between">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm người dùng
                  </Button>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Thêm người dùng mới</DialogTitle>
                      <DialogDescription>
                        Điền thông tin người dùng mới. Mật khẩu sẽ được tạo tự động.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label>Email</label>
                        <Input
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="Email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label>Họ tên</label>
                        <Input
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Họ tên"
                        />
                      </div>
                      <div className="space-y-2">
                        <label>
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel"
                          value={newUserPhoneNumber}
                          onChange={(e) => setNewUserPhoneNumber(e.target.value)}
                          placeholder="0123456789"
                        />
                      </div>
                      <div className="space-y-2">
                        <label>
                          Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={newUserAddress}
                          onChange={(e) => setNewUserAddress(e.target.value)}
                          placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                        />
                      </div>
                      <div className="space-y-2">
                        <label>Vai trò</label>
                        <Select
                          value={String(newUserRoleId)}
                          onValueChange={(value) => setNewUserRoleId(parseInt(value))}
                          disabled={rolesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={rolesLoading ? "Đang tải vai trò..." : "Chọn vai trò"} />
                          </SelectTrigger>
                          <SelectContent>
                            {rolesLoading ? (
                              <SelectItem value="0" disabled>
                                Đang tải...
                              </SelectItem>
                            ) : roles.length === 0 ? (
                              <SelectItem value="0" disabled>
                                Không có vai trò nào
                              </SelectItem>
            ) : (
                              roles.map((role) => (
                                <SelectItem key={role.roleId} value={String(role.roleId)}>
                                  {role.roleName}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleAddUser}>Thêm người dùng</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                          disabled={currentPage === 1}
                        >
                          <PaginationPrevious className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <PaginationNext className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}