package com.stayease.backend.service.impl;
import com.stayease.backend.enums.Role;
import com.stayease.backend.dto.request.HotelRequest;
import com.stayease.backend.dto.response.HotelResponse;
import com.stayease.backend.exception.BadRequestException;
import com.stayease.backend.exception.ResourceNotFoundException;
import com.stayease.backend.model.Hotel;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.BookingRepository;
import com.stayease.backend.repository.HotelRepository;
import com.stayease.backend.repository.RoomRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.stayease.backend.dto.request.HotelSearchRequest;
import com.stayease.backend.dto.response.HotelSearchResponse;
import com.stayease.backend.dto.response.RoomResponse;
import com.stayease.backend.model.Room;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    private User getManager(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel manager not found"
                        ));
    }

    @Override
    public List<HotelResponse> getMyHotels(
            String managerEmail) {

        User manager = getManager(managerEmail);

        if (manager.getRole() != Role.HOTEL_MANAGER) {
            throw new BadRequestException(
                    "Only hotel managers can view their hotels"
            );
        }

        return hotelRepository
                .findByManagerId(manager.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public List<HotelSearchResponse> searchHotels(
            HotelSearchRequest request) {

        validateSearchRequest(request);

        String destination =
                request.getCity() == null
                        ? ""
                        : request.getCity().trim();

        List<Hotel> hotels = hotelRepository.findByActiveTrue();

        return hotels.stream()

                // Destination can match city OR hotel name
                .filter(hotel -> {

                    if (destination.isBlank()) {
                        return true;
                    }

                    boolean cityMatches =
                            hotel.getCity() != null &&
                                    hotel.getCity()
                                            .toLowerCase()
                                            .contains(
                                                    destination.toLowerCase()
                                            );

                    boolean nameMatches =
                            hotel.getName() != null &&
                                    hotel.getName()
                                            .toLowerCase()
                                            .contains(
                                                    destination.toLowerCase()
                                            );

                    return cityMatches || nameMatches;
                })

                // Rating filter
                .filter(hotel ->
                        request.getMinRating() == null ||
                                (
                                        hotel.getRating() != null &&
                                                hotel.getRating()
                                                        >= request.getMinRating()
                                )
                )

                // Amenity filter
                .filter(hotel ->
                        request.getAmenity() == null ||
                                request.getAmenity().isBlank() ||
                                containsAmenity(
                                        hotel,
                                        request.getAmenity()
                                )
                )

                .map(hotel ->
                        buildSearchResult(
                                hotel,
                                request
                        )
                )

                // Only hotels having matching available rooms
                .filter(result ->
                        result.getAvailableRoomCount() > 0
                )

                .toList();
    }
    private void validateSearchRequest(
            HotelSearchRequest request) {

        if ((request.getCheckIn() == null)
                != (request.getCheckOut() == null)) {

            throw new BadRequestException(
                    "Both check-in and check-out dates are required"
            );
        }

        if (request.getCheckIn() != null &&
                !request.getCheckOut()
                        .isAfter(request.getCheckIn())) {

            throw new BadRequestException(
                    "Check-out date must be after check-in date"
            );
        }

        if (request.getMinPrice() != null &&
                request.getMaxPrice() != null &&
                request.getMinPrice() > request.getMaxPrice()) {

            throw new BadRequestException(
                    "Minimum price cannot be greater than maximum price"
            );
        }
    }
    private boolean containsAmenity(
            Hotel hotel,
            String amenity) {

        if (hotel.getAmenities() == null) {
            return false;
        }

        return hotel.getAmenities()
                .stream()
                .anyMatch(value ->
                        value.equalsIgnoreCase(amenity)
                );
    }
    private HotelSearchResponse buildSearchResult(
            Hotel hotel,
            HotelSearchRequest request) {

        List<Room> rooms;

        if (request.getGuests() != null) {

            rooms = roomRepository
                    .findByHotelIdAndCapacityGreaterThanEqualAndAvailableTrue(
                            hotel.getId(),
                            request.getGuests()
                    );

        } else {

            rooms = roomRepository
                    .findByHotelIdAndAvailableTrue(
                            hotel.getId()
                    );
        }

        List<Room> availableRooms = rooms.stream()

                .filter(room ->
                        request.getMinPrice() == null ||
                                room.getPricePerNight()
                                        >= request.getMinPrice()
                )

                .filter(room ->
                        request.getMaxPrice() == null ||
                                room.getPricePerNight()
                                        <= request.getMaxPrice()
                )

                .filter(room ->
                        isRoomAvailableForDates(
                                room,
                                request.getCheckIn(),
                                request.getCheckOut()
                        )
                )

                .toList();

        Double lowestPrice = availableRooms.stream()
                .map(Room::getPricePerNight)
                .min(Double::compareTo)
                .orElse(null);

        return HotelSearchResponse.builder()
                .hotel(mapToResponse(hotel))
                .availableRooms(
                        availableRooms.stream()
                                .map(this::mapRoomToResponse)
                                .toList()
                )
                .availableRoomCount(availableRooms.size())
                .lowestPrice(lowestPrice)
                .build();
    }
    private boolean isRoomAvailableForDates(
            Room room,
            LocalDate checkIn,
            LocalDate checkOut) {

        if (checkIn == null || checkOut == null) {
            return true;
        }

        return bookingRepository
                .findOverlappingBookings(
                        room.getId(),
                        checkIn,
                        checkOut
                )
                .isEmpty();
    }
    @Override
    public HotelResponse createHotel(
            HotelRequest request,
            String managerEmail) {

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel manager not found"
                        ));

        if (manager.getRole() != Role.HOTEL_MANAGER) {
            throw new BadRequestException(
                    "Only hotel managers can create hotels"
            );
        }

        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .postalCode(request.getPostalCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .amenities(request.getAmenities())
                .images(request.getImages())
                .policies(request.getPolicies())
                .rating(0.0)
                .active(true)
                .managerId(manager.getId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Hotel savedHotel = hotelRepository.save(hotel);

        return mapToResponse(savedHotel);
    }
    @Override
    public List<HotelResponse> getAllHotels() {

        return hotelRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public HotelResponse getHotelById(String id) {

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found with id: " + id
                        ));

        return mapToResponse(hotel);
    }

    @Override
    public HotelResponse updateHotel(
            String id,
            HotelRequest request,
            String managerEmail) {

        User manager = getManager(managerEmail);

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found with id: " + id
                        ));

        if (!manager.getId().equals(hotel.getManagerId())) {
            throw new BadRequestException(
                    "You are not authorized to modify this hotel"
            );
        }

        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setCountry(request.getCountry());
        hotel.setPostalCode(request.getPostalCode());
        hotel.setLatitude(request.getLatitude());
        hotel.setLongitude(request.getLongitude());
        hotel.setAmenities(request.getAmenities());
        hotel.setImages(request.getImages());
        hotel.setPolicies(request.getPolicies());
        hotel.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(hotelRepository.save(hotel));
    }
    @Override
    public void deleteHotel(
            String id,
            String managerEmail) {

        User manager = getManager(managerEmail);

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found with id: " + id
                        ));

        if (!manager.getId().equals(hotel.getManagerId())) {
            throw new BadRequestException(
                    "You are not authorized to delete this hotel"
            );
        }

        hotelRepository.delete(hotel);
    }
    private HotelResponse mapToResponse(Hotel hotel) {

        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .postalCode(hotel.getPostalCode())
                .latitude(hotel.getLatitude())
                .longitude(hotel.getLongitude())
                .rating(hotel.getRating())
                .amenities(hotel.getAmenities())
                .images(hotel.getImages())
                .policies(hotel.getPolicies())
                .active(hotel.isActive())
                .managerId(hotel.getManagerId())
                .createdAt(hotel.getCreatedAt())
                .updatedAt(hotel.getUpdatedAt())
                .build();
    }
    private RoomResponse mapRoomToResponse(Room room) {

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