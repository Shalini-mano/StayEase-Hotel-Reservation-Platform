package com.stayease.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}