package com.stayease.backend.service;

import com.stayease.backend.dto.response.CustomerDashboardResponse;

public interface CustomerDashboardService {

    CustomerDashboardResponse getDashboard(String email);
}