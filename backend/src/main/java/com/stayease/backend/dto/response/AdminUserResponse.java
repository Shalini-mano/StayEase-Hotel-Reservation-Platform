package com.stayease.backend.dto.response;

import com.stayease.backend.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserResponse {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;
    private boolean enabled;
}