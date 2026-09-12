package com.stayease.backend.service;

import com.stayease.backend.dto.response.*;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.enums.Role;

import java.util.List;

public interface AdminService {

    AdminDashboardResponse getDashboard();

    PageResponse<AdminUserResponse> getAllUsers(
            int page,
            int size,
            String sortBy,
            String direction,
            Role role
    );

    PageResponse<HotelResponse> getAllHotels(
            int page,
            int size,
            String sortBy,
            String direction,
            String city,
            Boolean active
    );

    // LEAVE YOUR BOOKING METHOD AS IT IS FOR NOW

    PageResponse<AdminBookingResponse> getAllBookings(
            int page,
            int size,
            String sortBy,
            String direction,
            BookingStatus status,
            String hotelId
    );

    HotelResponse activateHotel(String hotelId);

    HotelResponse deactivateHotel(String hotelId);

}