package com.stayease.backend.dto.response;

import com.stayease.backend.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {

    private String id;
    private String bookingId;
    private String transactionId;
    private BigDecimal amount;
    private String paymentMethod;
    private PaymentStatus status;
    private LocalDateTime createdAt;
}