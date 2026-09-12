package com.stayease.backend.model;

import com.stayease.backend.enums.NotificationStatus;
import com.stayease.backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;

    private NotificationType type;

    private String title;

    private String message;

    private NotificationStatus status;

    private LocalDateTime createdAt;
}