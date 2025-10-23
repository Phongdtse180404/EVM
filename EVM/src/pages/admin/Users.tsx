import { useCallback, useEffect, useState } from "react";
import { Check, Edit, Eye, EyeOff, Filter, Plus, Shield, Trash2, User, Users as UsersIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import type { UserResponse, UserRequest } from "@/services/api";
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
import { adminClasses, getStatusBadgeClass } from "@/lib/admin-utils";

export default function Users() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [newUserRoleId, setNewUserRoleId] = useState<number>(1); // Default to customer role
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Attempting to fetch users...');
      const fetchedUsers = await apiService.getUsers();
      console.log('Fetched users:', fetchedUsers);

      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleBadgeVariant = (roleName: string) => {
    if (roleName.includes("Quản lý")) return "default";
    if (roleName.includes("Nhân viên")) return "secondary";
    return "outline";
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes("Quản lý")) return <Shield className="h-3.5 w-3.5" />;
    if (roleName.includes("Nhân viên")) return <UsersIcon className="h-3.5 w-3.5" />;
    return <User className="h-3.5 w-3.5" />;
  };

  // Map roleId to Vietnamese role name
  const getRoleNameById = (roleId: number): string => {
    const roleMap: { [key: number]: string } = {
      1: "Khách hàng",
      2: "Khách tiềm năng",
      3: "Nhân viên EVM",
      4: "Quản lý EVM",
      5: "Nhân viên đại lý",
      6: "Quản lý đại lý"
    };
    return roleMap[roleId] || "Khách hàng";
  };

  const startEditing = (user: UserResponse) => {
    setEditingUserId(user.userId);
    setEditedUser({
      userId: user.userId,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber || undefined,
      address: user.address || undefined,
      // We need to map roleName back to roleId for the form
      roleId: Object.entries(roleNameMap).find(([_, name]) => name === user.roleName)?.[0] as unknown as number || 1
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

  const confirmUpdate = async () => {
    if (!editingUserId || !editedUser) return;

    if (editedUser.email && !validateEmail(editedUser.email)) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    if (editedUser.name && !validateName(editedUser.name)) {
      toast({
        title: "Lỗi",
        description: "Tên không được để trống",
        variant: "destructive",
      });
      return;
    }

    if (editedUser.password && editedUser.password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    try {
      const userToUpdate: UserRequest = {
        email: editedUser.email || "",
        name: editedUser.name || "",
        password: editedUser.password || "unchanged", // Use a special value to indicate no change
        roleId: editedUser.roleId || 1
      };

      await apiService.updateUser(editingUserId, userToUpdate);

      toast({
        title: "Thành công",
        description: "Cập nhật thông tin người dùng thành công",
      });

      await fetchUsers();
      cancelEditing();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật thông tin người dùng",
        variant: "destructive",
      });
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
      await apiService.deleteUser(deleteUserId);

      toast({
        title: "Thành công",
        description: "Người dùng đã được xóa",
      });

      await fetchUsers();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa người dùng",
        variant: "destructive",
      });
    } finally {
      setDeleteUserId(null);
    }
  };

  const generateRandomPassword = (length: number = 10): string => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from({ length }, () => charset.charAt(Math.floor(Math.random() * charset.length))).join("");
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !validateEmail(newUserEmail)) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    if (!newUserName || !validateName(newUserName)) {
      toast({
        title: "Lỗi",
        description: "Tên không được để trống",
        variant: "destructive",
      });
      return;
    }

    const password = generateRandomPassword(10);

    try {
      await apiService.createUser({
        email: newUserEmail,
        name: newUserName,
        password,
        roleId: newUserRoleId
      });

      toast({
        title: "Thành công",
        description: `Người dùng mới đã được tạo với mật khẩu: ${password}`,
      });

      setNewUserEmail("");
      setNewUserName("");
      setNewUserRoleId(1);
      setIsAddDialogOpen(false);

      await fetchUsers();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo người dùng mới",
        variant: "destructive",
      });
    }
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = users;

    if (filterRole !== "all") {
      filtered = filtered.filter(user => user.roleName === filterRole);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        // Sort by userId as a proxy for creation date
        return sortOrder === "asc"
          ? a.userId - b.userId
          : b.userId - a.userId;
      } else {
        return sortOrder === "asc"
          ? a.roleName.localeCompare(b.roleName)
          : b.roleName.localeCompare(a.roleName);
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

  // Role mapping for the select dropdowns
  const roleNameMap = {
    1: "Khách hàng",
    2: "Khách tiềm năng",
    3: "Nhân viên EVM",
    4: "Quản lý EVM",
    5: "Nhân viên đại lý",
    6: "Quản lý đại lý"
  };

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
                {Object.entries(roleNameMap).map(([id, name]) => (
                  <SelectItem key={id} value={name}>
                    {name}
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
                              <Select
                                value={String(editedUser.roleId || Object.entries(roleNameMap).find(([_, name]) => name === user.roleName)?.[0] || "1")}
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
                                  {Object.entries(roleNameMap).map(([id, name]) => (
                                    <SelectItem key={id} value={id}>
                                      {name}
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
                                {user.roleName}
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
                        <label>Vai trò</label>
                        <Select
                          value={String(newUserRoleId)}
                          onValueChange={(value) => setNewUserRoleId(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(roleNameMap).map(([id, name]) => (
                              <SelectItem key={id} value={id}>
                                {name}
                              </SelectItem>
                            ))}
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