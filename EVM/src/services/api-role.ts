import { BaseApiService } from './api';

// Role types
export interface RoleResponse {
  roleId: number;
  roleName: string;
  description: string;
}

export interface RoleRequest {
  roleId: number;
  roleName?: string;
  description?: string;
}

// Role Service
class RoleService extends BaseApiService {
  async getRoles(): Promise<RoleResponse[]> {
    const res = await this.axiosInstance.get<RoleResponse[]>('/roles');
    return res.data;
  }

  async getRole(id: number): Promise<RoleResponse> {
    const res = await this.axiosInstance.get<RoleResponse>(`/roles/${id}`);
    return res.data;
  }

  async createRole(data: RoleRequest): Promise<RoleResponse> {
    const res = await this.axiosInstance.post<RoleResponse>('/roles', data);
    return res.data;
  }

  async updateRole(data: RoleRequest): Promise<RoleResponse> {
    const res = await this.axiosInstance.put<RoleResponse>('/roles', data);
    return res.data;
  }

  async deleteRole(id: number): Promise<void> {
    await this.axiosInstance.delete(`/roles/${id}`);
  }
}

export const roleService = new RoleService();