import { BaseApiService } from "./api";

// ====== TYPES =======
export type AppointmentStatus =
    | "SCHEDULED"
    | "IN_SERVICE"
    | "COMPLETED"
    | "CANCELED";

export interface AppointmentResponse {
    appointmentId: number;
    status: AppointmentStatus;
}

export interface AppointmentRequest {
    customerId: number;
    serviceId: number;
    assignedUserId: number;
    slotId: number;
    note?: string;

    // nếu muốn giữ startAt/endAt cho đẹp thì để optional, BE sẽ ignore
    startAt?: string;
    endAt?: string;
}

// Dữ liệu full trả về từ GET /api/appointments
export interface AppointmentDetail {
    appointmentId: number;
    status: AppointmentStatus;
    startAt: string;
    endAt: string;
    note?: string;

    customer?: {
        customerId: number;
        name: string;
        phoneNumber: string;
    };

    service?: {
        id: number;
        name: string;
        serviceType: "TEST_DRIVE" | "MAINTENANCE";
    };

    slot?: {
        slotId: number;
        startTime: string;
        endTime: string;
    };
}

// Update status
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
    async getById(id: number): Promise<AppointmentDetail> {
        const res = await this.axiosInstance.get(`/appointments/${id}`);
        return res.data;
    }

    // Lấy tất cả cuộc hẹn
    async getAll(): Promise<AppointmentDetail[]> {
        const res = await this.axiosInstance.get("/appointments");
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
