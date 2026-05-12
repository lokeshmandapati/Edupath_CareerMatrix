package com.smartcareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcareer.dto.SkillGapRequest;
import com.smartcareer.dto.SkillGapResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SkillGapService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public SkillGapService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public SkillGapResponse analyzeGap(SkillGapRequest request) {
        if (!geminiService.isConfigured()) {
            return fallbackResponse(request);
        }

        String prompt = """
                Analyze the skill gap for a user wanting to become a: %s.
                User's Current Skills: %s
                
                Identify the MISSING skills required for this role.
                For each missing skill, provide:
                1. importance (High, Medium, Low)
                2. difficulty (Easy, Intermediate, Hard)
                3. estimatedTime (e.g., "2-3 weeks", "2 months")
                4. learningOrder (numerical order of priority)
                
                Also provide a brief overallAdvice paragraph.
                
                Return ONLY valid JSON in this format:
                {
                  "missingSkills": [
                    {"skill": "...", "importance": "...", "difficulty": "...", "estimatedTime": "...", "learningOrder": "..."},
                    ...
                  ],
                  "overallAdvice": "..."
                }
                """.formatted(request.targetCareer(), String.join(", ", request.currentSkills()));

        try {
            String raw = geminiService.chatCompletion("You are an expert career counselor. Return ONLY JSON.", List.of(), prompt);
            raw = stripJsonFences(raw);
            JsonNode root = objectMapper.readTree(raw);
            
            List<SkillGapResponse.GapItem> items = new ArrayList<>();
            JsonNode arr = root.path("missingSkills");
            if (arr.isArray()) {
                for (JsonNode n : arr) {
                    items.add(new SkillGapResponse.GapItem(
                        n.path("skill").asText(""),
                        n.path("importance").asText("Medium"),
                        n.path("difficulty").asText("Intermediate"),
                        n.path("estimatedTime").asText("Varies"),
                        n.path("learningOrder").asText("1")
                    ));
                }
            }
            
            return new SkillGapResponse(items, root.path("overallAdvice").asText("Focus on building foundational skills first."));
            
        } catch (Exception e) {
            return fallbackResponse(request);
        }
    }

    private SkillGapResponse fallbackResponse(SkillGapRequest request) {
        List<SkillGapResponse.GapItem> items = new ArrayList<>();
        items.add(new SkillGapResponse.GapItem("Core " + request.targetCareer() + " Fundamentals", "High", "Intermediate", "4 weeks", "1"));
        items.add(new SkillGapResponse.GapItem("Advanced Tools for " + request.targetCareer(), "Medium", "Hard", "8 weeks", "2"));
        
        return new SkillGapResponse(items, "AI service is currently unavailable. Here is a generic roadmap based on industry standards for " + request.targetCareer() + ".");
    }

    private String stripJsonFences(String raw) {
        String s = raw.trim();
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl > 0) s = s.substring(nl + 1);
            int end = s.lastIndexOf("```");
            if (end > 0) s = s.substring(0, end);
        }
        return s.trim();
    }
}
