package com.stayease.backend.repository;

import com.stayease.backend.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository
        extends MongoRepository<Review, String> {

    List<Review> findByHotelId(String hotelId);

    boolean existsByBookingId(String bookingId);
}