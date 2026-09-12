package com.stayease.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDashboardResponse {

    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long completedBookings;
    private long cancelledBookings;

    private BigDecimal totalSpent;

    private List<BookingResponse> recentBookings;
}