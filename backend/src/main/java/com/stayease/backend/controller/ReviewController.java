package com.stayease.backend.controller;

import com.stayease.backend.dto.request.ReviewRequest;
import com.stayease.backend.dto.response.ApiResponse;
import com.stayease.backend.dto.response.ReviewResponse;
import com.stayease.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        return ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Review submitted successfully")
                .data(
                        reviewService.createReview(
                                request,
                                authentication.getName()
                        )
                )
                .build();
    }

    @GetMapping("/hotel/{hotelId}")
    public ApiResponse<List<ReviewResponse>> getHotelReviews(
            @PathVariable String hotelId) {

        return ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .message("Reviews retrieved successfully")
                .data(
                        reviewService.getReviewsByHotel(hotelId)
                )
                .build();
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        return ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Review updated successfully")
                .data(
                        reviewService.updateReview(
                                reviewId,
                                request,
                                authentication.getName()
                        )
                )
                .build();
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<Void> deleteReview(
            @PathVariable String reviewId,
            Authentication authentication) {

        reviewService.deleteReview(
                reviewId,
                authentication.getName()
        );

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Review deleted successfully")
                .build();
    }
}