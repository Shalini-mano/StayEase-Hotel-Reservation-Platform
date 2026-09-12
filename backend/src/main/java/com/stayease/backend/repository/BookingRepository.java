package com.stayease.backend.repository;

import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository
        extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByHotelId(String hotelId);

    @Query("""
        {
          'roomId': ?0,
          'status': { $in: ['PENDING', 'CONFIRMED'] },
          'checkIn': { $lt: ?2 },
          'checkOut': { $gt: ?1 }
        }
        """)
    List<Booking> findOverlappingBookings(
            String roomId,
            LocalDate checkIn,
            LocalDate checkOut
    );
    List<Booking> findByHotelIdIn(List<String> hotelIds);
    Page<Booking> findByStatus(
            BookingStatus status,
            Pageable pageable
    );

    Page<Booking> findByHotelId(
            String hotelId,
            Pageable pageable
    );

    Page<Booking> findByHotelIdAndStatus(
            String hotelId,
            BookingStatus status,
            Pageable pageable
    );
}