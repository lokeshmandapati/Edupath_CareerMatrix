package com.smartcareer.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Roadmap generation — branch tailors steps to the student's engineering stream.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record RoadmapRequest(
        @NotBlank(message = "Career is required")
        @Size(max = 200, message = "Career name is too long")
        String career,
        /** Branch code (CSE) or full name; optional — defaults to generic roadmap */
        String branch,
        /** ENGINEERING (default), CLASS10, AFTER12 */
        String type
) {
}
