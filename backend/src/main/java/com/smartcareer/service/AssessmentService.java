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
                String systemPrompt = "You are an expert educational psychologist and aptitude test designer. Generate valid JSON arrays only.";
                String response = geminiService.chatCompletion(systemPrompt, List.of(), prompt);
                
                // Robust JSON extraction
                int start = response.indexOf("[");
                int end = response.lastIndexOf("]");
                
                if (start != -1 && end != -1 && end > start) {
                    response = response.substring(start, end + 1);
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
