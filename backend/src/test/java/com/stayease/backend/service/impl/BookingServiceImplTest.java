package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.BookingRequest;
import com.stayease.backend.dto.response.BookingResponse;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.enums.NotificationType;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Room;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.RoomRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.NotificationService;
import com.stayease.backend.service.SmsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SmsService smsService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User customer;
    private Room room;

    @BeforeEach
    void setUp() {

        customer = User.builder()
                .id("user123")
                .firstName("Shalini")
                .lastName("Manoharan")
                .email("shalini@test.com")
                .phone("+31600000000")
                .build();

        room = Room.builder()
                .id("room123")
                .hotelId("hotel123")
                .roomNumber("101")
                .roomType("DELUXE")
                .capacity(2)
                .pricePerNight(100.0)
                .available(true)
                .build();
    }

    @Test
    void createBooking_ShouldCreateBookingSuccessfully() {

        BookingRequest request = new BookingRequest();

        request.setRoomId("room123");
        request.setCheckIn(LocalDate.now().plusDays(1));
        request.setCheckOut(LocalDate.now().plusDays(4));
        request.setGuests(2);

        when(
                userRepository.findByEmail("shalini@test.com")
        ).thenReturn(Optional.of(customer));

        when(
                roomRepository.findById("room123")
        ).thenReturn(Optional.of(room));

        when(
                bookingRepository.findOverlappingBookings(
                        eq("room123"),
                        any(LocalDate.class),
                        any(LocalDate.class)
                )
        ).thenReturn(Collections.emptyList());

        when(
                bookingRepository.save(any(Booking.class))
        ).thenAnswer(invocation -> {

            Booking booking =
                    invocation.getArgument(0);

            booking.setId("booking123");

            return booking;
        });

        BookingResponse response =
                bookingService.createBooking(
                        request,
                        "shalini@test.com"
                );

        assertNotNull(response);

        assertEquals(
                "booking123",
                response.getId()
        );

        assertEquals(
                "room123",
                response.getRoomId()
        );

        assertEquals(
                "hotel123",
                response.getHotelId()
        );

        assertEquals(
                2,
                response.getGuests()
        );

        assertEquals(
                3L,
                response.getNumberOfNights()
        );

        assertEquals(
                300.0,
                response.getTotalPrice()
        );

        assertEquals(
                BookingStatus.PENDING,
                response.getStatus()
        );

        verify(
                bookingRepository
        ).save(any(Booking.class));

        verify(
                notificationService
        ).createNotification(
                eq("user123"),
                eq(NotificationType.BOOKING_CREATED),
                eq("Booking created"),
                contains("booking123")
        );

        verify(
                smsService
        ).sendSms(
                eq("+31600000000"),
                contains("booking123")
        );
    }

    @Test
    void createBooking_ShouldFailWhenRoomIsUnavailable() {

        BookingRequest request =
                new BookingRequest();

        request.setRoomId("room123");

        request.setCheckIn(
                LocalDate.now().plusDays(1)
        );

        request.setCheckOut(
                LocalDate.now().plusDays(3)
        );

        request.setGuests(1);

        room.setAvailable(false);

        when(
                userRepository.findByEmail(
                        "shalini@test.com"
                )
        ).thenReturn(
                Optional.of(customer)
        );

        when(
                roomRepository.findById(
                        "room123"
                )
        ).thenReturn(
                Optional.of(room)
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                bookingService.createBooking(
                                        request,
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "This room is currently unavailable",
                exception.getMessage()
        );

        verify(
                bookingRepository,
                never()
        ).save(any());
    }

    @Test
    void createBooking_ShouldFailWhenGuestCountExceedsCapacity() {

        BookingRequest request =
                new BookingRequest();

        request.setRoomId("room123");

        request.setCheckIn(
                LocalDate.now().plusDays(1)
        );

        request.setCheckOut(
                LocalDate.now().plusDays(3)
        );

        request.setGuests(5);

        when(
                userRepository.findByEmail(
                        "shalini@test.com"
                )
        ).thenReturn(
                Optional.of(customer)
        );

        when(
                roomRepository.findById(
                        "room123"
                )
        ).thenReturn(
                Optional.of(room)
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                bookingService.createBooking(
                                        request,
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "Room capacity is 2 guests",
                exception.getMessage()
        );

        verify(
                bookingRepository,
                never()
        ).save(any());
    }

    @Test
    void createBooking_ShouldFailWhenBookingOverlaps() {

        BookingRequest request =
                new BookingRequest();

        request.setRoomId("room123");

        request.setCheckIn(
                LocalDate.now().plusDays(1)
        );

        request.setCheckOut(
                LocalDate.now().plusDays(3)
        );

        request.setGuests(1);

        when(
                userRepository.findByEmail(
                        "shalini@test.com"
                )
        ).thenReturn(
                Optional.of(customer)
        );

        when(
                roomRepository.findById(
                        "room123"
                )
        ).thenReturn(
                Optional.of(room)
        );

        when(
                bookingRepository.findOverlappingBookings(
                        eq("room123"),
                        any(LocalDate.class),
                        any(LocalDate.class)
                )
        ).thenReturn(
                Collections.singletonList(
                        new Booking()
                )
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                bookingService.createBooking(
                                        request,
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "Room is not available for the selected dates",
                exception.getMessage()
        );

        verify(
                bookingRepository,
                never()
        ).save(any());
    }

    @Test
    void cancelBooking_ShouldCancelSuccessfully() {

        Booking booking =
                Booking.builder()
                        .id("booking123")
                        .userId("user123")
                        .hotelId("hotel123")
                        .roomId("room123")
                        .checkIn(
                                LocalDate.now()
                                        .plusDays(5)
                        )
                        .checkOut(
                                LocalDate.now()
                                        .plusDays(7)
                        )
                        .guests(2)
                        .numberOfNights(2L)
                        .pricePerNight(100.0)
                        .totalPrice(200.0)
                        .status(
                                BookingStatus.PENDING
                        )
                        .build();

        when(
                userRepository.findByEmail(
                        "shalini@test.com"
                )
        ).thenReturn(
                Optional.of(customer)
        );

        when(
                bookingRepository.findById(
                        "booking123"
                )
        ).thenReturn(
                Optional.of(booking)
        );

        when(
                bookingRepository.save(
                        any(Booking.class)
                )
        ).thenAnswer(
                invocation ->
                        invocation.getArgument(0)
        );

        BookingResponse response =
                bookingService.cancelBooking(
                        "booking123",
                        "shalini@test.com"
                );

        assertNotNull(response);

        assertEquals(
                BookingStatus.CANCELLED,
                response.getStatus()
        );

        assertEquals(
                2L,
                response.getNumberOfNights()
        );

        verify(
                bookingRepository
        ).save(booking);

        verify(
                notificationService
        ).createNotification(
                eq("user123"),
                eq(NotificationType.BOOKING_CANCELLED),
                eq("Booking cancelled"),
                contains("booking123")
        );

        verify(
                smsService
        ).sendSms(
                eq("+31600000000"),
                contains("cancelled successfully")
        );
    }

    @Test
    void cancelBooking_ShouldFailWhenAlreadyCancelled() {

        Booking booking =
                Booking.builder()
                        .id("booking123")
                        .userId("user123")
                        .checkIn(
                                LocalDate.now()
                                        .plusDays(5)
                        )
                        .status(
                                BookingStatus.CANCELLED
                        )
                        .build();

        when(
                userRepository.findByEmail(
                        "shalini@test.com"
                )
        ).thenReturn(
                Optional.of(customer)
        );

        when(
                bookingRepository.findById(
                        "booking123"
                )
        ).thenReturn(
                Optional.of(booking)
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                bookingService.cancelBooking(
                                        "booking123",
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "Booking is already cancelled",
                exception.getMessage()
        );

        verify(
                bookingRepository,
                never()
        ).save(any());
    }

    @Test
    void cancelBooking_ShouldFailWhenBookingBelongsToAnotherUser() {

        Booking booking =
                Booking.builder()
                        .id("booking123")
                        .userId("anotherUser")
                        .checkIn(
                                LocalDate.now()
                                        .plusDays(5)
                        )
                        .status(
                                BookingStatus.PENDING
                        )
                        .build();

        when(
                userRepository.findByEmail(
                        "shalini@test.com"
                )
        ).thenReturn(
                Optional.of(customer)
        );

        when(
                bookingRepository.findById(
                        "booking123"
                )
        ).thenReturn(
                Optional.of(booking)
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                bookingService.cancelBooking(
                                        "booking123",
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "You are not authorized to access this booking",
                exception.getMessage()
        );

        verify(
                bookingRepository,
                never()
        ).save(any());
    }
}