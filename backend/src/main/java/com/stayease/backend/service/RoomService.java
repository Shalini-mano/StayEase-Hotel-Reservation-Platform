package com.stayease.backend.service;

import com.stayease.backend.dto.request.RoomRequest;
import com.stayease.backend.dto.response.RoomResponse;

import java.util.List;

public interface RoomService {

    RoomResponse createRoom(
            RoomRequest request,
            String managerEmail
    );

    List<RoomResponse> getRoomsByHotel(String hotelId);

    List<RoomResponse> getAvailableRooms(String hotelId);

    RoomResponse getRoomById(String id);

    RoomResponse updateRoom(
            String id,
            RoomRequest request,
            String managerEmail
    );

    void deleteRoom(
            String id,
            String managerEmail
    );
}