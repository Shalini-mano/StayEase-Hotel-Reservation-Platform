package com.stayease.backend.service;

import com.stayease.backend.dto.request.BookingRequest;
import com.stayease.backend.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(
            BookingRequest request,
            String customerEmail
    );

    BookingResponse getBookingById(
            String bookingId,
            String customerEmail
    );

    List<BookingResponse> getMyBookings(
            String customerEmail
    );

    BookingResponse cancelBooking(
            String bookingId,
            String customerEmail
    );
}