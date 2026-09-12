package com.stayease.backend.model;

import com.stayease.backend.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
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
    private LocalDateTime updatedAt;
}