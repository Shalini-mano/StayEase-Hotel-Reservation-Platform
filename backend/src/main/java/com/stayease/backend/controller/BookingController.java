package com.stayease.backend.controller;

import com.stayease.backend.dto.request.BookingRequest;
import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.BookingResponse;
import com.stayease.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {

        return ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Booking created successfully")
                .data(
                        bookingService.createBooking(
                                request,
                                authentication.getName()
                        )
                )
                .build();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<BookingResponse>> getMyBookings(
            Authentication authentication) {

        return ApiResponse.<List<BookingResponse>>builder()
                .success(true)
                .message("Bookings retrieved successfully")
                .data(
                        bookingService.getMyBookings(
                                authentication.getName()
                        )
                )
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<BookingResponse> getBooking(
            @PathVariable String id,
            Authentication authentication) {

        return ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Booking retrieved successfully")
                .data(
                        bookingService.getBookingById(
                                id,
                                authentication.getName()
                        )
                )
                .build();
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<BookingResponse> cancelBooking(
            @PathVariable String id,
            Authentication authentication) {

        return ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Booking cancelled successfully")
                .data(
                        bookingService.cancelBooking(
                                id,
                                authentication.getName()
                        )
                )
                .build();
    }
}