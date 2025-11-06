import { BaseApiService } from "./api";

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
