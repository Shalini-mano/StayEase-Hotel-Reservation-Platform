package com.stayease.backend.service.impl;

import com.stayease.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmail(
            String to,
            String subject,
            String message
    ) {

        try {

            SimpleMailMessage email =
                    new SimpleMailMessage();

            email.setTo(to);
            email.setSubject(subject);
            email.setText(message);

            mailSender.send(email);

            log.info(
                    "Email successfully sent to {}",
                    to
            );

        } catch (Exception exception) {

            log.error(
                    "Failed to send email to {}",
                    to,
                    exception
            );
        }
    }
}