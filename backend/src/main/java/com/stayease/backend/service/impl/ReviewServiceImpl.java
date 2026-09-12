package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.ReviewRequest;
import com.stayease.backend.dto.response.ReviewResponse;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceAlreadyExistsException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Review;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.HotelRepository;
import com.stayease.backend.repository.ReviewRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse createReview(
            ReviewRequest request,
            String customerEmail) {

        User customer = getUser(customerEmail);

        Hotel hotel = hotelRepository
                .findById(request.getHotelId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found"
                        ));

        Booking booking = bookingRepository
                .findById(request.getBookingId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        ));

        if (!booking.getUserId().equals(customer.getId())) {
            throw new BadRequestException(
                    "You cannot review another customer's booking"
            );
        }

        if (!booking.getHotelId().equals(hotel.getId())) {
            throw new BadRequestException(
                    "This booking does not belong to the selected hotel"
            );
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cancelled bookings cannot be reviewed"
            );
        }

        if (!booking.getCheckOut().isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "You can review the hotel only after completing your stay"
            );
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new ResourceAlreadyExistsException(
                    "A review already exists for this booking"
            );
        }

        Review review = Review.builder()
                .hotelId(hotel.getId())
                .userId(customer.getId())
                .bookingId(booking.getId())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Review savedReview =
                reviewRepository.save(review);

        updateHotelRating(hotel);

        return mapToResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getReviewsByHotel(
            String hotelId) {

        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException(
                    "Hotel not found with id: " + hotelId
            );
        }

        return reviewRepository
                .findByHotelId(hotelId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ReviewResponse updateReview(
            String reviewId,
            ReviewRequest request,
            String customerEmail) {

        User customer = getUser(customerEmail);

        Review review = reviewRepository
                .findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found"
                        ));

        if (!review.getUserId().equals(customer.getId())) {
            throw new BadRequestException(
                    "You are not authorized to update this review"
            );
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUpdatedAt(LocalDateTime.now());

        Review updatedReview =
                reviewRepository.save(review);

        Hotel hotel = hotelRepository
                .findById(review.getHotelId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found"
                        ));

        updateHotelRating(hotel);

        return mapToResponse(updatedReview);
    }

    @Override
    public void deleteReview(
            String reviewId,
            String customerEmail) {

        User customer = getUser(customerEmail);

        Review review = reviewRepository
                .findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found"
                        ));

        if (!review.getUserId().equals(customer.getId())) {
            throw new BadRequestException(
                    "You are not authorized to delete this review"
            );
        }

        String hotelId = review.getHotelId();

        reviewRepository.delete(review);

        Hotel hotel = hotelRepository
                .findById(hotelId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found"
                        ));

        updateHotelRating(hotel);
    }

    private void updateHotelRating(Hotel hotel) {

        List<Review> reviews =
                reviewRepository.findByHotelId(hotel.getId());

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        double roundedRating =
                Math.round(averageRating * 10.0) / 10.0;

        hotel.setRating(roundedRating);
        hotel.setUpdatedAt(LocalDateTime.now());

        hotelRepository.save(hotel);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));
    }

    private ReviewResponse mapToResponse(
            Review review) {

        return ReviewResponse.builder()
                .id(review.getId())
                .hotelId(review.getHotelId())
                .userId(review.getUserId())
                .bookingId(review.getBookingId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}