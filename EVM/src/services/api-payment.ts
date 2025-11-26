// Page type for paginated responses
export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
import { BaseApiService } from "./api";

// =============================
// Payment History Response DTO
// =============================
export interface PaymentHistoryResponse {
    paymentId: number;
    orderId: number;
    customerName: string;
    customerId: number;
    amount: number;
    status: string; // PaymentStatus
    type: PaymentPurpose; // PaymentPurpose
    method: string; // PaymentMethod
    transactionRef: string;
    paymentDate: string; // ISO datetime string
    message: string;
}

export enum PaymentPurpose {
    DEPOSIT = "DEPOSIT",
    REMAINING = "REMAINING"
}

export interface CashPaymentRequest {
    amount: number;
    applyTo: PaymentPurpose; // "DEPOSIT" hoặc "REMAINING"
    note?: string;
}

export interface StartVnpayRequest {
    purpose: PaymentPurpose; // "DEPOSIT" hoặc "REMAINING"
    bankCode?: string;
}

// =============================
// Response DTOs
// =============================
export interface OrderResponse {
    orderId: number;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    depositAmount?: number;
}

export interface StartVnpayResponse {
    paymentUrl: string;
}

export interface VnpIpnResponse {
    code: string;
    message: string;
}

// =============================
// Payment Service
// =============================
class PaymentApiService extends BaseApiService {

    async getPaymentHistory(params: {
        customerId?: number;
        from?: string; // ISO date string
        to?: string;   // ISO date string
        page?: number;
        size?: number;
    }): Promise<Page<PaymentHistoryResponse>> {
        const query = new URLSearchParams();
        if (params.customerId) query.append('customerId', params.customerId.toString());
        if (params.from) query.append('from', params.from);
        if (params.to) query.append('to', params.to);
        query.append('page', params.page?.toString() ?? '0');
        query.append('size', params.size?.toString() ?? '10');
        const res = await this.axiosInstance.get<Page<PaymentHistoryResponse>>(`/payments?${query.toString()}`);
        return res.data;
    }
    async payCash(orderId: number, data: CashPaymentRequest): Promise<OrderResponse> {
        const res = await this.axiosInstance.post(`/payments/cash/${orderId}`, data);
        return res.data;
    }

    async startVnpay(orderId: number, data: StartVnpayRequest): Promise<StartVnpayResponse> {
        const res = await this.axiosInstance.post(`/payments/vnpay/start/${orderId}`, data);
        return res.data;
    }

    async handleVnpayReturn(params: URLSearchParams): Promise<VnpIpnResponse> {
        const res = await this.axiosInstance.get(`/payments/vnpay/return?${params.toString()}`);
        return res.data;
    }

    async handleVnpayIpn(params: URLSearchParams): Promise<VnpIpnResponse> {
        const res = await this.axiosInstance.get(`/payments/vnpay/ipn?${params.toString()}`);
        return res.data;
    }

    
}

export const paymentService = new PaymentApiService();
