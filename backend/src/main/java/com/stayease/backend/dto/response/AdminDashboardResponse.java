package com.stayease.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalCustomers;
    private long totalHotelManagers;

    private long totalHotels;
    private long activeHotels;
    private long inactiveHotels;

    private long totalRooms;

    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long completedBookings;

    private long successfulPayments;

    private BigDecimal totalRevenue;
}