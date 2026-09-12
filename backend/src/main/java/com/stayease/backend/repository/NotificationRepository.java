package com.stayease.backend.repository;

import com.stayease.backend.enums.NotificationStatus;
import com.stayease.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository
        extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(
            String userId,
            NotificationStatus status
    );
}