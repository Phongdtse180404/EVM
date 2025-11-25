
import { BaseApiService } from './api';

// Dealership types based on backend DTOs
export interface DealershipRequest {
  name: string;
  address: string;
  phoneNumber?: string;
}

export enum DealershipStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface TransferWarehouseRequest {
  //target Dealership ID to transfer warehouses to
  targetDealershipId: number;
  warehouseIds: number[];
}

export interface WarehouseSummaryDTO {
  warehouseId: number;
  warehouseName: string;
  warehouseLocation: string;
  vehicleQuantity: number;
}

export interface DealershipResponse {
  dealershipId: number;
  name: string;
  address: string;
  phoneNumber?: string;
  status: DealershipStatus;
  warehouses: WarehouseSummaryDTO[];
}


// Dealership Service
class DealershipService extends BaseApiService {
  // CREATE - Create new dealership
  async createDealership(data: DealershipRequest): Promise<DealershipResponse> {
    const res = await this.axiosInstance.post<DealershipResponse>('/dealerships', data);
    return res.data;
  }

  // READ - Get dealership by ID
  async getDealershipById(dealershipId: number): Promise<DealershipResponse> {
    const res = await this.axiosInstance.get<DealershipResponse>(`/dealerships/${dealershipId}`);
    return res.data;
  }

  // READ - Get all dealerships
  async getAllDealerships(): Promise<DealershipResponse[]> {
    const res = await this.axiosInstance.get<DealershipResponse[]>('/dealerships');
    return res.data;
  }

  // UPDATE - Update dealership
  async updateDealership(dealershipId: number, data: DealershipRequest): Promise<DealershipResponse> {
    const res = await this.axiosInstance.put<DealershipResponse>(`/dealerships/${dealershipId}`, data);
    return res.data;
  }

  // PATCH - Update dealership status
  async updateDealershipStatus(dealershipId: number, status: DealershipStatus): Promise<DealershipResponse> {
    const res = await this.axiosInstance.patch<DealershipResponse>(
      `/dealerships/${dealershipId}/status`,
      null,
      { params: { status } }
    );
    return res.data;
  }

  // DELETE - Delete dealership
  async deleteDealership(dealershipId: number): Promise<void> {
    await this.axiosInstance.delete(`/dealerships/${dealershipId}`);
  }

  // DELETE - Remove warehouse from dealership
  async deleteWarehouseFromDealership(dealershipId: number, warehouseId: number): Promise<void> {
    await this.axiosInstance.delete(`/dealerships/${dealershipId}/warehouses/${warehouseId}`);
  }

  // PUT - Transfer selected warehouses from one dealership to another
  async transferWarehouses(sourceId: number, transferWarehouseRequest: TransferWarehouseRequest): Promise<string> {
    const res = await this.axiosInstance.put(`/dealerships/${sourceId}/transfer-warehouses`, transferWarehouseRequest);
    return res.data;
  }
}

export const dealershipService = new DealershipService();
