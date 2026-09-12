package com.stayease.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private String id;

    private String hotelId;

    private String roomNumber;

    private String roomType;

    private String description;

    private Double pricePerNight;

    private Integer capacity;

    private List<String> amenities;

    private List<String> images;

    private boolean available;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}