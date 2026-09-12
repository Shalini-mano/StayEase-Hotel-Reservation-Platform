package com.stayease.backend.model;

import com.stayease.backend.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String bookingId;

    private String userId;

    private String transactionId;

    private BigDecimal amount;

    private String paymentMethod;

    private PaymentStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}