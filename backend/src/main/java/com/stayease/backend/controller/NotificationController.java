package com.stayease.backend.controller;

import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.NotificationResponse;
import com.stayease.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getMyNotifications(
            Authentication authentication) {

        return ApiResponse.<List<NotificationResponse>>builder()
                .success(true)
                .message("Notifications retrieved successfully")
                .data(
                        notificationService.getMyNotifications(
                                authentication.getName()
                        )
                )
                .build();
    }

    @GetMapping("/unread")
    public ApiResponse<List<NotificationResponse>> getUnreadNotifications(
            Authentication authentication) {

        return ApiResponse.<List<NotificationResponse>>builder()
                .success(true)
                .message("Unread notifications retrieved successfully")
                .data(
                        notificationService.getUnreadNotifications(
                                authentication.getName()
                        )
                )
                .build();
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(
            @PathVariable String id,
            Authentication authentication) {

        return ApiResponse.<NotificationResponse>builder()
                .success(true)
                .message("Notification marked as read")
                .data(
                        notificationService.markAsRead(
                                id,
                                authentication.getName()
                        )
                )
                .build();
    }
}