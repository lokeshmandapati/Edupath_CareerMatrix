package com.smartcareer.controller;

import com.smartcareer.service.AssessmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessment")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @GetMapping("/questions")
    public List<Map<String, Object>> getDynamicQuestions(@RequestParam(defaultValue = "AFTER12") String type) {
        return assessmentService.generateDynamicQuestions(type);
    }
}
