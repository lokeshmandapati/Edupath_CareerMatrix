package com.smartcareer.service;

import com.smartcareer.entity.User;
import com.smartcareer.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * User profile updates (branch selection).
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final BranchCareerConfigService branchCareerConfigService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BranchCareerConfigService branchCareerConfigService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.branchCareerConfigService = branchCareerConfigService;
        this.passwordEncoder = passwordEncoder;
    }

    public void updateBranch(String userId, String branchCode) {
        var profile = branchCareerConfigService.requireBranch(branchCode);
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setBranch(profile.code());
        userRepository.save(user);
    }
 
    public void updateProfile(String userId, String name, String email) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setName(name);
        user.setEmail(email);
        userRepository.save(user);
    }
 
    public void changePassword(String userId, String currentPass, String newPass) {
        User user = userRepository.findById(Long.valueOf(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!passwordEncoder.matches(currentPass, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);
    }
}
