package com.smartcareer.dto;

import java.util.List;

public record SkillGapRequest(
    String targetCareer,
    List<String> currentSkills
) {}
