package com.smartcareer.service;

import com.smartcareer.dto.AuthResponse;
import com.smartcareer.dto.LoginRequest;
import com.smartcareer.dto.RegisterRequest;
import com.smartcareer.entity.User;
import com.smartcareer.repository.UserRepository;
import com.smartcareer.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Registration and login — passwords stored with BCrypt.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        String email = req.email() != null && !req.email().isBlank() ? req.email().trim() : null;
        if (email != null && userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (userRepository.existsByName(req.name().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Name already taken");
        }
        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(req.password()));
        userRepository.save(user);
        String userIdStr = String.valueOf(user.getId());
        String token = jwtService.generateToken(userIdStr);
        return AuthResponse.of(token, userIdStr, user.getName(), user.getEmail(), user.getBranch());
    }
 
    public AuthResponse login(LoginRequest req) {
        String id = req.identifier().trim();
        User user = id.contains("@")
                ? userRepository.findByEmail(id).orElseThrow(() -> unauthorized())
                : userRepository.findByName(id).orElseThrow(() -> unauthorized());
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw unauthorized();
        }
        String userIdStr = String.valueOf(user.getId());
        String token = jwtService.generateToken(userIdStr);
        return AuthResponse.of(token, userIdStr, user.getName(), user.getEmail(), user.getBranch());
    }

    private static ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
}
