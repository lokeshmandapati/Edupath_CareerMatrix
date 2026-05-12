package com.smartcareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AssessmentService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public AssessmentService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> generateDynamicQuestions(String type) {
        String prompt = """
                Generate 12 unique and engaging aptitude/personality questions for a student career assessment.
                The student's context is: %s.
                
                For each question, provide:
                1. A clear question prompt.
                2. 3 multiple-choice options.
                3. Each option must have a 'points' value (0, 1, or 2) reflecting the strength of the trait being measured (e.g., leadership, logic, creativity).
                
                Return the response as a VALID JSON array of objects.
                Each object must have: "id" (string, e.g. "q1"), "prompt" (string), and "options" (array of { "label": string, "points": number }).
                
                Ensure the questions are diverse, covering logic, personality, ambition, and problem-solving.
                """.formatted(type);

        if (geminiService.isConfigured()) {
            try {
                String response = geminiService.generateContent(prompt);
                // Clean up markdown if present
                if (response.contains("```json")) {
                    response = response.substring(response.indexOf("```json") + 7, response.lastIndexOf("```"));
                } else if (response.contains("```")) {
                    response = response.substring(response.indexOf("```") + 3, response.lastIndexOf("```"));
                }
                
                JsonNode root = objectMapper.readTree(response);
                if (root.isArray()) {
                    List<Map<String, Object>> questions = new ArrayList<>();
                    for (JsonNode node : root) {
                        Map<String, Object> q = objectMapper.convertValue(node, Map.class);
                        questions.add(q);
                    }
                    return questions;
                }
            } catch (Exception e) {
                System.err.println("Failed to generate dynamic questions: " + e.getMessage());
            }
        }

        // Fallback to empty list (frontend will use static ones)
        return List.of();
    }
}
