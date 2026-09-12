package com.stayease.backend.dto.response;

import com.stayease.backend.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AdminBookingResponse {

    private String bookingId;

    private String customerId;
    private String customerName;
    private String customerEmail;

    private String hotelId;
    private String hotelName;

    private String roomId;
    private String roomNumber;
    private String roomType;

    private LocalDate checkIn;
    private LocalDate checkOut;

    private Integer guests;
    private Long numberOfNights;
    private Double totalPrice;

    private BookingStatus status;
}