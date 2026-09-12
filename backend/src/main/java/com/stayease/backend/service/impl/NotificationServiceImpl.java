package com.stayease.backend.service.impl;

import com.stayease.backend.dto.response.NotificationResponse;
import com.stayease.backend.enums.NotificationStatus;
import com.stayease.backend.enums.NotificationType;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Notification;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.NotificationRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void createNotification(
            String userId,
            NotificationType type,
            String title,
            String message) {

        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .status(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponse> getMyNotifications(
            String email) {

        User user = getUser(email);

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(
            String email) {

        User user = getUser(email);

        return notificationRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(
                        user.getId(),
                        NotificationStatus.UNREAD
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(
            String notificationId,
            String email) {

        User user = getUser(email);

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found"
                                ));

        if (!notification.getUserId().equals(user.getId())) {
            throw new BadRequestException(
                    "You are not authorized to access this notification"
            );
        }

        notification.setStatus(NotificationStatus.READ);

        return mapToResponse(
                notificationRepository.save(notification)
        );
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));
    }

    private NotificationResponse mapToResponse(
            Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}