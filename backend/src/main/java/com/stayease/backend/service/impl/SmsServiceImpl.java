package com.stayease.backend.service.impl;

import com.stayease.backend.service.SmsService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsServiceImpl implements SmsService {

    private final String accountSid;
    private final String authToken;
    private final String twilioPhoneNumber;

    public SmsServiceImpl(
            @Value("${twilio.account-sid}") String accountSid,
            @Value("${twilio.auth-token}") String authToken,
            @Value("${twilio.phone-number}") String twilioPhoneNumber) {

        this.accountSid = accountSid;
        this.authToken = authToken;
        this.twilioPhoneNumber = twilioPhoneNumber;

        Twilio.init(accountSid, authToken);
    }

    @Override
    public void sendSms(
            String to,
            String messageText) {

        try {

            Message message = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(twilioPhoneNumber),
                    messageText
            ).create();

            log.info(
                    "SMS successfully sent to {}. SID: {}",
                    to,
                    message.getSid()
            );

        } catch (Exception exception) {

            log.error(
                    "Failed to send SMS to {}",
                    to,
                    exception
            );
        }
    }
}