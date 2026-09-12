package com.stayease.backend.service.impl;

import com.stayease.backend.dto.request.LoginRequest;
import com.stayease.backend.dto.request.RegisterRequest;
import com.stayease.backend.dto.response.AuthResponse;
import com.stayease.backend.enums.Role;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.PasswordResetTokenRepository;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id("user123")
                .firstName("Shalini")
                .lastName("Manoharan")
                .email("shalini@test.com")
                .password("encodedPassword")
                .phone("+31600000000")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();
    }

    @Test
    void register_ShouldRegisterUserSuccessfully() {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("Shalini");
        request.setLastName("Manoharan");
        request.setEmail("shalini@test.com");
        request.setPassword("Password123");
        request.setPhone("+31600000000");

        when(
                userRepository.existsByEmail(
                        request.getEmail()
                )
        ).thenReturn(false);

        when(
                passwordEncoder.encode(
                        request.getPassword()
                )
        ).thenReturn("encodedPassword");

        when(
                userRepository.save(any(User.class))
        ).thenReturn(user);

        when(
                jwtService.generateToken(
                        request.getEmail()
                )
        ).thenReturn("jwt-token");

        AuthResponse response =
                authService.register(request);

        assertNotNull(response);

        assertEquals(
                "jwt-token",
                response.getToken()
        );

        assertEquals(
                "User registered successfully",
                response.getMessage()
        );

        verify(userRepository)
                .save(any(User.class));
    }

    @Test
    void login_ShouldLoginSuccessfully() {

        LoginRequest request =
                new LoginRequest();

        request.setEmail(
                "shalini@test.com"
        );

        request.setPassword(
                "Password123"
        );

        when(
                userRepository.findByEmail(
                        request.getEmail()
                )
        ).thenReturn(
                Optional.of(user)
        );

        when(
                jwtService.generateToken(
                        request.getEmail()
                )
        ).thenReturn(
                "jwt-token"
        );

        AuthResponse response =
                authService.login(request);

        assertNotNull(response);

        assertEquals(
                "jwt-token",
                response.getToken()
        );

        assertEquals(
                "Login successful",
                response.getMessage()
        );

        verify(
                authenticationManager
        ).authenticate(
                any(
                        UsernamePasswordAuthenticationToken.class
                )
        );
    }
}