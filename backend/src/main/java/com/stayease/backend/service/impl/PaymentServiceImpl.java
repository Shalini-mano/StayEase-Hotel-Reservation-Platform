package com.stayease.backend.service.impl;
import com.stayease.backend.service.SmsService;
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
import com.stayease.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SmsService smsService;
    @Override
    public PaymentResponse makePayment(
            PaymentRequest request,
            String customerEmail) {

        // Get logged-in customer
        User customer = getUser(customerEmail);

        // Find booking
        Booking booking = bookingRepository
                .findById(request.getBookingId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found"
                        )
                );

        // Verify booking belongs to customer
        if (!booking.getUserId().equals(customer.getId())) {

            throw new BadRequestException(
                    "You are not authorized to pay for this booking"
            );
        }

        // Cannot pay for cancelled booking
        if (booking.getStatus() == BookingStatus.CANCELLED) {

            throw new BadRequestException(
                    "Payment cannot be made for a cancelled booking"
            );
        }

        // Prevent duplicate payment
        if (paymentRepository.existsByBookingId(
                booking.getId())) {

            throw new ResourceAlreadyExistsException(
                    "Payment already exists for this booking"
            );
        }

        // Get payment amount from booking
        BigDecimal amount =
                BigDecimal.valueOf(
                        booking.getTotalPrice()
                );

        // Create payment
        Payment payment = Payment.builder()
                .bookingId(booking.getId())
                .userId(customer.getId())
                .transactionId(
                        UUID.randomUUID().toString()
                )
                .amount(amount)
                .paymentMethod(
                        request.getPaymentMethod()
                )
                .status(PaymentStatus.SUCCESS)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Save payment
        Payment savedPayment =
                paymentRepository.save(payment);

        // Payment successful -> confirm booking
        booking.setStatus(
                BookingStatus.CONFIRMED
        );

        booking.setUpdatedAt(
                LocalDateTime.now()
        );

        bookingRepository.save(booking);

        // ===============================
        // IN-APP NOTIFICATION
        // ===============================

        notificationService.createNotification(
                customer.getId(),
                NotificationType.PAYMENT_SUCCESS,
                "Payment successful",
                "Your payment of €"
                        + savedPayment.getAmount()
                        + " for booking "
                        + booking.getId()
                        + " was successful."
        );

        // ===============================
        // EMAIL NOTIFICATION
        // ===============================

        emailService.sendEmail(
                customer.getEmail(),
                "StayEase - Booking Confirmed",

                """
                Hello %s,

                Your payment was successful and your booking is now confirmed.

                Booking Details
                -------------------------
                Booking ID: %s
                Check-in: %s
                Check-out: %s
                Guests: %d
                Number of nights: %d

                Payment Details
                -------------------------
                Transaction ID: %s
                Amount paid: €%s
                Payment method: %s
                Payment status: %s

                Booking status: %s

                Thank you for booking with StayEase.

                Regards,
                StayEase Team
                """.formatted(
                        customer.getFirstName(),
                        booking.getId(),
                        booking.getCheckIn(),
                        booking.getCheckOut(),
                        booking.getGuests(),
                        booking.getNumberOfNights(),
                        savedPayment.getTransactionId(),
                        savedPayment.getAmount(),
                        savedPayment.getPaymentMethod(),
                        savedPayment.getStatus(),
                        booking.getStatus()
                )
        );
        if (customer.getPhone() != null && !customer.getPhone().isBlank()) {

            smsService.sendSms(
                    customer.getPhone(),
                    "StayEase: Payment successful! Your booking "
                            + booking.getId()
                            + " is confirmed. Amount paid: €"
                            + savedPayment.getAmount()
                            + ". Check-in: "
                            + booking.getCheckIn()
                            + ". Thank you for booking with StayEase."
            );
        }
        return mapToResponse(savedPayment);
    }

    @Override
    public PaymentResponse getPaymentByBooking(
            String bookingId,
            String customerEmail) {

        User customer =
                getUser(customerEmail);

        Booking booking =
                bookingRepository
                        .findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found"
                                )
                        );

        // Verify ownership
        if (!booking.getUserId()
                .equals(customer.getId())) {

            throw new BadRequestException(
                    "You are not authorized to access this payment"
            );
        }

        Payment payment =
                paymentRepository
                        .findByBookingId(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found"
                                )
                        );

        return mapToResponse(payment);
    }

    // ===============================
    // HELPER - GET USER
    // ===============================

    private User getUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }

    // ===============================
    // MAPPER
    // ===============================

    private PaymentResponse mapToResponse(
            Payment payment) {

        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(
                        payment.getBookingId()
                )
                .transactionId(
                        payment.getTransactionId()
                )
                .amount(
                        payment.getAmount()
                )
                .paymentMethod(
                        payment.getPaymentMethod()
                )
                .status(
                        payment.getStatus()
                )
                .createdAt(
                        payment.getCreatedAt()
                )
                .build();
    }
}