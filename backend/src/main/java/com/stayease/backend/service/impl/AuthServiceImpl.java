package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.ForgotPasswordRequest;
import com.stayease.backend.dto.request.LoginRequest;
import com.stayease.backend.dto.request.RegisterRequest;
import com.stayease.backend.dto.request.ResetPasswordRequest;
import com.stayease.backend.dto.response.AuthResponse;
import com.stayease.backend.dto.response.ForgotPasswordResponse;
import com.stayease.backend.enums.Role;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceAlreadyExistsException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.PasswordResetToken;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.PasswordResetTokenRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.security.JwtService;
import com.stayease.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Email already registered: " + request.getEmail()
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return AuthResponse.builder()
                .token(token)
                .message(
                        "User registered successfully"
                )
                .build();
    }

    @Override
    public ForgotPasswordResponse forgotPassword(
            ForgotPasswordRequest request
    ) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: "
                                        + request.getEmail()
                        )
                );

        /*
         * Remove older reset tokens for this user.
         */
        passwordResetTokenRepository
                .deleteByUserId(user.getId());

        /*
         * Generate new reset token.
         */
        String token =
                UUID.randomUUID().toString();

        LocalDateTime expiresAt =
                LocalDateTime.now()
                        .plusMinutes(15);

        /*
         * Store token in MongoDB.
         */
        PasswordResetToken resetTokenEntity =
                PasswordResetToken.builder()
                        .userId(user.getId())
                        .token(token)
                        .expiresAt(expiresAt)
                        .used(false)
                        .createdAt(
                                LocalDateTime.now()
                        )
                        .build();

        passwordResetTokenRepository
                .save(resetTokenEntity);

        /*
         * Return only the token String
         * and expiry time to frontend.
         */
        return new ForgotPasswordResponse(
                token,
                expiresAt
        );
    }

    @Override
    public void resetPassword(
            ResetPasswordRequest request
    ) {

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(
                                request.getToken()
                        )
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Invalid password reset token"
                                )
                        );

        /*
         * Token cannot be reused.
         */
        if (resetToken.isUsed()) {
            throw new BadRequestException(
                    "Password reset token has already been used"
            );
        }

        /*
         * Check token expiration.
         */
        if (
                resetToken.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {
            throw new BadRequestException(
                    "Password reset token has expired"
            );
        }

        User user = userRepository
                .findById(
                        resetToken.getUserId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        /*
         * New password must be different
         * from the current password.
         */
        if (
                passwordEncoder.matches(
                        request.getNewPassword(),
                        user.getPassword()
                )
        ) {
            throw new BadRequestException(
                    "New password must be different from current password"
            );
        }

        /*
         * Save new encrypted password.
         */
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        user.setUpdatedAt(
                LocalDateTime.now()
        );

        userRepository.save(user);

        /*
         * Mark token as used.
         */
        resetToken.setUsed(true);

        passwordResetTokenRepository
                .save(resetToken);
    }

    @Override
    public AuthResponse login(
            LoginRequest request
    ) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(
                        request.getEmail()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return AuthResponse.builder()
                .token(token)
                .message(
                        "Login successful"
                )
                .build();
    }
}