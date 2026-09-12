package com.stayease.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HotelSearchResponse {

    private HotelResponse hotel;

    private List<RoomResponse> availableRooms;

    private Integer availableRoomCount;

    private Double lowestPrice;
}