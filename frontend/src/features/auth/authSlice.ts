import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { LoginRequest, User } from './types'
import { getCurrentUser, loginUser } from './authApi'

interface LoginResult {
  token: string
  user: User
}

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

const storedToken = localStorage.getItem('token')

const initialState: AuthState = {
  token: storedToken,
  user: null,
  loading: false,
  error: null,
}

export const login = createAsyncThunk<
  LoginResult,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const loginResponse = await loginUser(loginData)

      const token = loginResponse.data.token

      localStorage.setItem('token', token)

      const profileResponse = await getCurrentUser()

      return {
        token,
        user: profileResponse.data,
      }
    } catch (error: any) {
      localStorage.removeItem('token')

      return rejectWithValue(
        error.response?.data?.message || 'Login failed',
      )
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null
      state.user = null
      state.error = null

      localStorage.removeItem('token')
    },

    clearError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed'
      })
  },
})

export const { logout, clearError } = authSlice.actions

export default authSlice.reducer