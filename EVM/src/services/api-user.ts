import { BaseApiService } from './api';

// User types
export interface UserResponse {
  userId: number;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  roleName: string;

  dealershipId: number;
  dealershipName: string;
}

export interface UserRequest {
  email?: string;
  password?: string;
  name?: string;
  phoneNumber?: string;
  address?: string;
  roleId?: number;
  dealershipId?: number;
}

// User Service
class UserService extends BaseApiService {
  async getUsers(): Promise<UserResponse[]> {
    const res = await this.axiosInstance.get<UserResponse[]>('/users');
    return res.data;
  }

  async getUser(id: number): Promise<UserResponse> {
    const res = await this.axiosInstance.get<UserResponse>(`/users/${id}`);
    return res.data;
  }

  async createUser(data: UserRequest): Promise<UserResponse> {
    const res = await this.axiosInstance.post<UserResponse>('/users', data);
    return res.data;
  }

  async updateUser(id: number, data: UserRequest): Promise<UserResponse> {
    const res = await this.axiosInstance.put<UserResponse>(`/users/${id}`, data);
    return res.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.axiosInstance.delete(`/users/${id}`);
  }

  // This probably doesn't do anything
  async updateUserRole(userId: number, roleId: number): Promise<UserResponse> {
    return this.updateUser(userId, { roleId } as UserRequest);
  }
}

export const userService = new UserService();