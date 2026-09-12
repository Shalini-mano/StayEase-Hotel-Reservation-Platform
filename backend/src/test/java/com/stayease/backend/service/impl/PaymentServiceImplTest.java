package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.PaymentRequest;
import com.stayease.backend.dto.response.PaymentResponse;
import com.stayease.backend.enums.BookingStatus;
import com.stayease.backend.enums.NotificationType;
import com.stayease.backend.enums.PaymentStatus;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceAlreadyExistsException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Booking;
import com.stayease.backend.model.Payment;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.PaymentRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.EmailService;
import com.stayease.backend.service.NotificationService;
import com.stayease.backend.service.SmsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private User customer;
    private Booking booking;

    @BeforeEach
    void setUp() {

        customer = User.builder()
                .id("user123")
                .firstName("Shalini")
                .lastName("Manoharan")
                .email("shalini@test.com")
                .phone("+31600000000")
                .build();

        booking = Booking.builder()
                .id("booking123")
                .userId("user123")
                .hotelId("hotel123")
                .roomId("room123")
                .checkIn(LocalDate.now().plusDays(5))
                .checkOut(LocalDate.now().plusDays(7))
                .guests(2)
                .numberOfNights(2L)
                .pricePerNight(100.0)
                .totalPrice(200.0)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void makePayment_ShouldCompletePaymentSuccessfully() {

        PaymentRequest request = new PaymentRequest();

        request.setBookingId("booking123");
        request.setPaymentMethod("CARD");

        when(
                userRepository.findByEmail("shalini@test.com")
        ).thenReturn(Optional.of(customer));

        when(
                bookingRepository.findById("booking123")
        ).thenReturn(Optional.of(booking));

        when(
                paymentRepository.existsByBookingId("booking123")
        ).thenReturn(false);

        when(
                paymentRepository.save(any(Payment.class))
        ).thenAnswer(invocation -> {

            Payment payment = invocation.getArgument(0);

            payment.setId("payment123");

            return payment;
        });

        when(
                bookingRepository.save(any(Booking.class))
        ).thenAnswer(
                invocation -> invocation.getArgument(0)
        );

        PaymentResponse response =
                paymentService.makePayment(
                        request,
                        "shalini@test.com"
                );

        assertNotNull(response);

        assertEquals(
                "payment123",
                response.getId()
        );

        assertEquals(
                "booking123",
                response.getBookingId()
        );

        assertEquals(
                new BigDecimal("200.0"),
                response.getAmount()
        );

        assertEquals(
                "CARD",
                response.getPaymentMethod()
        );

        assertEquals(
                PaymentStatus.SUCCESS,
                response.getStatus()
        );

        assertEquals(
                BookingStatus.CONFIRMED,
                booking.getStatus()
        );

        verify(
                paymentRepository
        ).save(any(Payment.class));

        verify(
                bookingRepository
        ).save(booking);

        verify(
                notificationService
        ).createNotification(
                eq("user123"),
                eq(NotificationType.PAYMENT_SUCCESS),
                eq("Payment successful"),
                contains("booking123")
        );

        verify(
                emailService
        ).sendEmail(
                eq("shalini@test.com"),
                eq("StayEase - Booking Confirmed"),
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
    void makePayment_ShouldFailWhenBookingBelongsToAnotherUser() {

        PaymentRequest request = new PaymentRequest();

        request.setBookingId("booking123");
        request.setPaymentMethod("CARD");

        booking.setUserId("anotherUser");

        when(
                userRepository.findByEmail("shalini@test.com")
        ).thenReturn(Optional.of(customer));

        when(
                bookingRepository.findById("booking123")
        ).thenReturn(Optional.of(booking));

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                paymentService.makePayment(
                                        request,
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "You are not authorized to pay for this booking",
                exception.getMessage()
        );

        verify(
                paymentRepository,
                never()
        ).save(any());

        verify(
                bookingRepository,
                never()
        ).save(any());
    }

    @Test
    void makePayment_ShouldFailForCancelledBooking() {

        PaymentRequest request = new PaymentRequest();

        request.setBookingId("booking123");
        request.setPaymentMethod("CARD");

        booking.setStatus(
                BookingStatus.CANCELLED
        );

        when(
                userRepository.findByEmail("shalini@test.com")
        ).thenReturn(Optional.of(customer));

        when(
                bookingRepository.findById("booking123")
        ).thenReturn(Optional.of(booking));

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                paymentService.makePayment(
                                        request,
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "Payment cannot be made for a cancelled booking",
                exception.getMessage()
        );

        verify(
                paymentRepository,
                never()
        ).save(any());
    }

    @Test
    void makePayment_ShouldFailWhenPaymentAlreadyExists() {

        PaymentRequest request = new PaymentRequest();

        request.setBookingId("booking123");
        request.setPaymentMethod("CARD");

        when(
                userRepository.findByEmail("shalini@test.com")
        ).thenReturn(Optional.of(customer));

        when(
                bookingRepository.findById("booking123")
        ).thenReturn(Optional.of(booking));

        when(
                paymentRepository.existsByBookingId("booking123")
        ).thenReturn(true);

        ResourceAlreadyExistsException exception =
                assertThrows(
                        ResourceAlreadyExistsException.class,
                        () ->
                                paymentService.makePayment(
                                        request,
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "Payment already exists for this booking",
                exception.getMessage()
        );

        verify(
                paymentRepository,
                never()
        ).save(any());
    }

    @Test
    void getPaymentByBooking_ShouldReturnPaymentSuccessfully() {

        Payment payment =
                Payment.builder()
                        .id("payment123")
                        .bookingId("booking123")
                        .userId("user123")
                        .transactionId("transaction123")
                        .amount(new BigDecimal("200.0"))
                        .paymentMethod("CARD")
                        .status(PaymentStatus.SUCCESS)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

        when(
                userRepository.findByEmail("shalini@test.com")
        ).thenReturn(Optional.of(customer));

        when(
                bookingRepository.findById("booking123")
        ).thenReturn(Optional.of(booking));

        when(
                paymentRepository.findByBookingId("booking123")
        ).thenReturn(Optional.of(payment));

        PaymentResponse response =
                paymentService.getPaymentByBooking(
                        "booking123",
                        "shalini@test.com"
                );

        assertNotNull(response);

        assertEquals(
                "payment123",
                response.getId()
        );

        assertEquals(
                "booking123",
                response.getBookingId()
        );

        assertEquals(
                "transaction123",
                response.getTransactionId()
        );

        assertEquals(
                new BigDecimal("200.0"),
                response.getAmount()
        );

        assertEquals(
                PaymentStatus.SUCCESS,
                response.getStatus()
        );
    }

    @Test
    void getPaymentByBooking_ShouldFailWhenPaymentDoesNotExist() {

        when(
                userRepository.findByEmail("shalini@test.com")
        ).thenReturn(Optional.of(customer));

        when(
                bookingRepository.findById("booking123")
        ).thenReturn(Optional.of(booking));

        when(
                paymentRepository.findByBookingId("booking123")
        ).thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () ->
                                paymentService.getPaymentByBooking(
                                        "booking123",
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "Payment not found",
                exception.getMessage()
        );
    }

    @Test
    void getPaymentByBooking_ShouldFailForDifferentCustomer() {

        booking.setUserId("anotherUser");

        when(
                userRepository.findByEmail("shalini@test.com")
        ).thenReturn(Optional.of(customer));

        when(
                bookingRepository.findById("booking123")
        ).thenReturn(Optional.of(booking));

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                paymentService.getPaymentByBooking(
                                        "booking123",
                                        "shalini@test.com"
                                )
                );

        assertEquals(
                "You are not authorized to access this payment",
                exception.getMessage()
        );

        verify(
                paymentRepository,
                never()
        ).findByBookingId(anyString());
    }
}