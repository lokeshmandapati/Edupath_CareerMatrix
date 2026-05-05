package com.smartcareer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record Class10StreamRequest(
        @NotNull @Min(0) @Max(100) Integer math,
        @NotNull @Min(0) @Max(100) Integer science,
        @NotNull @Min(0) @Max(100) Integer english,
        @NotNull @Min(0) @Max(100) Integer social,
        @NotEmpty(message = "Select at least one interest")
        List<String> interests,
        List<String> aptitudeTags,
        String learningStyle,
        List<String> subjectComfort,
        String studyHours,
        String familyPriority
) {}

