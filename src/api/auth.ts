import api from './api';

// 🔹 Login user
// Django endpoint: POST /api/accounts/login/
// Request: { email: string, password: string }
// Response: { access: string, refresh: string }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/accounts/login/', {
      email: email.trim().toLowerCase(),
      password,
    });

    return {
      accessToken: response.data.access,
      refreshToken: response.data.refresh,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error.message ||
      'Login failed'
    );
  }
};

// 🔹 Register user
// Django endpoint: POST /api/accounts/register/
// Request: { username: string, email: string, password: string }
// Response: { message: string }
export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await api.post('/api/accounts/register/', {
      username,
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error('Register error:', error);
    throw new Error(
      error?.response?.data?.username?.[0] ||
      error?.response?.data?.email?.[0] ||
      error?.response?.data?.password?.[0] ||
      error?.response?.data?.error ||
      error.message ||
      'Registration failed'
    );
  }
};

// 🔹 Logout (optional)
// Django endpoint: POST /api/accounts/logout/
export const logout = async () => {
  try {
    const response = await api.post('/api/accounts/logout/');
    return response.data;
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(
      error?.response?.data?.error ||
      error.message ||
      'Logout failed'
    );
  }
};
