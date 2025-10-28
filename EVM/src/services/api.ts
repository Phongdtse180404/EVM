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

// Warehouse types - match backend WarehouseResponse/WarehouseRequest DTOs
export interface WarehouseStockResponse {
  modelId: number;
  modelCode: string;
  brand: string;
  quantity: number;
}

export interface WarehouseResponse {
  warehouseId: number;
  warehouseLocation: string;
  vehicleQuantity: number;
  items: WarehouseStockResponse[];
}

export interface WarehouseRequest {
  warehouseLocation: string;
}

export interface WarehouseStockRequest {
  modelId: number;
  quantity: number;
}

// Model types - match backend ModelResponse/ModelRequest DTOs
export interface ModelResponse {
  modelId: number;
  modelCode: string;
  brand: string;
}

export interface ModelRequest {
  modelCode: string;
  brand: string;
}

// Legacy type aliases for backward compatibility
export type Warehouse = WarehouseResponse;
export type EV = ModelResponse; // EVs are represented as Models in the backend

// Extended types for frontend compatibility
export interface ExtendedWarehouse extends WarehouseResponse {
  id: number;
  name: string;
  address?: string;
}

export interface ExtendedEV extends ModelResponse {
  id: number;
  model_id: number;
  price?: number;
  color?: string;
  status?: string;
  notes?: string;
  models?: {
    name: string;
  };
}

export interface ExtendedLocation {
  id: string;
  name: string;
}

export interface ExtendedModel {
  id: number;
  name: string;
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

  // Warehouse endpoints - match WarehouseController.java endpoints
  async getWarehouses(): Promise<WarehouseResponse[]> {
    const res = await this.axiosInstance.get<WarehouseResponse[]>('/warehouses');
    return res.data;
  }

  async getWarehouse(id: number): Promise<WarehouseResponse> {
    const res = await this.axiosInstance.get<WarehouseResponse>(`/warehouses/${id}`);
    return res.data;
  }

  async createWarehouse(data: WarehouseRequest): Promise<WarehouseResponse> {
    const res = await this.axiosInstance.post<WarehouseResponse>('/warehouses', data);
    return res.data;
  }

  async updateWarehouse(id: number, data: WarehouseRequest): Promise<WarehouseResponse> {
    const res = await this.axiosInstance.put<WarehouseResponse>(`/warehouses/${id}`, data);
    return res.data;
  }

  async deleteWarehouse(id: number): Promise<void> {
    await this.axiosInstance.delete(`/warehouses/${id}`);
  }

  // Warehouse stock management endpoints
  async upsertWarehouseStock(warehouseId: number, data: WarehouseStockRequest): Promise<WarehouseResponse> {
    const res = await this.axiosInstance.post<WarehouseResponse>(`/warehouses/${warehouseId}/stocks`, data);
    return res.data;
  }

  async removeWarehouseStock(warehouseId: number, modelId: number): Promise<WarehouseResponse> {
    const res = await this.axiosInstance.delete<WarehouseResponse>(`/warehouses/${warehouseId}/stocks/${modelId}`);
    return res.data;
  }

  // Model endpoints - match ModelController.java endpoints
  async getModels(page: number = 0, size: number = 20): Promise<ModelResponse[]> {
    const res = await this.axiosInstance.get<ModelResponse[]>(`/models?page=${page}&size=${size}`);
    return res.data;
  }

  async getModel(id: number): Promise<ModelResponse> {
    const res = await this.axiosInstance.get<ModelResponse>(`/models/${id}`);
    return res.data;
  }

  async getModelByCode(modelCode: string): Promise<ModelResponse> {
    const res = await this.axiosInstance.get<ModelResponse>(`/models/code/${modelCode}`);
    return res.data;
  }

  async createModel(data: ModelRequest): Promise<ModelResponse> {
    const res = await this.axiosInstance.post<ModelResponse>('/models', data);
    return res.data;
  }

