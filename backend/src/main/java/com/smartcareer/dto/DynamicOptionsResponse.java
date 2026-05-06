package com.smartcareer.dto;

import java.util.List;

public record DynamicOptionsResponse(
    List<String> skills,
    List<String> interests
) {
}
