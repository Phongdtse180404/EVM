import { BaseApiService } from "./api";
import { OrderResponse } from "./api-orders";

// Request DTO
export interface UpdateDeliveryDateRequest {
    deliveryDate: string;
}

// Contract Service
class ContractService extends BaseApiService {
    //Lấy hợp đồng đặt cọc (PDF)
    async getDepositContract(orderId: number): Promise<Blob> {
        const res = await this.axiosInstance.get(`/contracts/order/${orderId}/deposit-contract`, {
            responseType: "blob", // để nhận file PDF
        });
        return res.data;
    }

    //Cập nhật ngày giao xe
    async updateDeliveryDate(
        orderId: number,
        request: UpdateDeliveryDateRequest
    ): Promise<OrderResponse> {
        const res = await this.axiosInstance.put<OrderResponse>(
            `/contracts/${orderId}/delivery`,
            request
        );
        return res.data;
    }

    // Tải phiếu giao xe (PDF)
    async getDeliverySlip(orderId: number): Promise<Blob> {
        const res = await this.axiosInstance.get(`/contracts/${orderId}/delivery-slip`, {
            responseType: "blob",
        });
        return res.data;
    }
}

// Export instance
export const contractService = new ContractService();
