package com.stayease.backend.service;

import com.stayease.backend.dto.response.NotificationResponse;
import com.stayease.backend.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    void createNotification(
            String userId,
            NotificationType type,
            String title,
            String message
    );

    List<NotificationResponse> getMyNotifications(
            String email
    );

    List<NotificationResponse> getUnreadNotifications(
            String email
    );

    NotificationResponse markAsRead(
            String notificationId,
            String email
    );
}