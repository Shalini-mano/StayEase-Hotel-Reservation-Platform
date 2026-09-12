package com.stayease.backend.service;

import com.stayease.backend.dto.request.ForgotPasswordRequest;
import com.stayease.backend.dto.request.LoginRequest;
import com.stayease.backend.dto.request.RegisterRequest;
import com.stayease.backend.dto.request.ResetPasswordRequest;
import com.stayease.backend.dto.response.AuthResponse;
import com.stayease.backend.dto.response.ForgotPasswordResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
    ForgotPasswordResponse forgotPassword(
            ForgotPasswordRequest request
    );

    void resetPassword(
            ResetPasswordRequest request
    );
}
