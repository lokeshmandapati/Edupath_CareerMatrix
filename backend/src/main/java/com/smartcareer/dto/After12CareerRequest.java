package com.smartcareer.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record After12CareerRequest(
        @NotBlank(message = "Stream is required")
        String stream,
        @NotNull @Min(0) @Max(100)
        Integer percentage,
        @NotEmpty(message = "Select at least one interest")
        List<String> interests,
        List<String> aptitudeTags,
        String workPreference,
        String budget,
        String locationFlexibility,
        String examReadiness
) {}

