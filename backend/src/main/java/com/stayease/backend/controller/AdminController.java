package com.stayease.backend.controller;

import com.stayease.backend.dto.response.*;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.enums.Role;
import com.stayease.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardResponse> getDashboard() {

        return ApiResponse.<AdminDashboardResponse>builder()
                .success(true)
                .message(
                        "Admin dashboard retrieved successfully"
                )
                .data(adminService.getDashboard())
                .build();
    }


    @GetMapping("/hotels")
    public ApiResponse<PageResponse<HotelResponse>> getHotels(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction,

            @RequestParam(required = false)
            String city,

            @RequestParam(required = false)
            Boolean active) {

        PageResponse<HotelResponse> hotels =
                adminService.getAllHotels(
                        page,
                        size,
                        sortBy,
                        direction,
                        city,
                        active
                );

        return ApiResponse
                .<PageResponse<HotelResponse>>builder()
                .success(true)
                .message(
                        "Hotels retrieved successfully"
                )
                .data(hotels)
                .build();
    }
    @GetMapping("/bookings")
    public ApiResponse<PageResponse<AdminBookingResponse>> getBookings(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction,

            @RequestParam(required = false)
            BookingStatus status,

            @RequestParam(required = false)
            String hotelId) {

        PageResponse<AdminBookingResponse> bookings =
                adminService.getAllBookings(
                        page,
                        size,
                        sortBy,
                        direction,
                        status,
                        hotelId
                );

        return ApiResponse
                .<PageResponse<AdminBookingResponse>>builder()
                .success(true)
                .message("Bookings retrieved successfully")
                .data(bookings)
                .build();
    }
    @PatchMapping("/hotels/{id}/activate")
    public ApiResponse<HotelResponse> activateHotel(
            @PathVariable String id) {

        return ApiResponse.<HotelResponse>builder()
                .success(true)
                .message("Hotel activated successfully")
                .data(adminService.activateHotel(id))
                .build();
    }

    @PatchMapping("/hotels/{id}/deactivate")
    public ApiResponse<HotelResponse> deactivateHotel(
            @PathVariable String id) {

        return ApiResponse.<HotelResponse>builder()
                .success(true)
                .message("Hotel deactivated successfully")
                .data(adminService.deactivateHotel(id))
                .build();
    }
    @GetMapping("/users")
    public ApiResponse<PageResponse<AdminUserResponse>> getUsers(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction,

            @RequestParam(required = false)
            Role role) {

        return ApiResponse
                .<PageResponse<AdminUserResponse>>builder()
                .success(true)
                .message("Users retrieved successfully")
                .data(
                        adminService.getAllUsers(
                                page,
                                size,
                                sortBy,
                                direction,
                                role
                        )
                )
                .build();
    }
}