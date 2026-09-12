package com.stayease.backend.service.impl;

import com.stayease.backend.dto.response.ManagerBookingResponse;
import com.stayease.backend.dto.response.ManagerDashboardResponse;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.enums.PaymentStatus;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Payment;
import com.stayease.backend.model.Room;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.HotelRepository;
import com.stayease.backend.repository.PaymentRepository;
import com.stayease.backend.repository.RoomRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.ManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagerServiceImpl implements ManagerService {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public List<ManagerBookingResponse> getMyHotelBookings(
            String managerEmail) {

        User manager = getManager(managerEmail);

        List<String> hotelIds = hotelRepository
                .findByManagerId(manager.getId())
                .stream()
                .map(Hotel::getId)
                .toList();

        if (hotelIds.isEmpty()) {
            return List.of();
        }

        return bookingRepository
                .findByHotelIdIn(hotelIds)
                .stream()
                .peek(this::updateCompletedBookingStatus)
                .map(this::mapBooking)
                .toList();
    }

    @Override
    public ManagerBookingResponse getBookingDetails(
            String bookingId,
            String managerEmail) {

        User manager = getManager(managerEmail);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        ));

        Hotel hotel = hotelRepository
                .findById(booking.getHotelId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found"
                        ));

        if (!manager.getId().equals(hotel.getManagerId())) {
            throw new BadRequestException(
                    "You are not authorized to access this booking"
            );
        }

        return mapBooking(booking);
    }

    @Override
    public ManagerDashboardResponse getDashboard(
            String managerEmail) {

        User manager = getManager(managerEmail);

        List<Hotel> hotels =
                hotelRepository.findByManagerId(manager.getId());

        List<String> hotelIds = hotels.stream()
                .map(Hotel::getId)
                .toList();

        List<Room> rooms = hotelIds.stream()
                .flatMap(hotelId ->
                        roomRepository.findByHotelId(hotelId)
                                .stream()
                )
                .toList();

        List<Booking> bookings =
                hotelIds.isEmpty()
                        ? List.of()
                        : bookingRepository.findByHotelIdIn(hotelIds);

        long pending = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .count();

        long confirmed = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .count();

        long cancelled = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        long completed = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();

        List<String> bookingIds = bookings.stream()
                .map(Booking::getId)
                .toList();

        List<Payment> payments =
                bookingIds.isEmpty()
                        ? List.of()
                        : paymentRepository.findByBookingIdIn(bookingIds);

        BigDecimal totalRevenue = payments.stream()
                .filter(p ->
                        p.getStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return ManagerDashboardResponse.builder()
                .totalHotels(hotels.size())
                .totalRooms(rooms.size())
                .totalBookings(bookings.size())
                .pendingBookings(pending)
                .confirmedBookings(confirmed)
                .cancelledBookings(cancelled)
                .completedBookings(completed)
                .totalRevenue(totalRevenue)
                .build();
    }

    private User getManager(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Manager not found"
                        ));
    }
    private void updateCompletedBookingStatus(Booking booking) {

        if (booking.getStatus() == BookingStatus.CONFIRMED
                && booking.getCheckOut().isBefore(LocalDate.now())) {

            booking.setStatus(BookingStatus.COMPLETED);
            booking.setUpdatedAt(LocalDateTime.now());

            bookingRepository.save(booking);
        }
    }

    private ManagerBookingResponse mapBooking(Booking booking) {

        User customer = userRepository
                .findById(booking.getUserId())
                .orElse(null);

        Hotel hotel = hotelRepository
                .findById(booking.getHotelId())
                .orElse(null);

        Room room = roomRepository
                .findById(booking.getRoomId())
                .orElse(null);

        String customerName = null;

        if (customer != null) {
            customerName =
                    customer.getFirstName() + " " +
                            customer.getLastName();
        }

        return ManagerBookingResponse.builder()

                .bookingId(booking.getId())

                .customerId(booking.getUserId())
                .customerName(customerName)
                .customerEmail(
                        customer != null
                                ? customer.getEmail()
                                : null
                )

                .hotelId(booking.getHotelId())
                .hotelName(
                        hotel != null
                                ? hotel.getName()
                                : null
                )

                .roomId(booking.getRoomId())
                .roomNumber(
                        room != null
                                ? room.getRoomNumber()
                                : null
                )
                .roomType(
                        room != null
                                ? room.getRoomType()
                                : null
                )

                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .guests(booking.getGuests())
                .numberOfNights(booking.getNumberOfNights())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())

                .build();
    }
}