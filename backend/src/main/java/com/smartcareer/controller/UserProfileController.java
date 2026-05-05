package com.smartcareer.controller;

import com.smartcareer.dto.UpdateBranchRequest;
import com.smartcareer.dto.UpdateProfileRequest;
import com.smartcareer.dto.ChangePasswordRequest;
import com.smartcareer.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authenticated profile updates.
 */
@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class UserProfileController {

    private final UserService userService;

    public UserProfileController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/api/profile/branch")
    public ResponseEntity<Void> updateBranch(
            @Valid @RequestBody UpdateBranchRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        userService.updateBranch(userId, request.branch());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/profile")
    public ResponseEntity<Void> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        userService.updateProfile(userId, request.name(), request.email());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/profile/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        userService.changePassword(userId, request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
