import { BaseApiService } from './api';




export interface WarehouseResponse {
  warehouseId: number;
  warehouseLocation: string;
  vehicleQuantity: number;
  warehouseName: string;
  items: WarehouseStockResponse[];
}

export interface WarehouseStockResponse {
  modelCode: string;
  brand: string;
  color: string;
  productionYear: number;
  quantity: number;
  serials: VehicleSerialResponse[];
}

export interface VehicleSerialResponse {
  vin: string;
  status: VehicleStatus;
  holdUntil?: string;
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  HOLD = 'HOLD',
  SOLD_OUT = 'SOLD_OUT'
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

  async removeWarehouseStock(warehouseId: number, modelCode: string): Promise<WarehouseResponse> {
    const res = await this.axiosInstance.delete<WarehouseResponse>(`/warehouses/${warehouseId}/stocks/${modelCode}`);
    return res.data;
  }
}

export const warehouseService = new WarehouseService();