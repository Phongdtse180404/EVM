import { BaseApiService } from './api';


export interface TransferStockRequest {
  modelCode: string;
  quantity: number;
}

export interface WarehouseResponse {
  warehouseId: number;
  warehouseLocation: string;
  vehicleQuantity: number;
  warehouseName: string;
  maxCapacity: number;
  dealershipId: number;
  items: WarehouseStockResponse[];
  dealershipName: string;
}

export interface WarehouseStockResponse {
  modelCode: string;
  brand: string;
  color: string;
  productionYear: number;
  quantity: number;
  maxCapacity: number;
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
  UNDELIVERED = 'UNDELIVERED',
  DELIVERED = 'DELIVERED',
  DELIVERING = 'DELIVERING',
  SOLD_OUT = 'SOLD_OUT'
}

export interface WarehouseRequest {
  warehouseName?: string;
  warehouseLocation?: string;
  maxCapacity?: number;
  dealershipId?: number;
}

export interface WarehouseStockRequest {
  modelCode: string;
  quantity: number;
}

// Warehouse Service
class WarehouseService extends BaseApiService {
    // Transfer stock between warehouses
  async transferStock(sourceWarehouseId: number, targetWarehouseId: number, data: TransferStockRequest): Promise<WarehouseResponse> {
    const res = await this.axiosInstance.post<WarehouseResponse>(
      `/warehouses/${sourceWarehouseId}/transfer/${targetWarehouseId}`,
      data
    );
    return res.data;
  }
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