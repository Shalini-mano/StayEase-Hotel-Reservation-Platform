package com.stayease.backend.dto.response;

import com.stayease.backend.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {

    private String id;

    private String userId;
    private String hotelId;
    private String roomId;

    private LocalDate checkIn;
    private LocalDate checkOut;

    private Integer guests;
    private Long numberOfNights;

    private Double pricePerNight;
    private Double totalPrice;

    private BookingStatus status;

    private LocalDateTime createdAt;
}