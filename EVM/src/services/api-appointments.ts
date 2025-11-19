import { BaseApiService } from "./api";

// ====== TYPES =======
export interface AppointmentResponse {
    appointmentId: number;
    status: string;
}

export interface AppointmentRequest {
    customerId: number;
    serviceId: number;
    startAt: string; // ISO: "2025-11-17T10:00:00"
    endAt: string;
}

export interface UpdateAppointmentStatusRequest {
    status: "SCHEDULED" | "IN_SERVICE" | "COMPLETED" | "CANCELED";
}

// ====== SERVICE ======
class AppointmentService extends BaseApiService {
    // Tạo cuộc hẹn
    async create(req: AppointmentRequest): Promise<AppointmentResponse> {
        const res = await this.axiosInstance.post("/appointments", req);
        return res.data;
    }

    // Hủy cuộc hẹn
    async cancel(id: number): Promise<void> {
        await this.axiosInstance.post(`/appointments/${id}/cancel`);
    }

    // Xem số slot còn lại
    async getRemainingSlots(
        dealershipId: number,
        serviceId: number,
        startAt: string,
        endAt: string
    ): Promise<number> {
        const res = await this.axiosInstance.get("/appointments/remaining", {
            params: { dealershipId, serviceId, startAt, endAt },
        });
        return res.data;
    }

    // Lấy 1 cuộc hẹn theo ID
    async getById(id: number) {
        const res = await this.axiosInstance.get(`/appointments/${id}`);
        return res.data;
    }

    // Cập nhật trạng thái lịch hẹn
    async updateStatus(
        id: number,
        req: UpdateAppointmentStatusRequest
    ): Promise<void> {
        await this.axiosInstance.patch(`/appointments/${id}/status`, req);
    }
}

export const appointmentService = new AppointmentService();
