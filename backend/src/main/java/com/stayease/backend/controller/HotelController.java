package com.stayease.backend.controller;

import com.stayease.backend.dto.request.HotelRequest;
import com.stayease.backend.dto.request.HotelSearchRequest;
import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.HotelResponse;
import com.stayease.backend.dto.response.HotelSearchResponse;
import com.stayease.backend.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ApiResponse<HotelResponse> createHotel(
            @Valid @RequestBody HotelRequest request,
            Authentication authentication) {

        String managerEmail = authentication.getName();

        return ApiResponse.<HotelResponse>builder()
                .success(true)
                .message("Hotel created successfully")
                .data(hotelService.createHotel(request, managerEmail))
                .build();
    }

    @GetMapping
    public ApiResponse<List<HotelResponse>> getAllHotels() {

        return ApiResponse.<List<HotelResponse>>builder()
                .success(true)
                .message("Hotels retrieved successfully")
                .data(hotelService.getAllHotels())
                .build();
    }
    @GetMapping("/my")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ApiResponse<List<HotelResponse>> getMyHotels(
            Authentication authentication) {

        String managerEmail = authentication.getName();

        return ApiResponse.<List<HotelResponse>>builder()
                .success(true)
                .message("Manager hotels retrieved successfully")
                .data(
                        hotelService.getMyHotels(
                                managerEmail
                        )
                )
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<HotelResponse> getHotelById(
            @PathVariable String id) {

        return ApiResponse.<HotelResponse>builder()
                .success(true)
                .message("Hotel retrieved successfully")
                .data(hotelService.getHotelById(id))
                .build();
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ApiResponse<HotelResponse> updateHotel(
            @PathVariable String id,
            @Valid @RequestBody HotelRequest request,
            Authentication authentication) {

        String managerEmail = authentication.getName();

        return ApiResponse.<HotelResponse>builder()
                .success(true)
                .message("Hotel updated successfully")
                .data(
                        hotelService.updateHotel(
                                id,
                                request,
                                managerEmail
                        )
                )
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ApiResponse<Void> deleteHotel(
            @PathVariable String id,
            Authentication authentication) {

        String managerEmail = authentication.getName();

        hotelService.deleteHotel(id, managerEmail);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Hotel deleted successfully")
                .build();
    }
    @GetMapping("/search")
    public ApiResponse<List<HotelSearchResponse>> searchHotels(
            @Valid @ModelAttribute HotelSearchRequest request) {

        return ApiResponse.<List<HotelSearchResponse>>builder()
                .success(true)
                .message("Hotels retrieved successfully")
                .data(hotelService.searchHotels(request))
                .build();
    }
}