package com.smartcareer.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Career chat — optional branch and profile fields personalize replies.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ChatRequest(
        @NotBlank(message = "Message is required")
        @Size(max = 8000, message = "Message is too long")
        String message,
        List<ChatTurnDto> history,
        /** ENGINEERING (default), CLASS10, AFTER12 */
        String assessmentType,
        /** Branch code (e.g. CSE) or full label (e.g. Mechanical Engineering) */
        String branch,
        List<String> skills,
        List<String> interests,
        /** Latest predicted top career from assessment (optional) */
        String topCareer
) {
    public ChatRequest {
        history = history == null ? List.of() : List.copyOf(history);
        skills = skills == null ? List.of() : List.copyOf(skills);
        interests = interests == null ? List.of() : List.copyOf(interests);
    }
}
