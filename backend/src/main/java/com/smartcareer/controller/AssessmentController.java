package com.smartcareer.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.smartcareer.service.AssessmentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @GetMapping("/api/assessment/questions")
    public JsonNode getQuestions(@RequestParam(defaultValue = "AFTER12") String type) {
        return assessmentService.generateDynamicQuestions(type);
    }
}
