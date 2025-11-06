import { BaseApiService } from './api';

// Model types
export interface ModelResponse {
  modelId: number;
  modelCode: string;
  brand: string;
  color: string;
  productionYear: number;
}

export interface ModelRequest {
  modelCode?: string;
  brand?: string;
  color?: string;
  productionYear?: number;
}

// Model Service
class ModelService extends BaseApiService {
  async getModels(page: number = 0, size: number = 20): Promise<ModelResponse[]> {
    const res = await this.axiosInstance.get<ModelResponse[]>(`/models?page=${page}&size=${size}`);
    return res.data;
  }

  async getModelByID(modelId: number): Promise<ModelResponse> {
    const res = await this.axiosInstance.get<ModelResponse>(`/models/${modelId}`);
    return res.data;
  }

  async getModelByCode(modelCode: string): Promise<ModelResponse> {
    const res = await this.axiosInstance.get<ModelResponse>(`/models/code/${modelCode}`);
    return res.data;
  }

  async createModel(data: ModelRequest): Promise<ModelResponse> {
    const res = await this.axiosInstance.post<ModelResponse>('/models', data);
    return res.data;
  }

  async updateModel(modelId: number, data: ModelRequest): Promise<ModelResponse> {
    const res = await this.axiosInstance.put<ModelResponse>(`/models/${modelId}`, data);
    return res.data;
  }

  async deleteModel(modelId: number): Promise<void> {
    await this.axiosInstance.delete(`/models/${modelId}`);
  }
}

export const modelService = new ModelService();