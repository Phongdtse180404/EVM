import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// Common response type for paginated data
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// Base API Service with common functionality
export class BaseApiService {
  protected axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Runs before every HTTP request and attaches the token if available
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // This excecutes if token runs out or is invalid
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        throw this.handleAxiosError(error);
      }
    );
  }

  protected handleAxiosError(error: AxiosError): Error {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as { message?: string };
      return new Error(data.message || 'API request failed');
    }
    return new Error(error.message || 'API request failed');
  }
}