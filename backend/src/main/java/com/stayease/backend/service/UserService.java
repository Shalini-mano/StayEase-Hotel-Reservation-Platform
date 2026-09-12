package com.stayease.backend.service;

import com.stayease.backend.dto.request.ChangePasswordRequest;
import com.stayease.backend.dto.request.UpdateProfileRequest;
import com.stayease.backend.dto.response.UserResponse;

public interface UserService {

    UserResponse getProfile(String email);
    UserResponse updateProfile(
            String email,
            UpdateProfileRequest request
    );

    void changePassword(
            String email,
            ChangePasswordRequest request
    );
}