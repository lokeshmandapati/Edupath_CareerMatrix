package com.smartcareer.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Login with email or name plus password.
 */
public record LoginRequest(
        @NotBlank(message = "Email or name is required")
        String identifier,
        @NotBlank(message = "Password is required")
        String password
) {}
