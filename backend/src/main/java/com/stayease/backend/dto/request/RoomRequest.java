package com.stayease.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {

    @NotBlank(message = "Hotel ID is required")
    private String hotelId;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Room type is required")
    private String roomType;

    private String description;

    @NotNull(message = "Price per night is required")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Price must be greater than zero"
    )
    private Double pricePerNight;

    @NotNull(message = "Capacity is required")
    @Min(
            value = 1,
            message = "Capacity must be at least 1"
    )
    private Integer capacity;

    private List<String> amenities;

    private List<String> images;
}