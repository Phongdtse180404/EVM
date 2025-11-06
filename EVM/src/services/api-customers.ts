import { BaseApiService } from './api';

export interface CustomerRequest {
  vehicleId: number;
  name: string;
  phoneNumber: string;
  interestVehicle: string;
  status: string;
}

// Response type (dữ liệu server trả về)
export interface CustomerResponse {
  customerId: number;
  vehicleId: number;
  vehicleModel: string;
  name: string;
  phoneNumber: string;
  interestVehicle: string;
  status: string;
  assignedSalesName: string | null;
}
class CustomerService extends BaseApiService {
  async getCustomers(): Promise<CustomerResponse[]> {
    const res = await this.axiosInstance.get<CustomerResponse[]>('/customers');
    return res.data;
  }

  async getCustomerById(id: number): Promise<CustomerResponse> {
    const res = await this.axiosInstance.get<CustomerResponse>(`/customers/${id}`);
    return res.data;
  }

  async getCustomerByPhone(phoneNumber: string): Promise<CustomerResponse> {
    const res = await this.axiosInstance.get<CustomerResponse>(`/customers/phone/${phoneNumber}`);
    return res.data;
  }

  async createCustomer(data: any): Promise<CustomerResponse> {
    const res = await this.axiosInstance.post<CustomerResponse>('/customers', data);
    return res.data;
  }

  async updateCustomer(id: number, data: any): Promise<CustomerResponse> {
    const res = await this.axiosInstance.put<CustomerResponse>(`/customers/${id}`, data);
    return res.data;
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.axiosInstance.delete(`/customers/${id}`);
  }

  async assignSalesToCustomer(customerId: number, userId: number): Promise<CustomerResponse> {
    const res = await this.axiosInstance.patch<CustomerResponse>(`/customers/${customerId}/assign-sales/${userId}`);
    return res.data;
  }

  async unassignSalesFromCustomer(customerId: number): Promise<CustomerResponse> {
    const res = await this.axiosInstance.patch<CustomerResponse>(`/customers/${customerId}/unassign-sales`);
    return res.data;
  }
}

export const customerService = new CustomerService();