import apiClient from './api-client';
import type { AuthResponse, RegisterInput, LoginInput } from '@rumi/shared';

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}
