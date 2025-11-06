import { BaseApiService } from './api';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  email: string;
}


// Auth Service
class AuthService extends BaseApiService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.axiosInstance.post<LoginResponse>('/auth/login', data);
    return res.data;
  }
}

export const authService = new AuthService();
