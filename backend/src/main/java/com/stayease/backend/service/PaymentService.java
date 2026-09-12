package com.stayease.backend.service;

import com.stayease.backend.dto.request.PaymentRequest;
import com.stayease.backend.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse makePayment(
            PaymentRequest request,
            String customerEmail
    );

    PaymentResponse getPaymentByBooking(
            String bookingId,
            String customerEmail
    );
}