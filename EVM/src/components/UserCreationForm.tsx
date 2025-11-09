import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { UserRequest } from "@/services/api-user";
import type { RoleResponse } from "@/services/api-role";

interface UserCreationFormProps {
  roles: RoleResponse[];
  rolesLoading: boolean;
  onCreateUser: (userData: UserRequest, options: { showPassword: string }) => Promise<boolean>;
  generateRandomPassword: (length: number) => string;
}

export default function UserCreationForm({
  roles,
  rolesLoading,
  onCreateUser,
  generateRandomPassword,
}: UserCreationFormProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhoneNumber, setNewUserPhoneNumber] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserRoleId, setNewUserRoleId] = useState<number>(1);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length > 0;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

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

  const resetForm = () => {
    setNewUserEmail("");
    setNewUserName("");
    setNewUserPhoneNumber("");
    setNewUserAddress("");
    setNewUserRoleId(1);
  };

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

    const ok = await onCreateUser(userToAdd, { showPassword: password });
    if (ok) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Thêm người dùng
      </Button>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
    </>
  );
}