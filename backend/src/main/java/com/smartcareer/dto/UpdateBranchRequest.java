package com.smartcareer.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateBranchRequest(
        @NotBlank(message = "Branch is required")
        String branch
) {}
