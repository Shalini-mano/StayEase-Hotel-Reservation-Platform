package com.stayease.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ManagerDashboardResponse {

    private long totalHotels;
    private long totalRooms;

    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long completedBookings;

    private BigDecimal totalRevenue;
}