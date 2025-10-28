import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// Role types - matches backend RoleResponse/RoleRequest DTOs
export interface RoleResponse {
  roleId: number;
  roleName: string;
  description: string;
}

export interface RoleRequest {
  roleId?: number;      // Used for updates
  roleName: string;
  description: string;
}

// User role union type for frontend validation
export type UserRole =
  | 'customer'
  | 'lead'
  | 'evm_staff'
  | 'evm_manager'
  | 'dealer_staff'
  | 'dealer_manager';

// User types - match backend UserResponse/UserRequest DTOs
export interface UserResponse {
  userId: number;
  name: string;
  phoneNumber: string | null;
  email: string;
  address: string | null;
  roleName: string;     // Role name string from backend
}

export interface UserRequest {
  userId?: number;      // Used for updates
  password: string;     // Required for new users
  name: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  roleId: number;       // References role.roleId
}

// Common response type for paginated data
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserResponse;
}

// API Service
class ApiService {
  // Use configured API URL when provided (trim trailing slash). In development
  // default to the relative '/api' path so Vite dev server proxy (vite.config.ts)
  // forwards requests to the backend and avoids CORS issues.
  private baseUrl: string = (() => {
    const envUrl = (import.meta.env.VITE_API_URL as string) || '';
    if (envUrl && envUrl.length > 0) return envUrl.replace(/\/$/, '');
    return '/api';
  })();
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach auth token if present
    this.axiosInstance.interceptors.request.use((config) => {
      // Support both 'auth_token' (newer code) and 'token' (legacy places like Login.tsx)
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: pass through the full response so callers can use response.data
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          // Redirect to login page
          window.location.href = '/login';
        }
        throw this.handleAxiosError(error);
      }
    );
  }

  private handleAxiosError(error: AxiosError): Error {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as { message?: string };
      return new Error(data.message || 'API request failed');
    }
    return new Error(error.message || 'API request failed');
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.axiosInstance.post<LoginResponse>('/auth/login', data);
    return res.data;
  }

  async register(data: UserRequest): Promise<UserResponse> {
    const res = await this.axiosInstance.post<UserResponse>('/auth/register', data);
    return res.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const res = await this.axiosInstance.get<UserResponse>('/auth/me');
    return res.data;
  }

  // User endpoints - match UserController.java endpoints
  async getUsers(): Promise<UserResponse[]> {
    // Ensure base path resolves correctly even if VITE_API_URL includes or omits the /api suffix.
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

  // Role is updated via full user update, not a separate endpoint
  async updateUserRole(userId: number, roleId: number): Promise<UserResponse> {
    return this.updateUser(userId, { roleId } as UserRequest);
  }

  // Role endpoints - match RoleController.java endpoints
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

// Export singleton instance
export const apiService = new ApiService();