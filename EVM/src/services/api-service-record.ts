import { BaseApiService } from './api';

// ServiceRecord types
export interface ServiceRecordResponse {
    id: number;
    userId: number;
    customerId: number;
    serviceId: number;
    content: string;
    note?: string;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}

export interface ServiceRecordRequest {
    userId: number;
    customerId: number;
    serviceId: number;
    content: string;
    note?: string;
}

export interface ServiceRecordUpdateRequest {
    content: string;
    note?: string;
}

// Page type
export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// ServiceRecord Service
class ServiceRecordService extends BaseApiService {
    // Lấy danh sách tất cả service records
    async list(page: number = 0, size: number = 20): Promise<Page<ServiceRecordResponse>> {
        const res = await this.axiosInstance.get<Page<ServiceRecordResponse>>('/service-records', {
            params: { page, size }
        });
        return res.data;
    }

    // Lấy chi tiết 1 record
    async get(id: number): Promise<ServiceRecordResponse> {
        const res = await this.axiosInstance.get<ServiceRecordResponse>(`/service-records/${id}`);
        return res.data;
    }

    // Lấy records theo customer
    async byCustomer(customerId: number, page: number = 0, size: number = 20): Promise<Page<ServiceRecordResponse>> {
        const res = await this.axiosInstance.get<Page<ServiceRecordResponse>>(`/service-records/by-customer/${customerId}`, {
            params: { page, size }
        });
        return res.data;
    }

    // Lấy records theo service
    async byService(serviceId: number, page: number = 0, size: number = 20): Promise<Page<ServiceRecordResponse>> {
        const res = await this.axiosInstance.get<Page<ServiceRecordResponse>>(`/service-records/by-service/${serviceId}`, {
            params: { page, size }
        });
        return res.data;
    }

    // Lấy records theo user
    async byUser(userId: number, page: number = 0, size: number = 20): Promise<Page<ServiceRecordResponse>> {
        const res = await this.axiosInstance.get<Page<ServiceRecordResponse>>(`/service-records/by-user/${userId}`, {
            params: { page, size }
        });
        return res.data;
    }

    // Tạo mới record
    async create(data: ServiceRecordRequest): Promise<ServiceRecordResponse> {
        const res = await this.axiosInstance.post<ServiceRecordResponse>('/service-records', data);
        return res.data;
    }

    // Cập nhật record
    async update(id: number, data: ServiceRecordUpdateRequest): Promise<ServiceRecordResponse> {
        const res = await this.axiosInstance.put<ServiceRecordResponse>(`/service-records/${id}`, data);
        return res.data;
    }

    // Xóa record
    async delete(id: number): Promise<void> {
        await this.axiosInstance.delete(`/service-records/${id}`);
    }
}

export const serviceRecordService = new ServiceRecordService();
