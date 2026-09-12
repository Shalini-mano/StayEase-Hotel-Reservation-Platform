package com.stayease.backend.repository;

import com.stayease.backend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByBookingId(String bookingId);

    boolean existsByBookingId(String bookingId);
    List<Payment> findByBookingIdIn(List<String> bookingIds);

}