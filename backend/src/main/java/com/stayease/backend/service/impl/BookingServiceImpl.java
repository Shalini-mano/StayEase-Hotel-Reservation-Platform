package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.BookingRequest;
import com.stayease.backend.dto.response.BookingResponse;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Room;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.RoomRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.stayease.backend.enums.NotificationType;
import com.stayease.backend.service.NotificationService;
import com.stayease.backend.service.SmsService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SmsService smsService;

    @Override
    public BookingResponse createBooking(
            BookingRequest request,
            String customerEmail) {

        User customer = getUser(customerEmail);

        validateDates(request.getCheckIn(), request.getCheckOut());

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " +
                                        request.getRoomId()
                        ));

        if (!room.isAvailable()) {
            throw new BadRequestException(
                    "This room is currently unavailable"
            );
        }

        if (request.getGuests() > room.getCapacity()) {
            throw new BadRequestException(
                    "Room capacity is " + room.getCapacity() +
                            " guests"
            );
        }

        boolean overlapping =
                !bookingRepository.findOverlappingBookings(
                        room.getId(),
                        request.getCheckIn(),
                        request.getCheckOut()
                ).isEmpty();

        if (overlapping) {
            throw new BadRequestException(
                    "Room is not available for the selected dates"
            );
        }

        long nights = ChronoUnit.DAYS.between(
                request.getCheckIn(),
                request.getCheckOut()
        );

        double totalPrice =
                nights * room.getPricePerNight();

        Booking booking = Booking.builder()
                .userId(customer.getId())
                .hotelId(room.getHotelId())
                .roomId(room.getId())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .guests(request.getGuests())
                .numberOfNights(nights)
                .pricePerNight(room.getPricePerNight())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                customer.getId(),
                NotificationType.BOOKING_CREATED,
                "Booking created",
                "Your booking has been created successfully. Booking ID: "
                        + savedBooking.getId()
        );

        if (customer.getPhone() != null && !customer.getPhone().isBlank()) {

            smsService.sendSms(
                    customer.getPhone(),
                    "StayEase: Your booking "
                            + savedBooking.getId()
                            + " has been created. "
                            + "Check-in: "
                            + savedBooking.getCheckIn()
                            + ", Total: €"
                            + savedBooking.getTotalPrice()
                            + ". Complete payment to confirm."
            );
        }
        return mapToResponse(savedBooking);
    }


    @Override
    public List<BookingResponse> getMyBookings(
            String customerEmail) {

        User customer = getUser(customerEmail);

        return bookingRepository
                .findByUserId(customer.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BookingResponse getBookingById(
            String bookingId,
            String customerEmail) {

        User customer = getUser(customerEmail);

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        ));

        verifyOwnership(booking, customer);

        return mapToResponse(booking);
    }

    @Override
    public BookingResponse cancelBooking(
            String bookingId,
            String customerEmail) {

        User customer = getUser(customerEmail);

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        ));

        verifyOwnership(booking, customer);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException(
                    "Booking is already cancelled"
            );
        }

        if (!LocalDate.now().isBefore(booking.getCheckIn())) {
            throw new BadRequestException(
                    "Booking cannot be cancelled on or after check-in date"
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking =
                bookingRepository.save(booking);

        notificationService.createNotification(
                customer.getId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking cancelled",
                "Your booking " + savedBooking.getId()
                        + " has been cancelled successfully."
        );
        if (customer.getPhone() != null && !customer.getPhone().isBlank()) {

            smsService.sendSms(
                    customer.getPhone(),
                    "StayEase: Your booking "
                            + savedBooking.getId()
                            + " has been cancelled successfully."
            );
        }
        return mapToResponse(savedBooking);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));
    }

    private void validateDates(
            LocalDate checkIn,
            LocalDate checkOut) {

        if (!checkOut.isAfter(checkIn)) {
            throw new BadRequestException(
                    "Check-out date must be after check-in date"
            );
        }
    }

    private void verifyOwnership(
            Booking booking,
            User customer) {

        if (!booking.getUserId().equals(customer.getId())) {
            throw new BadRequestException(
                    "You are not authorized to access this booking"
            );
        }
    }

    private BookingResponse mapToResponse(
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