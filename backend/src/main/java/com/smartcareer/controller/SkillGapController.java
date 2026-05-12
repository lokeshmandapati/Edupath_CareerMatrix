package com.smartcareer.controller;

import com.smartcareer.dto.SkillGapRequest;
import com.smartcareer.dto.SkillGapResponse;
import com.smartcareer.service.SkillGapService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/toolkit/skill-gap")
public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    @PostMapping
    public ResponseEntity<SkillGapResponse> analyze(@Valid @RequestBody SkillGapRequest request) {
        return ResponseEntity.ok(skillGapService.analyzeGap(request));
    }
}
