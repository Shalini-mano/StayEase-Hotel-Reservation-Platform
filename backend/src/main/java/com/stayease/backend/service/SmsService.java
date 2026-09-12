package com.stayease.backend.service;

public interface SmsService {

    void sendSms(
            String to,
            String message
    );
}