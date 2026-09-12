package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.RoomRequest;
import com.stayease.backend.dto.response.RoomResponse;
import com.stayease.backend.enums.Role;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceAlreadyExistsException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Room;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.HotelRepository;
import com.stayease.backend.repository.RoomRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    @Override
    public RoomResponse createRoom(
            RoomRequest request,
            String managerEmail) {

        User manager = getManager(managerEmail);

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found with id: "
                                        + request.getHotelId()
                        ));

        if (!manager.getId().equals(hotel.getManagerId())) {
            throw new BadRequestException(
                    "You are not authorized to manage this hotel"
            );
        }

        if (roomRepository.existsByHotelIdAndRoomNumber(
                request.getHotelId(),
                request.getRoomNumber())) {

            throw new ResourceAlreadyExistsException(
                    "Room number already exists in this hotel"
            );
        }

        Room room = Room.builder()
                .hotelId(request.getHotelId())
                .roomNumber(request.getRoomNumber())
                .roomType(request.getRoomType())
                .description(request.getDescription())
                .pricePerNight(request.getPricePerNight())
                .capacity(request.getCapacity())
                .amenities(request.getAmenities())
                .images(request.getImages())
                .available(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return mapToResponse(roomRepository.save(room));
    }

    @Override
    public List<RoomResponse> getRoomsByHotel(String hotelId) {

        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException(
                    "Hotel not found with id: " + hotelId
            );
        }

        return roomRepository.findByHotelId(hotelId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<RoomResponse> getAvailableRooms(String hotelId) {

        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException(
                    "Hotel not found with id: " + hotelId
            );
        }

        return roomRepository
                .findByHotelIdAndAvailableTrue(hotelId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public RoomResponse getRoomById(String id) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + id
                        ));

        return mapToResponse(room);
    }

    @Override
    public RoomResponse updateRoom(
            String id,
            RoomRequest request,
            String managerEmail) {

        User manager = getManager(managerEmail);

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + id
                        ));

        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found"
                        ));

        if (!manager.getId().equals(hotel.getManagerId())) {
            throw new BadRequestException(
                    "You are not authorized to modify this room"
            );
        }

        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setDescription(request.getDescription());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        room.setAmenities(request.getAmenities());
        room.setImages(request.getImages());
        room.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(roomRepository.save(room));
    }

    @Override
    public void deleteRoom(
            String id,
            String managerEmail) {

        User manager = getManager(managerEmail);

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + id
                        ));

        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found"
                        ));

        if (!manager.getId().equals(hotel.getManagerId())) {
            throw new BadRequestException(
                    "You are not authorized to delete this room"
            );
        }

        roomRepository.delete(room);
    }

    private User getManager(String email) {

        User manager = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        if (manager.getRole() != Role.HOTEL_MANAGER) {
            throw new BadRequestException(
                    "Only hotel managers can manage rooms"
            );
        }

        return manager;
    }

    private RoomResponse mapToResponse(Room room) {

        return RoomResponse.builder()
                .id(room.getId())
                .hotelId(room.getHotelId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .description(room.getDescription())
                .pricePerNight(room.getPricePerNight())
                .capacity(room.getCapacity())
                .amenities(room.getAmenities())
                .images(room.getImages())
                .available(room.isAvailable())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}