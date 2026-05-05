package com.smartcareer.dto;

/**
 * Returned after successful login or registration.
 */
public record AuthResponse(
        String token,
        String tokenType,
        String userId,
        String name,
        String email,
        String branch
) {
    public static AuthResponse of(String token, String userId, String name, String email, String branch) {
        return new AuthResponse(token, "Bearer", userId, name, email, branch);
    }
}
