package com.smartcareer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;

/**
 * Career form submission — lists come from multi-select on the frontend.
 */
public record PredictionRequest(
        @NotNull @PositiveOrZero(message = "CGPA or percentage score must be >= 0")
        Double cgpa,
        @NotBlank(message = "Engineering branch is required")
        String branch,
        String stream,
        @NotEmpty(message = "Select at least one technical skill")
        List<String> technicalSkills,
        @NotEmpty(message = "Select at least one interest")
        List<String> interests,
        @NotBlank(message = "Project experience level is required")
        String projectExperience,
        String certifications,
        String preferredWorkType
) {}
