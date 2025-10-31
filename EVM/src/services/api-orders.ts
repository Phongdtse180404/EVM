import { BaseApiService } from './api';

// Enums matching the backend
export enum OrderStatus {
  NEW = 'NEW',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum OrderPaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERPAID = 'OVERPAID',
  CANCELLED = 'CANCELLED'
}

// Request type (dữ liệu gửi lên server)
export interface OrderRequest {
  customerId: number;
  vehicleId: number;
  totalAmount: number;
  depositAmount?: number;
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
  depositAmount?: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  deliveryDate?: string; // ISO date string
  orderDate: string; // ISO datetime string
}

class OrderService extends BaseApiService {
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
}

// Export singleton instance
export const orderService = new OrderService();
export { OrderService };