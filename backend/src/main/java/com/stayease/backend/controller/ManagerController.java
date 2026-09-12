package com.stayease.backend.controller;

import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.ManagerBookingResponse;
import com.stayease.backend.dto.response.ManagerDashboardResponse;
import com.stayease.backend.service.ManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOTEL_MANAGER')")
public class ManagerController {

    private final ManagerService managerService;

    @GetMapping("/bookings")
    public ApiResponse<List<ManagerBookingResponse>> getBookings(
            Authentication authentication) {

        return ApiResponse.<List<ManagerBookingResponse>>builder()
                .success(true)
                .message("Manager bookings retrieved successfully")
                .data(
                        managerService.getMyHotelBookings(
                                authentication.getName()
                        )
                )
                .build();
    }

    @GetMapping("/bookings/{id}")
    public ApiResponse<ManagerBookingResponse> getBooking(
            @PathVariable String id,
            Authentication authentication) {

        return ApiResponse.<ManagerBookingResponse>builder()
                .success(true)
                .message("Booking retrieved successfully")
                .data(
                        managerService.getBookingDetails(
                                id,
                                authentication.getName()
                        )
                )
                .build();
    }

    @GetMapping("/dashboard")
    public ApiResponse<ManagerDashboardResponse> getDashboard(
            Authentication authentication) {

        return ApiResponse.<ManagerDashboardResponse>builder()
                .success(true)
                .message("Manager dashboard retrieved successfully")
                .data(
                        managerService.getDashboard(
                                authentication.getName()
                        )
                )
                .build();
    }
}