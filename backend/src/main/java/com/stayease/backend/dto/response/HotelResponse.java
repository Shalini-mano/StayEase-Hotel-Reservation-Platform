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
public class HotelResponse {

    private String id;

    private String name;

    private String description;

    private String address;

    private String city;

    private String country;

    private String postalCode;

    private Double latitude;

    private Double longitude;

    private Double rating;

    private List<String> amenities;

    private List<String> images;

    private String policies;

    private boolean active;

    private String managerId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}