import { BaseApiService } from './api';

// Electric Vehicle types
export type VehicleStatus =
  | 'AVAILABLE'
  | 'HOLD'
  | 'UNDELIVERED'
  | 'DELIVERED'
  | 'DELIVERING'
  | 'SOLD_OUT';

export interface ElectricVehicleRequest {
  modelId?: number;
  modelCode?: string;
  cost: number;
  price: number;
  batteryCapacity: number;
  imageUrl?: string;
  status?: VehicleStatus;
}

export interface ElectricVehicleResponse {
  vehicleId: number;
  cost: number;
  price: number;
  batteryCapacity: number;
  modelId: number;
  modelCode: string;
  brand: string;
  color: string;
  productionYear: number;
  warehouseId: number;
  imageUrl: string;
  status: VehicleStatus;
  holdUntil?: string;
  selectableNow?: boolean;
}

// Electric Vehicle Service
class ElectricVehicleService extends BaseApiService {

  // Import vehicle types from Excel file
  async importVehicleTypeExcel(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.axiosInstance.post<string>(
      '/electric-vehicles/import-vehicle-type-excel',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  }
  async getAllElectricVehicles(): Promise<ElectricVehicleResponse[]> {
    const res = await this.axiosInstance.get<ElectricVehicleResponse[]>('/electric-vehicles/all');
    return res.data;
  }

  async getElectricVehicleById(vehicleId: number): Promise<ElectricVehicleResponse> {
    const res = await this.axiosInstance.get<ElectricVehicleResponse>(`/electric-vehicles/${vehicleId}`);
    return res.data;
  }

  async createElectricVehicle(data: ElectricVehicleRequest): Promise<ElectricVehicleResponse> {
    const res = await this.axiosInstance.post<ElectricVehicleResponse>('/electric-vehicles', data);
    return res.data;
  }

  async updateElectricVehicle(vehicleId: number, data: ElectricVehicleRequest): Promise<ElectricVehicleResponse> {
    const res = await this.axiosInstance.put<ElectricVehicleResponse>(`/electric-vehicles/${vehicleId}`, data);
    return res.data;
  }

  async deleteElectricVehicle(vehicleId: number): Promise<void> {
    await this.axiosInstance.delete(`/electric-vehicles/${vehicleId}`);
  }

  async searchVehiclesByModelCode(modelCode: string): Promise<ElectricVehicleResponse[]> {
    const res = await this.axiosInstance.get<ElectricVehicleResponse[]>(
      `/electric-vehicles/search-by-modelCode/${modelCode}`
    );
    return res.data;
  }


}

export const electricVehicleService = new ElectricVehicleService();