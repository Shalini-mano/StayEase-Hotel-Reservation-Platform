package com.stayease.backend.controller;

import com.stayease.backend.dto.request.ForgotPasswordRequest;
import com.stayease.backend.dto.request.LoginRequest;
import com.stayease.backend.dto.request.RegisterRequest;
import com.stayease.backend.dto.request.ResetPasswordRequest;
import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.AuthResponse;
import com.stayease.backend.dto.response.ForgotPasswordResponse;
import com.stayease.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Registration successful")
                .data(authService.register(request))
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Login successful")
                .data(authService.login(request))
                .build();
    }
    @PostMapping("/forgot-password")
    public ApiResponse<ForgotPasswordResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        return ApiResponse.<ForgotPasswordResponse>builder()
                .success(true)
                .message("Password reset token generated successfully")
                .data(authService.forgotPassword(request))
                .build();
    }
    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Password reset successfully")
                .build();
    }
}