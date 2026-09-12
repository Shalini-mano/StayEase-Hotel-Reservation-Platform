package com.stayease.backend.repository;

import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends MongoRepository<Hotel, String> {

    List<Hotel> findByCityIgnoreCase(String city);

    List<Hotel> findByManagerId(String managerId);

    List<Hotel> findByActiveTrue();

    List<Hotel> findByCityIgnoreCaseAndActiveTrue(String city);
    long countByActiveTrue();

    long countByActiveFalse();
    // HotelRepository.java
    Page<Hotel> findByActive(
            boolean active,
            Pageable pageable
    );

    Page<Hotel> findByCityIgnoreCase(
            String city,
            Pageable pageable
    );

    Page<Hotel> findByCityIgnoreCaseAndActive(
            String city,
            boolean active,
            Pageable pageable
    );

}