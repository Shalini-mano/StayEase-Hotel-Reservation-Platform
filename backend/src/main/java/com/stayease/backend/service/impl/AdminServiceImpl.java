package com.stayease.backend.service.impl;

import com.stayease.backend.dto.response.*;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.enums.PaymentStatus;
import com.stayease.backend.enums.Role;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.*;
import com.stayease.backend.repository.*;
import com.stayease.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public PageResponse<AdminUserResponse> getAllUsers(
            int page,
            int size,
            String sortBy,
            String direction,
            Role role) {

        Sort.Direction sortDirection =
                direction.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );

        Page<User> userPage;

        if (role != null) {
            userPage = userRepository.findByRole(
                    role,
                    pageable
            );
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<AdminUserResponse> users =
                userPage.getContent()
                        .stream()
                        .map(this::mapUser)
                        .toList();

        return PageResponse.<AdminUserResponse>builder()
                .content(users)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build();
    }
    @Override
    public AdminDashboardResponse getDashboard() {

        List<Booking> bookings =
                bookingRepository.findAll();

        List<Payment> payments =
                paymentRepository.findAll();

        long pendingBookings = bookings.stream()
                .filter(b ->
                        b.getStatus() == BookingStatus.PENDING)
                .count();

        long confirmedBookings = bookings.stream()
                .filter(b ->
                        b.getStatus() == BookingStatus.CONFIRMED)
                .count();

        long cancelledBookings = bookings.stream()
                .filter(b ->
                        b.getStatus() == BookingStatus.CANCELLED)
                .count();

        long completedBookings = bookings.stream()
                .filter(b ->
                        b.getStatus() == BookingStatus.COMPLETED)
                .count();

        long successfulPayments = payments.stream()
                .filter(p ->
                        p.getStatus() == PaymentStatus.SUCCESS)
                .count();

        BigDecimal totalRevenue = payments.stream()
                .filter(p ->
                        p.getStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalCustomers(
                        userRepository.countByRole(Role.CUSTOMER)
                )
                .totalHotelManagers(
                        userRepository.countByRole(
                                Role.HOTEL_MANAGER
                        )
                )
                .totalHotels(hotelRepository.count())
                .activeHotels(
                        hotelRepository.countByActiveTrue()
                )
                .inactiveHotels(
                        hotelRepository.countByActiveFalse()
                )
                .totalRooms(roomRepository.count())
                .totalBookings(bookings.size())
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .completedBookings(completedBookings)
                .successfulPayments(successfulPayments)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Override
    public PageResponse<HotelResponse> getAllHotels(
            int page,
            int size,
            String sortBy,
            String direction,
            String city,
            Boolean active) {

        // Validate page
        if (page < 0) {
            throw new BadRequestException(
                    "Page number cannot be negative"
            );
        }

        // Validate size
        if (size < 1 || size > 100) {
            throw new BadRequestException(
                    "Page size must be between 1 and 100"
            );
        }

        // Decide sorting direction
        Sort.Direction sortDirection;

        if ("desc".equalsIgnoreCase(direction)) {

            sortDirection = Sort.Direction.DESC;

        } else {

            sortDirection = Sort.Direction.ASC;
        }

        // Create pagination configuration
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );

        Page<Hotel> hotelPage;

        boolean hasCity =
                city != null && !city.isBlank();

        /*
         * CASE 1:
         * city AND active supplied
         *
         * Example:
         * ?city=Amsterdam&active=true
         */
        if (hasCity && active != null) {

            hotelPage =
                    hotelRepository
                            .findByCityIgnoreCaseAndActive(
                                    city.trim(),
                                    active,
                                    pageable
                            );
        }

        /*
         * CASE 2:
         * only city supplied
         *
         * Example:
         * ?city=Amsterdam
         */
        else if (hasCity) {

            hotelPage =
                    hotelRepository
                            .findByCityIgnoreCase(
                                    city.trim(),
                                    pageable
                            );
        }

        /*
         * CASE 3:
         * only active supplied
         *
         * Example:
         * ?active=true
         */
        else if (active != null) {

            hotelPage =
                    hotelRepository
                            .findByActive(
                                    active,
                                    pageable
                            );
        }

        /*
         * CASE 4:
         * no filters
         */
        else {

            hotelPage =
                    hotelRepository.findAll(pageable);
        }

        // Convert Hotel -> HotelResponse
        List<HotelResponse> hotels =
                hotelPage.getContent()
                        .stream()
                        .map(this::mapHotel)
                        .toList();

        // Return pagination information
        return PageResponse.<HotelResponse>builder()
                .content(hotels)
                .page(hotelPage.getNumber())
                .size(hotelPage.getSize())
                .totalElements(
                        hotelPage.getTotalElements()
                )
                .totalPages(
                        hotelPage.getTotalPages()
                )
                .first(
                        hotelPage.isFirst()
                )
                .last(
                        hotelPage.isLast()
                )
                .build();
    }

    @Override
    public PageResponse<AdminBookingResponse> getAllBookings(
            int page,
            int size,
            String sortBy,
            String direction,
            BookingStatus status,
            String hotelId) {

        // Validate page number
        if (page < 0) {
            throw new BadRequestException(
                    "Page number cannot be negative"
            );
        }

        // Validate page size
        if (size < 1 || size > 100) {
            throw new BadRequestException(
                    "Page size must be between 1 and 100"
            );
        }

        // Sorting direction
        Sort.Direction sortDirection;

        if ("desc".equalsIgnoreCase(direction)) {
            sortDirection = Sort.Direction.DESC;
        } else {
            sortDirection = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );

        Page<Booking> bookingPage;

        boolean hasHotelId =
                hotelId != null && !hotelId.isBlank();

        // hotel + status
        if (hasHotelId && status != null) {

            bookingPage =
                    bookingRepository.findByHotelIdAndStatus(
                            hotelId.trim(),
                            status,
                            pageable
                    );
        }

        // hotel only
        else if (hasHotelId) {

            bookingPage =
                    bookingRepository.findByHotelId(
                            hotelId.trim(),
                            pageable
                    );
        }

        // status only
        else if (status != null) {

            bookingPage =
                    bookingRepository.findByStatus(
                            status,
                            pageable
                    );
        }

        // no filters
        else {

            bookingPage =
                    bookingRepository.findAll(pageable);
        }

        List<AdminBookingResponse> bookings =
                bookingPage.getContent()
                        .stream()
                        .map(this::mapBooking)
                        .toList();

        return PageResponse
                .<AdminBookingResponse>builder()
                .content(bookings)
                .page(bookingPage.getNumber())
                .size(bookingPage.getSize())
                .totalElements(
                        bookingPage.getTotalElements()
                )
                .totalPages(
                        bookingPage.getTotalPages()
                )
                .first(
                        bookingPage.isFirst()
                )
                .last(
                        bookingPage.isLast()
                )
                .build();
    }

    @Override
    public HotelResponse activateHotel(String hotelId) {

        Hotel hotel = getHotel(hotelId);

        hotel.setActive(true);
        hotel.setUpdatedAt(LocalDateTime.now());

        return mapHotel(
                hotelRepository.save(hotel)
        );
    }

    @Override
    public HotelResponse deactivateHotel(String hotelId) {

        Hotel hotel = getHotel(hotelId);

        hotel.setActive(false);
        hotel.setUpdatedAt(LocalDateTime.now());

        return mapHotel(
                hotelRepository.save(hotel)
        );
    }


    private Hotel getHotel(String hotelId) {

        return hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found with id: " +
                                        hotelId
                        ));
    }

    private AdminUserResponse mapUser(User user) {

        return AdminUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .build();
    }

    private HotelResponse mapHotel(Hotel hotel) {

        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .postalCode(hotel.getPostalCode())
                .latitude(hotel.getLatitude())
                .longitude(hotel.getLongitude())
                .rating(hotel.getRating())
                .amenities(hotel.getAmenities())
                .images(hotel.getImages())
                .policies(hotel.getPolicies())
                .active(hotel.isActive())
                .managerId(hotel.getManagerId())
                .createdAt(hotel.getCreatedAt())
                .updatedAt(hotel.getUpdatedAt())
                .build();
    }

    private AdminBookingResponse mapBooking(
            Booking booking) {

        User customer = userRepository
                .findById(booking.getUserId())
                .orElse(null);

        Hotel hotel = hotelRepository
                .findById(booking.getHotelId())
                .orElse(null);

        Room room = roomRepository
                .findById(booking.getRoomId())
                .orElse(null);

        String customerName = customer == null
                ? null
                : customer.getFirstName()
                + " "
                + customer.getLastName();

        return AdminBookingResponse.builder()
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
                .numberOfNights(
                        booking.getNumberOfNights()
                )
                .totalPrice(
                        booking.getTotalPrice()
                )
                .status(booking.getStatus())
                .build();
    }

}