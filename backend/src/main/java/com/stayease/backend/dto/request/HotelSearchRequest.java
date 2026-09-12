package com.stayease.backend.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HotelSearchRequest {

    private String city;

    @FutureOrPresent(message = "Check-in cannot be in the past")
    private LocalDate checkIn;

    private LocalDate checkOut;

    @Min(value = 1, message = "Guests must be at least 1")
    private Integer guests;

    private Double minPrice;

    private Double maxPrice;

    private Double minRating;

    private String amenity;
}