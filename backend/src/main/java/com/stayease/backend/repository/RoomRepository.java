package com.stayease.backend.repository;

import com.stayease.backend.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomRepository extends MongoRepository<Room, String> {
    List<Room> findByHotelId(String hotelId);
    List<Room> findByHotelIdAndAvailableTrue(String hotelId);

    boolean existsByHotelIdAndRoomNumber(
            String hotelId,
            String roomNumber
    );
    List<Room> findByHotelIdAndCapacityGreaterThanEqualAndAvailableTrue(
            String hotelId,
            Integer capacity
    );

}
