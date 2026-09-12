package com.stayease.backend.dto.response;

import com.stayease.backend.enums.NotificationStatus;
import com.stayease.backend.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private String id;

    private NotificationType type;

    private String title;

    private String message;

    private NotificationStatus status;

    private LocalDateTime createdAt;
}