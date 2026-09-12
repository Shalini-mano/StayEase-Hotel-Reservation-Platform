package com.stayease.backend.service;

import com.stayease.backend.dto.request.ReviewRequest;
import com.stayease.backend.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(
            ReviewRequest request,
            String customerEmail
    );

    List<ReviewResponse> getReviewsByHotel(
            String hotelId
    );

    ReviewResponse updateReview(
            String reviewId,
            ReviewRequest request,
            String customerEmail
    );

    void deleteReview(
            String reviewId,
            String customerEmail
    );
}