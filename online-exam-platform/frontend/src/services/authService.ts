import api from './api';
import { AuthResponse, LoginDto, RegisterDto, User } from '../types';

export const authService = {
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', loginDto);
    return response.data;
  },

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', registerDto);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};