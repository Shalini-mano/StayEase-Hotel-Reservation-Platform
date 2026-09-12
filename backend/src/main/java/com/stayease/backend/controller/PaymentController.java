package com.stayease.backend.controller;

import com.stayease.backend.dto.request.PaymentRequest;
import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.PaymentResponse;
import com.stayease.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PaymentResponse> makePayment(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication) {

        return ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment completed successfully")
                .data(
                        paymentService.makePayment(
                                request,
                                authentication.getName()
                        )
                )
                .build();
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<PaymentResponse> getPayment(
            @PathVariable String bookingId,
            Authentication authentication) {

        return ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment retrieved successfully")
                .data(
                        paymentService.getPaymentByBooking(
                                bookingId,
                                authentication.getName()
                        )
                )
                .build();
    }
}