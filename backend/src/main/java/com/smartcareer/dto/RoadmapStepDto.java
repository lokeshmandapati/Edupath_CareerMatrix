package com.smartcareer.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * One roadmap step — optional rich fields for tools, projects, and resources.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record RoadmapStepDto(
        String step,
        String details,
        List<String> tools,
        List<String> projects,
        List<String> resources
) {
    public RoadmapStepDto(String step, String details) {
        this(step, details, null, null, null);
    }

    public RoadmapStepDto {
        tools = tools == null ? List.of() : List.copyOf(tools);
        projects = projects == null ? List.of() : List.copyOf(projects);
        resources = resources == null ? List.of() : List.copyOf(resources);
    }
}
