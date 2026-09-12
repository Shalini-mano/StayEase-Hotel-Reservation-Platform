package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.HotelRequest;
import com.stayease.backend.dto.response.HotelResponse;
import com.stayease.backend.enums.Role;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.HotelRepository;
import com.stayease.backend.repository.RoomRepository;
import com.stayease.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HotelServiceImplTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private HotelServiceImpl hotelService;

    private User manager;
    private Hotel hotel;

    @BeforeEach
    void setUp() {

        manager = User.builder()
                .id("manager123")
                .firstName("Hotel")
                .lastName("Manager")
                .email("manager@test.com")
                .role(Role.HOTEL_MANAGER)
                .enabled(true)
                .build();

        hotel = Hotel.builder()
                .id("hotel123")
                .name("StayEase Amsterdam")
                .description("Modern hotel in Amsterdam")
                .address("Damrak 1")
                .city("Amsterdam")
                .country("Netherlands")
                .postalCode("1012LH")
                .latitude(52.3702)
                .longitude(4.8952)
                .amenities(
                        List.of(
                                "WiFi",
                                "Parking",
                                "Breakfast"
                        )
                )
                .images(
                        List.of(
                                "https://example.com/hotel.jpg"
                        )
                )
                .policies("No smoking")
                .rating(4.5)
                .active(true)
                .managerId("manager123")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // =================================================
    // CREATE HOTEL SUCCESS
    // =================================================

    @Test
    void createHotel_ShouldCreateHotelSuccessfully() {

        HotelRequest request =
                new HotelRequest();

        request.setName(
                "StayEase Amsterdam"
        );

        request.setDescription(
                "Modern hotel in Amsterdam"
        );

        request.setAddress(
                "Damrak 1"
        );

        request.setCity(
                "Amsterdam"
        );

        request.setCountry(
                "Netherlands"
        );

        request.setPostalCode(
                "1012LH"
        );

        request.setLatitude(
                52.3702
        );

        request.setLongitude(
                4.8952
        );

        request.setAmenities(
                List.of(
                        "WiFi",
                        "Parking",
                        "Breakfast"
                )
        );

        request.setImages(
                List.of(
                        "https://example.com/hotel.jpg"
                )
        );

        request.setPolicies(
                "No smoking"
        );

        when(
                userRepository.findByEmail(
                        "manager@test.com"
                )
        ).thenReturn(
                Optional.of(manager)
        );

        when(
                hotelRepository.save(
                        any(Hotel.class)
                )
        ).thenAnswer(invocation -> {

            Hotel savedHotel =
                    invocation.getArgument(0);

            savedHotel.setId(
                    "hotel123"
            );

            return savedHotel;
        });

        HotelResponse response =
                hotelService.createHotel(
                        request,
                        "manager@test.com"
                );

        assertNotNull(response);

        assertEquals(
                "hotel123",
                response.getId()
        );

        assertEquals(
                "StayEase Amsterdam",
                response.getName()
        );

        assertEquals(
                "Amsterdam",
                response.getCity()
        );

        assertEquals(
                "manager123",
                response.getManagerId()
        );

        assertTrue(
                response.isActive()
        );

        /*
         * New hotels start with rating 0.
         */
        assertEquals(
                0.0,
                response.getRating()
        );

        verify(
                hotelRepository
        ).save(
                any(Hotel.class)
        );
    }

    // =================================================
    // CREATE HOTEL - WRONG ROLE
    // =================================================

    @Test
    void createHotel_ShouldFailWhenUserIsNotHotelManager() {

        HotelRequest request =
                new HotelRequest();

        request.setName(
                "StayEase Amsterdam"
        );

        manager.setRole(
                Role.CUSTOMER
        );

        when(
                userRepository.findByEmail(
                        "manager@test.com"
                )
        ).thenReturn(
                Optional.of(manager)
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                hotelService.createHotel(
                                        request,
                                        "manager@test.com"
                                )
                );

        assertEquals(
                "Only hotel managers can create hotels",
                exception.getMessage()
        );

        verify(
                hotelRepository,
                never()
        ).save(
                any(Hotel.class)
        );
    }

    // =================================================
    // GET HOTEL
    // =================================================

    @Test
    void getHotelById_ShouldReturnHotelSuccessfully() {

        when(
                hotelRepository.findById(
                        "hotel123"
                )
        ).thenReturn(
                Optional.of(hotel)
        );

        HotelResponse response =
                hotelService.getHotelById(
                        "hotel123"
                );

        assertNotNull(response);

        assertEquals(
                "hotel123",
                response.getId()
        );

        assertEquals(
                "StayEase Amsterdam",
                response.getName()
        );

        assertEquals(
                "Amsterdam",
                response.getCity()
        );

        assertEquals(
                "Netherlands",
                response.getCountry()
        );

        assertEquals(
                4.5,
                response.getRating()
        );
    }

    // =================================================
    // HOTEL NOT FOUND
    // =================================================

    @Test
    void getHotelById_ShouldFailWhenHotelDoesNotExist() {

        when(
                hotelRepository.findById(
                        "unknownHotel"
                )
        ).thenReturn(
                Optional.empty()
        );

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () ->
                                hotelService.getHotelById(
                                        "unknownHotel"
                                )
                );

        assertEquals(
                "Hotel not found with id: unknownHotel",
                exception.getMessage()
        );
    }

    // =================================================
    // GET MANAGER HOTELS
    // =================================================

    @Test
    void getMyHotels_ShouldReturnManagerHotels() {

        when(
                userRepository.findByEmail(
                        "manager@test.com"
                )
        ).thenReturn(
                Optional.of(manager)
        );

        when(
                hotelRepository.findByManagerId(
                        "manager123"
                )
        ).thenReturn(
                List.of(hotel)
        );

        List<HotelResponse> responses =
                hotelService.getMyHotels(
                        "manager@test.com"
                );

        assertNotNull(
                responses
        );

        assertEquals(
                1,
                responses.size()
        );

        assertEquals(
                "hotel123",
                responses.get(0).getId()
        );

        assertEquals(
                "StayEase Amsterdam",
                responses.get(0).getName()
        );

        verify(
                hotelRepository
        ).findByManagerId(
                "manager123"
        );
    }

    // =================================================
    // GET MANAGER HOTELS - WRONG ROLE
    // =================================================

    @Test
    void getMyHotels_ShouldFailWhenUserIsNotHotelManager() {

        manager.setRole(
                Role.CUSTOMER
        );

        when(
                userRepository.findByEmail(
                        "manager@test.com"
                )
        ).thenReturn(
                Optional.of(manager)
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                hotelService.getMyHotels(
                                        "manager@test.com"
                                )
                );

        assertEquals(
                "Only hotel managers can view their hotels",
                exception.getMessage()
        );

        verify(
                hotelRepository,
                never()
        ).findByManagerId(
                any()
        );
    }

    // =================================================
    // UPDATE HOTEL SUCCESS
    // =================================================

    @Test
    void updateHotel_ShouldUpdateHotelSuccessfully() {

        HotelRequest request =
                new HotelRequest();

        request.setName(
                "Updated StayEase Amsterdam"
        );

        request.setDescription(
                "Updated description"
        );

        request.setAddress(
                "Damrak 10"
        );

        request.setCity(
                "Amsterdam"
        );

        request.setCountry(
                "Netherlands"
        );

        request.setPostalCode(
                "1012AB"
        );

        request.setLatitude(
                52.3705
        );

        request.setLongitude(
                4.8955
        );

        request.setAmenities(
                List.of(
                        "WiFi",
                        "Spa",
                        "Gym"
                )
        );

        request.setImages(
                List.of(
                        "https://example.com/updated.jpg"
                )
        );

        request.setPolicies(
                "No pets"
        );

        when(
                userRepository.findByEmail(
                        "manager@test.com"
                )
        ).thenReturn(
                Optional.of(manager)
        );

        when(
                hotelRepository.findById(
                        "hotel123"
                )
        ).thenReturn(
                Optional.of(hotel)
        );

        when(
                hotelRepository.save(
                        any(Hotel.class)
                )
        ).thenAnswer(
                invocation ->
                        invocation.getArgument(0)
        );

        HotelResponse response =
                hotelService.updateHotel(
                        "hotel123",
                        request,
                        "manager@test.com"
                );

        assertNotNull(response);

        assertEquals(
                "Updated StayEase Amsterdam",
                response.getName()
        );

        assertEquals(
                "Updated description",
                response.getDescription()
        );

        assertEquals(
                "Damrak 10",
                response.getAddress()
        );

        assertEquals(
                "No pets",
                response.getPolicies()
        );

        assertTrue(
                response.getAmenities()
                        .contains("Spa")
        );

        verify(
                hotelRepository
        ).save(
                hotel
        );
    }

    // =================================================
    // UPDATE HOTEL - UNAUTHORIZED MANAGER
    // =================================================

    @Test
    void updateHotel_ShouldFailWhenManagerDoesNotOwnHotel() {

        User anotherManager =
                User.builder()
                        .id("manager999")
                        .email(
                                "other@test.com"
                        )
                        .role(
                                Role.HOTEL_MANAGER
                        )
                        .build();

        HotelRequest request =
                new HotelRequest();

        request.setName(
                "Updated Hotel"
        );

        when(
                userRepository.findByEmail(
                        "other@test.com"
                )
        ).thenReturn(
                Optional.of(
                        anotherManager
                )
        );

        when(
                hotelRepository.findById(
                        "hotel123"
                )
        ).thenReturn(
                Optional.of(hotel)
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                hotelService.updateHotel(
                                        "hotel123",
                                        request,
                                        "other@test.com"
                                )
                );

        assertEquals(
                "You are not authorized to modify this hotel",
                exception.getMessage()
        );

        verify(
                hotelRepository,
                never()
        ).save(
                any()
        );
    }

    // =================================================
    // DELETE HOTEL SUCCESS
    // =================================================

    @Test
    void deleteHotel_ShouldDeleteHotelSuccessfully() {

        when(
                userRepository.findByEmail(
                        "manager@test.com"
                )
        ).thenReturn(
                Optional.of(manager)
        );

        when(
                hotelRepository.findById(
                        "hotel123"
                )
        ).thenReturn(
                Optional.of(hotel)
        );

        hotelService.deleteHotel(
                "hotel123",
                "manager@test.com"
        );

        verify(
                hotelRepository
        ).delete(
                hotel
        );
    }

    // =================================================
    // DELETE HOTEL - UNAUTHORIZED
    // =================================================

    @Test
    void deleteHotel_ShouldFailWhenManagerDoesNotOwnHotel() {

        User anotherManager =
                User.builder()
                        .id("manager999")
                        .email(
                                "other@test.com"
                        )
                        .role(
                                Role.HOTEL_MANAGER
                        )
                        .build();

        when(
                userRepository.findByEmail(
                        "other@test.com"
                )
        ).thenReturn(
                Optional.of(
                        anotherManager
                )
        );

        when(
                hotelRepository.findById(
                        "hotel123"
                )
        ).thenReturn(
                Optional.of(hotel)
        );

        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () ->
                                hotelService.deleteHotel(
                                        "hotel123",
                                        "other@test.com"
                                )
                );

        assertEquals(
                "You are not authorized to delete this hotel",
                exception.getMessage()
        );

        verify(
                hotelRepository,
                never()
        ).delete(
                any()
        );
    }
}