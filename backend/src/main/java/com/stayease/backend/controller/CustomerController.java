package com.stayease.backend.controller;

import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.CustomerDashboardResponse;
import com.stayease.backend.service.CustomerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerDashboardService customerDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<CustomerDashboardResponse>>
    getDashboard(Authentication authentication) {

        CustomerDashboardResponse dashboard =
                customerDashboardService.getDashboard(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                ApiResponse.<CustomerDashboardResponse>builder()
                        .success(true)
                        .message("Customer dashboard fetched successfully")
                        .data(dashboard)
                        .build()
        );
    }
}