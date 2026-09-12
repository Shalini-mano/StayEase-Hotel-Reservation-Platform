package com.stayease.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRequest {

    @NotBlank(message = "Hotel name is required")
    @Size(max = 150, message = "Hotel name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Hotel description is required")
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Country is required")
    private String country;

    private String postalCode;

    private Double latitude;

    private Double longitude;

    private List<String> amenities;

    private List<String> images;

    private String policies;
}