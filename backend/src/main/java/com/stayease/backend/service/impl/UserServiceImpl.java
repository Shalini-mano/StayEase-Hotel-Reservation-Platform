package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.ChangePasswordRequest;
import com.stayease.backend.dto.request.UpdateProfileRequest;
import com.stayease.backend.dto.response.UserResponse;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        ));

        return mapToResponse(user);
    }

    @Override
    public UserResponse updateProfile(
            String email,
            UpdateProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setProfileImage(request.getProfileImage());
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    @Override
    public void changePassword(
            String email,
            ChangePasswordRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new BadRequestException(
                    "Current password is incorrect"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            throw new BadRequestException(
                    "New password must be different from current password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .build();
    }
}