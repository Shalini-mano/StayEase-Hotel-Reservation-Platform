package com.stayease.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(Customizer.withDefaults())

                .csrf(csrf ->
                        csrf.disable()
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * AUTHENTICATION
                         */
                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()

                        /*
                         * PUBLIC HOTEL SEARCH
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/hotels/search"
                        )
                        .permitAll()

                        /*
                         * PUBLIC HOTEL DETAILS
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/hotels/*"
                        )
                        .permitAll()

                        /*
                         * PUBLIC ROOM INFORMATION
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/rooms/hotel/**"
                        )
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/rooms/*"
                        )
                        .permitAll()

                        /*
                         * PUBLIC HOTEL REVIEWS
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/reviews/hotel/**"
                        )
                        .permitAll()

                        /*
                         * SWAGGER
                         */
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        )
                        .permitAll()

                        /*
                         * EVERYTHING ELSE REQUIRES JWT
                         */
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration
                .getAuthenticationManager();
    }
}