package com.smartcareer.dto;

import java.util.List;

public record SkillGapResponse(
    List<GapItem> missingSkills,
    String overallAdvice
) {
    public record GapItem(
        String skill,
        String importance, // High, Medium, Low
        String difficulty, // Easy, Intermediate, Hard
        String estimatedTime,
        String learningOrder // 1, 2, 3...
    ) {}
}
