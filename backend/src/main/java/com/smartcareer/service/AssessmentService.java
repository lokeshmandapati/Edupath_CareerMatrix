package com.smartcareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssessmentService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public AssessmentService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public JsonNode generateDynamicQuestions(String type) {
        long timestamp = System.currentTimeMillis();
        String prompt = "Generate a JSON array of 12 unique, randomized aptitude and personality questions for a " + type + " assessment. " +
                "Reference ID: " + timestamp + ". Ensure these questions are DIFFERENT from previous ones. " +
                "Each question must have: 'id' (unique string), 'prompt' (string), and 'options' (array of 3 objects with 'label' and 'points' 0-2). " +
                "Ensure the questions are diverse (logic, emotional intelligence, technical interest, work style). " +
                "Return ONLY the raw JSON array.";

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
                
                return objectMapper.readTree(response);
            } catch (Exception e) {
                System.err.println("AI Question generation failed: " + e.getMessage());
            }
        }
        return null;
    }
}
