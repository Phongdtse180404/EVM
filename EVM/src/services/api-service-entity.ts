import { BaseApiService } from './api';

// Service types
export interface ServiceResponse {
    id: number;
    name: string;
    description?: string;
}

export interface ServiceRequest {
    name: string;
    description?: string;
}

// ServiceEntity Service
class ServiceEntityService extends BaseApiService {
    // Lấy danh sách service (có phân trang)
    async listServices(page: number = 0, size: number = 20): Promise<{ content: ServiceResponse[]; totalElements: number; totalPages: number; }> {
        const res = await this.axiosInstance.get(`/service-entitys`, {
            params: { page, size }
        });
        return res.data;
    }

    // Lấy chi tiết 1 service theo id
    async getService(id: number): Promise<ServiceResponse> {
        const res = await this.axiosInstance.get<ServiceResponse>(`/service-entitys/${id}`);
        return res.data;
    }

    // Tạo mới service
    async createService(data: ServiceRequest): Promise<ServiceResponse> {
        const res = await this.axiosInstance.post<ServiceResponse>('/service-entitys', data);
        return res.data;
    }

    // Cập nhật service
    async updateService(id: number, data: ServiceRequest): Promise<ServiceResponse> {
        const res = await this.axiosInstance.put<ServiceResponse>(`/service-entitys/${id}`, data);
        return res.data;
    }

    // Xóa service
    async deleteService(id: number): Promise<void> {
        await this.axiosInstance.delete(`/service-entitys/${id}`);
    }
}

export const serviceEntityService = new ServiceEntityService();
