package com.stayease.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordResponse {

    private String resetToken;
    private LocalDateTime expiresAt;
}