  async updateModel(id: number, data: ModelRequest): Promise<ModelResponse> {
    const res = await this.axiosInstance.put<ModelResponse>(`/models/${id}`, data);
    return res.data;
  }

  async deleteModel(id: number): Promise<void> {
    await this.axiosInstance.delete(`/models/${id}`);
  }

  // Legacy methods for backward compatibility with existing warehouse page
  async getWarehousesByLocation(location?: string): Promise<ExtendedWarehouse[]> {
    const warehouses = await this.getWarehouses();
    const extended = warehouses.map(w => ({
      ...w,
      id: w.warehouseId,
      name: w.warehouseLocation, // Use location as name for now
      address: w.warehouseLocation,
    }));
    
    // Filter by location if provided
    if (location) {
      return extended.filter(w => w.warehouseLocation.toLowerCase().includes(location.toLowerCase()));
    }
    return extended;
  }

  async getEVs(warehouseId?: string): Promise<ExtendedEV[]> {
    // This maps to getting all models, as there's no direct EV endpoint in the backend
    const models = await this.getModels();
    return models.map(m => ({
      ...m,
      id: m.modelId,
      model_id: m.modelId,
      price: 0, // Default values since backend doesn't have these
      color: '',
      status: 'có sẵn',
      notes: '',
      models: {
        name: `${m.brand} ${m.modelCode}`,
      },
    }));
  }

  async getLocations(): Promise<ExtendedLocation[]> {
    // Get unique locations from all warehouses
    const warehouses = await this.getWarehouses();
    const locations = [...new Set(warehouses.map(w => w.warehouseLocation))];
    return locations.map((loc, index) => ({
      id: loc,
      name: loc,
    }));
  }

  // Additional legacy methods
  async updateWarehouseCompat(id: number, data: { name: string; address?: string }): Promise<ExtendedWarehouse> {
    const updated = await this.updateWarehouse(id, {
      warehouseLocation: data.name, // Map name to warehouseLocation
    });
    return {
      ...updated,
      id: updated.warehouseId,
      name: updated.warehouseLocation,
      address: updated.warehouseLocation,
    };
  }

  async createWarehouseCompat(data: { name: string; address?: string }): Promise<ExtendedWarehouse> {
    const created = await this.createWarehouse({
      warehouseLocation: data.name,
    });
    return {
      ...created,
      id: created.warehouseId,
      name: created.warehouseLocation,
      address: created.warehouseLocation,
    };
  }

  async updateEV(id: number, data: { modelCode?: string; brand?: string; price?: number; color?: string; status?: string; notes?: string }): Promise<ExtendedEV> {
    // Map to model update since EVs are models in backend
    const updated = await this.updateModel(id, {
      modelCode: data.modelCode || '',
      brand: data.brand || '',
    });
    return {
      ...updated,
      id: updated.modelId,
      model_id: updated.modelId,
      price: data.price || 0,
      color: data.color || '',
      status: data.status || 'có sẵn',
      notes: data.notes || '',
      models: {
        name: `${updated.brand} ${updated.modelCode}`,
      },
    };
  }

  async createEV(data: { modelCode?: string; brand?: string; price?: number; color?: string; status?: string; notes?: string }): Promise<ExtendedEV> {
    const created = await this.createModel({
      modelCode: data.modelCode || '',
      brand: data.brand || '',
    });
    return {
      ...created,
      id: created.modelId,
      model_id: created.modelId,
      price: data.price || 0,
      color: data.color || '',
      status: data.status || 'có sẵn',
      notes: data.notes || '',
      models: {
        name: `${created.brand} ${created.modelCode}`,
      },
    };
  }

  async deleteEV(id: number): Promise<void> {
    await this.deleteModel(id);
  }

  async getModelsCompat(): Promise<ExtendedModel[]> {
    const models = await this.getModels();
    return models.map(m => ({
      id: m.modelId,
      name: `${m.brand} ${m.modelCode}`,
    }));
  }
}

// Export singleton instance
export const apiService = new ApiService();