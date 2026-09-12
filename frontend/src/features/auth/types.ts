export type Role = 'CUSTOMER' | 'HOTEL_MANAGER' | 'ADMIN'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  role?: Role
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: Role
  profileImage?: string
  enabled: boolean
}

export interface AuthResponse {
  token: string
  user?: User
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}