import { BaseApiService } from './api';
import type { ModelResponse } from './api-model';

// Warehouse types
export interface WarehouseResponse {
  warehouseId: number;
  warehouseLocation: string;
  vehicleQuantity: number;
  warehouseName: string;
  items: WarehouseStockResponse[];
}

export interface WarehouseStockResponse {
  id: number;
  warehouseId: number;
  model: ModelResponse;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseRequest {
  warehouseName?: string;
  warehouseLocation?: string;
}

export interface WarehouseStockRequest {
  modelId: number;
  quantity: number;
}

// Warehouse Service
class WarehouseService extends BaseApiService {
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
}

export const warehouseService = new WarehouseService();