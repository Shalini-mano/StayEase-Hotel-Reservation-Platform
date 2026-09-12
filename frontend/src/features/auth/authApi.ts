import api from '../../api/axios'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from './types'

export const loginUser = async (
  loginData: LoginRequest,
): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    '/api/auth/login',
    loginData,
  )

  return response.data
}

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>(
    '/api/users/profile',
  )

  return response.data
}

export const registerUser = async (
  registerData: RegisterRequest,
): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    '/api/auth/register',
    registerData,
  )

  return response.data
}