package com.stayease.backend.service;

import com.stayease.backend.dto.response.ManagerBookingResponse;
import com.stayease.backend.dto.response.ManagerDashboardResponse;

import java.util.List;

public interface ManagerService {

    List<ManagerBookingResponse> getMyHotelBookings(
            String managerEmail
    );

    ManagerBookingResponse getBookingDetails(
            String bookingId,
            String managerEmail
    );

    ManagerDashboardResponse getDashboard(
            String managerEmail
    );
}