package com.smartcareer.controller;

import com.smartcareer.dto.RoadmapRequest;
import com.smartcareer.dto.RoadmapResponse;
import com.smartcareer.service.RoadmapService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @PostMapping
    public ResponseEntity<RoadmapResponse> roadmap(@Valid @RequestBody RoadmapRequest request) {
        return ResponseEntity.ok(roadmapService.generate(request));
    }
}
