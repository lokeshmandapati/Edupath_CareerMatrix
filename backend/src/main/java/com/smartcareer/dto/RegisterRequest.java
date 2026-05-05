package com.smartcareer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Signup payload — email is optional.
 */
public record RegisterRequest(
        @NotBlank(message = "Name is required")
        String name,
        String email,
        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
        String password
) {}
