package com.stayease.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed(unique = true)
    private String token;

    private LocalDateTime expiresAt;

    private boolean used;

    private LocalDateTime createdAt;
}