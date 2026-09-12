package com.stayease.backend.controller;

import com.stayease.backend.dto.request.ChangePasswordRequest;
import com.stayease.backend.dto.request.UpdateProfileRequest;
import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.UserResponse;
import com.stayease.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile(
            Authentication authentication) {

        String email = authentication.getName();

        UserResponse profile = userService.getProfile(email);

        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Profile retrieved successfully")
                .data(profile)
                .build();
    }
    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        return ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Profile updated successfully")
                .data(
                        userService.updateProfile(
                                authentication.getName(),
                                request
                        )
                )
                .build();
    }
    @PatchMapping("/password")
    public ApiResponse<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        userService.changePassword(
                authentication.getName(),
                request
        );

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Password changed successfully")
                .build();
    }
}