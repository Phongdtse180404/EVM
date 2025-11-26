
import { BaseApiService } from './api';

// Enums matching the backend
export enum OrderStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderPaymentStatus {
  UNPAID = 'UNPAID',
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

// Request type (dữ liệu gửi lên server)
export interface OrderRequest {
  customerId: number;
  vehicleId: number;
  totalAmount: number;
  planedDepositAmount?: number;
  status: OrderStatus;
  deliveryDate?: string; // ISO date string
}

// Response type (dữ liệu server trả về)
export interface OrderResponse {
  orderId: number;
  customerId: number;
  customerName: string;
  vehicleId: number;
  vehicleModel: string;
  totalAmount: number;
  planedDepositAmount?: number;
  remainingAmount?: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  deliveryDate?: string; // ISO date string
  orderDate: Date; // ISO datetime string
}

// New Order Deposit Request type (matching backend OrderDepositRequest)
export interface OrderDepositRequest {
  customerId: number;
  vin: string; // VIN code as string
  depositAmount: number;
  userId?: number; // Optional: salesId from assigned sales
  orderDate?: string; // Optional: ISO datetime string, will use current time if not provided
}

// New Order Deposit Response type (matching backend OrderDepositResponse)
export interface OrderDepositResponse {
  orderId: number;
  customerId: number;
  vehicleId: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: OrderPaymentStatus;
  status: OrderStatus;
  currency: string;
  orderDate: string; // ISO datetime string
  deliveryDate?: string; // ISO date string
}

class OrderService extends BaseApiService {
  async deliverNow(orderId: number): Promise<OrderResponse> {
    const res = await this.axiosInstance.post<OrderResponse>(`/orders/${orderId}/deliver-now`);
    return res.data;
  }
  async createOrder(data: OrderRequest): Promise<OrderResponse> {
    const res = await this.axiosInstance.post<OrderResponse>('/orders', data);
    return res.data;
  }

  async getOrderById(id: number): Promise<OrderResponse> {
    const res = await this.axiosInstance.get<OrderResponse>(`/orders/${id}`);
    return res.data;
  }

  async getAllOrders(): Promise<OrderResponse[]> {
    const res = await this.axiosInstance.get<OrderResponse[]>('/orders');
    return res.data;
  }

  async getOrdersByCustomer(customerId: number): Promise<OrderResponse[]> {
    const res = await this.axiosInstance.get<OrderResponse[]>(`/orders/by-customer/${customerId}`);
    return res.data;
  }

  async getOrdersByVehicle(vehicleId: number): Promise<OrderResponse[]> {
    const res = await this.axiosInstance.get<OrderResponse[]>(`/orders/by-vehicle/${vehicleId}`);
    return res.data;
  }

  async updateOrder(id: number, data: OrderRequest): Promise<OrderResponse> {
    const res = await this.axiosInstance.put<OrderResponse>(`/orders/${id}`, data);
    return res.data;
  }

  async deleteOrder(id: number): Promise<void> {
    await this.axiosInstance.delete(`/orders/${id}`);
  }

  async createDeposit(data: OrderDepositRequest): Promise<OrderDepositResponse> {
    const res = await this.axiosInstance.post<OrderDepositResponse>('/orders/deposit', data);
    return res.data;
  }
}

// Export singleton instance
export const orderService = new OrderService();
export { OrderService };


