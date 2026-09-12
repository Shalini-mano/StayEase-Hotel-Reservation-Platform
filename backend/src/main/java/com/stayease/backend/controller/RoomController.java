package com.stayease.backend.controller;

import com.stayease.backend.dto.request.RoomRequest;
import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.RoomResponse;
import com.stayease.backend.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ApiResponse<RoomResponse> createRoom(
            @Valid @RequestBody RoomRequest request,
            Authentication authentication) {

        String managerEmail = authentication.getName();

        return ApiResponse.<RoomResponse>builder()
                .success(true)
                .message("Room created successfully")
                .data(
                        roomService.createRoom(
                                request,
                                managerEmail
                        )
                )
                .build();
    }

    @GetMapping("/hotel/{hotelId}")
    public ApiResponse<List<RoomResponse>> getRoomsByHotel(
            @PathVariable String hotelId) {

        return ApiResponse.<List<RoomResponse>>builder()
                .success(true)
                .message("Rooms retrieved successfully")
                .data(roomService.getRoomsByHotel(hotelId))
                .build();
    }

    @GetMapping("/hotel/{hotelId}/available")
    public ApiResponse<List<RoomResponse>> getAvailableRooms(
            @PathVariable String hotelId) {

        return ApiResponse.<List<RoomResponse>>builder()
                .success(true)
                .message("Available rooms retrieved successfully")
                .data(
                        roomService.getAvailableRooms(hotelId)
                )
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomResponse> getRoomById(
            @PathVariable String id) {

        return ApiResponse.<RoomResponse>builder()
                .success(true)
                .message("Room retrieved successfully")
                .data(roomService.getRoomById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ApiResponse<RoomResponse> updateRoom(
            @PathVariable String id,
            @Valid @RequestBody RoomRequest request,
            Authentication authentication) {

        String managerEmail = authentication.getName();

        return ApiResponse.<RoomResponse>builder()
                .success(true)
                .message("Room updated successfully")
                .data(
                        roomService.updateRoom(
                                id,
                                request,
                                managerEmail
                        )
                )
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ApiResponse<Void> deleteRoom(
            @PathVariable String id,
            Authentication authentication) {

        String managerEmail = authentication.getName();

        roomService.deleteRoom(id, managerEmail);

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Room deleted successfully")
                .build();
    }
}