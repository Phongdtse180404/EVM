import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/api-user';
import type { UserResponse, UserRequest } from '@/services/api-user';
import { roleService, type RoleResponse } from '@/services/api-role';

export const useUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Attempting to fetch users...');
      const fetchedUsers = await userService.getUsers();
      console.log('Fetched users:', fetchedUsers);
      console.log('Role names from backend:', [...new Set(fetchedUsers.map(u => u.roleName))]);

      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách người dùng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUser = useCallback(
    async (userId: number, userToUpdate: UserRequest) => {
      try {
        await userService.updateUser(userId, userToUpdate);

        toast({
          title: 'Thành công',
          description: 'Cập nhật thông tin người dùng thành công',
        });

        // Refresh list after successful update
        await fetchUsers();
        return true;
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể cập nhật thông tin người dùng',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast, fetchUsers]
  );

  const deleteUser = useCallback(
    async (userId: number) => {
      try {
        await userService.deleteUser(userId);

        toast({
          title: 'Thành công',
          description: 'Người dùng đã được xóa',
        });

        // Refresh list after successful deletion
        await fetchUsers();
        return true;
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể xóa người dùng',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast, fetchUsers]
  );

  const createUser = useCallback(
    async (user: UserRequest, opts?: { showPassword?: string }) => {
      try {
        await userService.createUser(user);

        toast({
          title: 'Thành công',
          description: opts?.showPassword
            ? `Người dùng mới đã được tạo với mật khẩu: ${opts.showPassword}`
            : 'Người dùng mới đã được tạo',
        });

        // Refresh list after successful creation
        await fetchUsers();
        return true;
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Không thể tạo người dùng mới',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast, fetchUsers]
  );

  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const rolesData = await roleService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      });
    } finally {
      setRolesLoading(false);
    }
  }, [toast]);

  const generateRandomPassword = useCallback((length: number = 10): string => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from({ length }, () => charset.charAt(Math.floor(Math.random() * charset.length))).join("");
  }, []);

  return { 
    users, 
    setUsers, 
    loading, 
    roles, 
    setRoles, 
    rolesLoading, 
    fetchUsers, 
    fetchRoles, 
    updateUser, 
    deleteUser, 
    createUser, 
    generateRandomPassword 
  };
};
