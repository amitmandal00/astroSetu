import axios from 'axios';
import { apiService } from './api';
import { trackEvent, trackError } from './telemetry';
const isNetworkError = (err: any) => {
  if (!err) return false;
  if (axios.isAxiosError(err)) {
    return !err.response || err.code === 'ECONNABORTED' || err.message?.includes('Network Error');
  }
  return false;
};

export interface LoginResponse {
  ok: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
  error?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', { email, password });
      if (response.ok && response.data) {
        trackEvent('auth_login_success_mobile', { method: 'email' });
        return {
          ok: true,
          data: {
            token: response.data.token,
            user: response.data.user,
          },
        };
      }
      throw new Error(response.error || 'Login failed');
    } catch (err: any) {
      // Dev-friendly fallback to allow UI exploration when backend is unreachable.
      if (__DEV__ && isNetworkError(err)) {
        console.warn('Login: backend unreachable, using mock dev user.');
        trackEvent('auth_login_mock_mobile', { reason: 'network_error' });
        return {
          ok: true,
          data: {
            token: 'dev-mock-token',
            user: {
              id: 'dev-user',
              name: 'Dev User',
              email,
              phone: '0000000000',
            },
          },
        };
      }
      trackError('auth_login_mobile', err);
      throw err;
    }
  },

  async register(email: string, password: string, name?: string): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/register', { email, password, name });
      if (response.ok && response.data) {
        trackEvent('auth_register_success_mobile', {});
        return {
          ok: true,
          data: {
            token: response.data.token,
            user: response.data.user,
          },
        };
      }
      throw new Error(response.error || 'Registration failed');
    } catch (err: any) {
      if (__DEV__ && isNetworkError(err)) {
        console.warn('Register: backend unreachable, using mock dev user.');
        trackEvent('auth_register_mock_mobile', { reason: 'network_error' });
        return {
          ok: true,
          data: {
            token: 'dev-mock-token',
            user: {
              id: 'dev-user',
              name: name || 'Dev User',
              email,
              phone: '0000000000',
            },
          },
        };
      }
      trackError('auth_register_mobile', err);
      throw err;
    }
  },

  async sendOTP(phone: string) {
    try {
      const response = await apiService.post('/auth/send-otp', { phone });
      if (!response.ok) {
        throw new Error(response.error || 'Failed to send OTP');
      }
      return response;
    } catch (err: any) {
      if (__DEV__ && isNetworkError(err)) {
        console.warn('sendOTP: backend unreachable, mocking success.');
        trackEvent('auth_send_otp_mock_mobile', { reason: 'network_error' });
        return { ok: true };
      }
      trackError('auth_send_otp_mobile', err);
      throw err;
    }
  },

  async verifyOTP(phone: string, otp: string): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/verify-otp', { phone, otp });
      if (response.ok && response.data) {
        trackEvent('auth_verify_otp_success_mobile', {});
        return {
          ok: true,
          data: {
            token: response.data.token,
            user: response.data.user,
          },
        };
      }
      throw new Error(response.error || 'Invalid OTP');
    } catch (err: any) {
      if (__DEV__ && isNetworkError(err)) {
        console.warn('verifyOTP: backend unreachable, using mock dev user.');
        trackEvent('auth_verify_otp_mock_mobile', { reason: 'network_error' });
        return {
          ok: true,
          data: {
            token: 'dev-mock-token',
            user: {
              id: 'dev-user',
              name: 'Dev User',
              email: `${phone}@dev.local`,
              phone,
            },
          },
        };
      }
      trackError('auth_verify_otp_mobile', err);
      throw err;
    }
  },

  async logout() {
    await apiService.post('/auth/logout');
  },

  async getMe() {
    return await apiService.get('/auth/me');
  },
};

