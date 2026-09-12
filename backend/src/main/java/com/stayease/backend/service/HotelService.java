package com.stayease.backend.service;

import com.stayease.backend.dto.request.HotelRequest;
import com.stayease.backend.dto.request.HotelSearchRequest;
import com.stayease.backend.dto.response.HotelResponse;
import com.stayease.backend.dto.response.HotelSearchResponse;

import java.util.List;

public interface HotelService {

    HotelResponse createHotel(
            HotelRequest request,
            String managerEmail
    );

    List<HotelSearchResponse> searchHotels(
            HotelSearchRequest request
    );

    List<HotelResponse> getAllHotels();

    List<HotelResponse> getMyHotels(
            String managerEmail
    );

    HotelResponse getHotelById(String id);

    HotelResponse updateHotel(
            String id,
            HotelRequest request,
            String managerEmail
    );

    void deleteHotel(
            String id,
            String managerEmail
    );
}