import { BaseApiService } from './api';
import { OrderResponse } from './api-orders';

export enum customerStatus {
  LEAD = 'LEAD',
  CUSTOMER = 'CUSTOMER'
}

export interface CustomerRequest {
  name: string;
  phoneNumber: string;
  address: string;
  note: string;
  status: customerStatus;
  assignedSalesId?: number;
}

// Response type (dữ liệu server trả về)
export interface CustomerResponse {
  customerId: number;
  name: string;
  phoneNumber: string;
  address: string;
  note: string;
  status: customerStatus;
  assignedSalesName: string | null;
}

export interface CustomerWithOrdersResponse {
  customerId: number;
  name: string;
  phoneNumber: string;
  address: string;
  orders: OrderResponse[];
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

  async getCustomerWithOrders(customerId: number): Promise<CustomerWithOrdersResponse> {
    const res = await this.axiosInstance.get<CustomerWithOrdersResponse>(`/customers/${customerId}/orders`);
    return res.data;
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