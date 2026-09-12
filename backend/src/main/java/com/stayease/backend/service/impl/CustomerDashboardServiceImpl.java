package com.stayease.backend.service.impl;

import com.stayease.backend.dto.response.BookingResponse;
import com.stayease.backend.dto.response.CustomerDashboardResponse;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.enums.PaymentStatus;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Payment;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.PaymentRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.CustomerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerDashboardServiceImpl
        implements CustomerDashboardService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public CustomerDashboardResponse getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<Booking> bookings =
                bookingRepository.findByUserId(user.getId());

        long totalBookings = bookings.size();

        long pendingBookings = bookings.stream()
                .filter(booking ->
                        booking.getStatus() == BookingStatus.PENDING)
                .count();

        long confirmedBookings = bookings.stream()
                .filter(booking ->
                        booking.getStatus() == BookingStatus.CONFIRMED)
                .count();

        long completedBookings = bookings.stream()
                .filter(booking ->
                        booking.getStatus() == BookingStatus.COMPLETED)
                .count();

        long cancelledBookings = bookings.stream()
                .filter(booking ->
                        booking.getStatus() == BookingStatus.CANCELLED)
                .count();

        List<String> bookingIds = bookings.stream()
                .map(Booking::getId)
                .toList();

        List<Payment> payments;

        if (bookingIds.isEmpty()) {
            payments = List.of();
        } else {
            payments =
                    paymentRepository.findByBookingIdIn(bookingIds);
        }

        BigDecimal totalSpent = payments.stream()
                .filter(payment ->
                        payment.getStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<BookingResponse> recentBookings = bookings.stream()
                .sorted(
                        Comparator.comparing(
                                Booking::getCreatedAt,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .limit(5)
                .map(this::mapToBookingResponse)
                .toList();

        return CustomerDashboardResponse.builder()
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .totalSpent(totalSpent)
                .recentBookings(recentBookings)
                .build();
    }

    private BookingResponse mapToBookingResponse(
            Booking booking) {

        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .hotelId(booking.getHotelId())
                .roomId(booking.getRoomId())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .guests(booking.getGuests())
                .numberOfNights(booking.getNumberOfNights())
                .pricePerNight(booking.getPricePerNight())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}