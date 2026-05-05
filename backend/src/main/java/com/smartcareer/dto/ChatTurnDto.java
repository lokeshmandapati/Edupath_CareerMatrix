package com.smartcareer.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Single turn in chat history (user or assistant).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatTurnDto(String role, String content) {
}
