package com.smartcareer.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/toolkit")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class CollegePredictorController {

    private final ObjectMapper objectMapper;
    private final com.smartcareer.service.GeminiService geminiService;

    public CollegePredictorController(ObjectMapper objectMapper, com.smartcareer.service.GeminiService geminiService) {
        this.objectMapper = objectMapper;
        this.geminiService = geminiService;
    }

    public record PredictionRequest(
            double percentile,
            String category,
            String preferredState,
            String preferredBranch
    ) {}

    public record PredictedCollege(
            String name,
            String branch,
            double cutoff,
            String chance, // Safe, Moderate, Dream
            String fees,
            String placement,
            String website,
            String hostel,
            String state
    ) {}

    @PostMapping("/predict-jee-colleges")
    public List<PredictedCollege> predictColleges(@RequestBody PredictionRequest req) {
        try {
            InputStream is = new ClassPathResource("jee-colleges.json").getInputStream();
            Map<String, List<Map<String, Object>>> data = objectMapper.readValue(is, new TypeReference<>() {});
            List<Map<String, Object>> colleges = data.get("colleges");

            String catKey = req.category().toLowerCase(Locale.ROOT);
            if (catKey.equals("sc/st")) catKey = "sc"; // fallback or handle specifically

            final String finalCatKey = catKey;
            
            List<PredictedCollege> staticResults = colleges.stream()
                    .map(c -> {
                        double cutoff = ((Number) c.getOrDefault(finalCatKey, c.get("general"))).doubleValue();
                        String chance;
                        double diff = req.percentile() - cutoff;
                        
                        if (diff >= 2.0) chance = "Safe";
                        else if (diff >= -1.0) chance = "Moderate";
                        else if (diff >= -5.0) chance = "Dream";
                        else return null;

                        // Filter by state if provided
                        if (req.preferredState() != null && !req.preferredState().isBlank()) {
                            String s = (String) c.get("state");
                            if (s != null && !s.equalsIgnoreCase(req.preferredState())) return null;
                        }

                        // Filter by branch if provided (partial match)
                        if (req.preferredBranch() != null && !req.preferredBranch().isBlank()) {
                            String b = (String) c.get("branch");
                            if (b != null && !b.toLowerCase().contains(req.preferredBranch().toLowerCase())) return null;
                        }

                        return new PredictedCollege(
                                (String) c.get("name"),
                                (String) c.get("branch"),
                                cutoff,
                                chance,
                                (String) c.get("fees"),
                                (String) c.get("placement"),
                                (String) c.get("website"),
                                (String) c.get("hostel"),
                                (String) c.get("state")
                        );
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            // If we have very few results for a specific state, fetch from AI
            if (staticResults.size() < 3 && req.preferredState() != null && !req.preferredState().isBlank()) {
                List<Map<String, Object>> aiColleges = fetchCollegesFromAi(req.preferredState(), req.preferredBranch());
                List<PredictedCollege> aiResults = aiColleges.stream()
                        .map(c -> {
                            try {
                                Object val = c.get(finalCatKey);
                                if (val == null) val = c.get("general");
                                
                                double cutoff = 0.0;
                                if (val instanceof Number) {
                                    cutoff = ((Number) val).doubleValue();
                                } else if (val instanceof String) {
                                    try {
                                        cutoff = Double.parseDouble(((String) val).replaceAll("[^\\d.]", ""));
                                    } catch (Exception ignore) {}
                                }
                                
                                if (cutoff == 0.0) return null;

                                String chance;
                                double diff = req.percentile() - cutoff;
                                if (diff >= 2.0) chance = "Safe";
                                else if (diff >= -1.0) chance = "Moderate";
                                else if (diff >= -5.0) chance = "Dream";
                                else return null;

                                return new PredictedCollege(
                                        String.valueOf(c.getOrDefault("name", "Unknown College")),
                                        String.valueOf(c.getOrDefault("branch", req.preferredBranch())),
                                        cutoff,
                                        chance,
                                        String.valueOf(c.getOrDefault("fees", "N/A")),
                                        String.valueOf(c.getOrDefault("placement", "N/A")),
                                        String.valueOf(c.getOrDefault("website", "#")),
                                        String.valueOf(c.getOrDefault("hostel", "N/A")),
                                        String.valueOf(c.getOrDefault("state", req.preferredState()))
                                );
                            } catch (Exception ex) {
                                System.err.println("Error mapping AI college: " + ex.getMessage());
                                return null;
                            }
                        })
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                staticResults.addAll(aiResults);
            }

            // Fallback mechanism: if AI fails and state filter resulted in empty list
            if (staticResults.isEmpty() && req.preferredState() != null && !req.preferredState().isBlank()) {
                System.err.println("AI exhausted and no static state matches. Falling back to national data.");
                return colleges.stream()
                        .map(c -> {
                            Object val = c.getOrDefault(finalCatKey, c.get("general"));
                            double cutoff = 0.0;
                            if (val instanceof Number) cutoff = ((Number) val).doubleValue();
                            else if (val instanceof String) {
                                try { cutoff = Double.parseDouble(((String) val).replaceAll("[^\\d.]", "")); } catch(Exception ex){}
                            }
                            if (cutoff == 0.0) return null;

                            String chance;
                            double diff = req.percentile() - cutoff;
                            if (diff >= 2.0) chance = "Safe";
                            else if (diff >= -1.0) chance = "Moderate";
                            else if (diff >= -5.0) chance = "Dream";
                            else return null;

                            // Filter by branch only
                            if (req.preferredBranch() != null && !req.preferredBranch().isBlank()) {
                                String b = (String) c.get("branch");
                                if (b != null && !b.toLowerCase().contains(req.preferredBranch().toLowerCase())) return null;
                            }

                            return new PredictedCollege(
                                    (String) c.get("name"),
                                    (String) c.get("branch"),
                                    cutoff,
                                    chance,
                                    (String) c.get("fees"),
                                    (String) c.get("placement"),
                                    (String) c.get("website"),
                                    (String) c.get("hostel"),
                                    (String) c.get("state")
                            );
                        })
                        .filter(Objects::nonNull)
                        .sorted((a, b) -> Double.compare(b.cutoff(), a.cutoff()))
                        .limit(10)
                        .collect(Collectors.toList());
            }

            return staticResults.stream()
                    .distinct() // remove potential duplicates between static and AI
                    .sorted((a, b) -> Double.compare(b.cutoff(), a.cutoff()))
                    .limit(15)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Predict Colleges Error: ");
            e.printStackTrace();
            return List.of();
        }
    }

    private List<Map<String, Object>> fetchCollegesFromAi(String state, String branch) {
        if (geminiService == null || !geminiService.isConfigured()) return List.of();
        try {
            String prompt = String.format(
                "Generate a JSON list of top 8 engineering colleges in the state of '%s' for the branch '%s' that accept JEE Main scores. " +
                "For each college, provide the approximate previous year JEE Main percentiles for these categories: general, obc, sc, st, ews. " +
                "Also include: fees (approx per year), placement (avg package), website (official URL), and hostel (Yes/No). " +
                "Return ONLY a JSON array of objects with keys: name, branch, state, general, obc, sc, st, ews, fees, placement, website, hostel. " +
                "Do not include markdown formatting, just the raw JSON array. " +
                "Example: [{\"name\": \"College Name\", \"branch\": \"CSE\", \"state\": \"Delhi\", \"general\": 95.0, \"obc\": 90.0, \"sc\": 75.0, \"st\": 65.0, \"ews\": 92.0, \"fees\": \"2 Lakhs\", \"placement\": \"10 LPA\", \"website\": \"http://site.com\", \"hostel\": \"Yes\"}]",
                state, branch
            );
            
            String response = geminiService.chatCompletion(
                "You are an expert Indian college admission consultant. Respond only with a raw JSON array of colleges.",
                List.of(),
                prompt
            );
            
            String cleanedJson = response.trim();
            if (cleanedJson.startsWith("```json")) {
                cleanedJson = cleanedJson.substring(7, cleanedJson.length() - 3).trim();
            } else if (cleanedJson.startsWith("```")) {
                cleanedJson = cleanedJson.substring(3, cleanedJson.length() - 3).trim();
            }
            
            return objectMapper.readValue(cleanedJson, new TypeReference<>() {});
        } catch (Exception e) {
            System.err.println("AI fetch error: " + e.getMessage());
            return List.of();
        }
    }

    @GetMapping("/rank-from-percentile")
    public Map<String, Object> getRank(@RequestParam double percentile) {
        // Approximate Rank = (100 - percentile) * (Total Candidates / 100)
        // For 2025, estimated candidates around 1.4 million
        long totalCandidates = 1400000;
        long rank = Math.round((100.0 - percentile) * totalCandidates / 100.0);
        if (rank < 1) rank = 1;

        Map<String, Object> res = new HashMap<>();
        res.put("percentile", percentile);
        res.put("expectedRank", rank);
        res.put("totalCandidates", totalCandidates);
        res.put("note", "Approximate rank based on estimated 1.4 million candidates.");
        return res;
    }

    @GetMapping("/upcoming-exams")
    public List<Map<String, Object>> getUpcomingExams(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String category
    ) {
        if (geminiService == null || !geminiService.isConfigured()) return List.of();
        try {
            String stateStr = (state == null || state.equalsIgnoreCase("All") || state.equalsIgnoreCase("All India")) ? "India (National)" : state;
            String catStr = (category == null || category.equalsIgnoreCase("All")) ? "all major fields (Engineering, Medical, Management, etc.)" : category;

            String prompt = String.format(
                "Generate a JSON list of 6 REAL upcoming entrance exam deadlines valid for students in '%s' for the field of '%s' for 2026/2027. " +
                "IMPORTANT: If no state-specific exams exist, find National level exams (like JEE Main, NEET, CUET, CLAT, GATE, NATA) that students from this state can take. " +
                "Each object must have these EXACT keys: " +
                "id, name, date (exam date YYYY-MM-DD), applicationStart (YYYY-MM-DD), lastDate (YYYY-MM-DD), " +
                "counsellingStart (YYYY-MM-DD), category (e.g. Engineering), state (e.g. All India or the specific state), " +
                "description (1 sentence), targetAudience (1 sentence), registrationLink, " +
                "steps (JSON array of strings). " +
                "Return ONLY a raw JSON array. Do not include any text before or after the JSON.",
                stateStr, catStr
            );
            
            String response = geminiService.chatCompletion(
                    "You are an admission calendar expert. Return only valid JSON array of exams.",
                    List.of(),
                    prompt
            );
            String cleanedJson = response.trim();
            if (cleanedJson.contains("[") && cleanedJson.contains("]")) {
                cleanedJson = cleanedJson.substring(cleanedJson.indexOf("["), cleanedJson.lastIndexOf("]") + 1);
            }
            
            return objectMapper.readValue(cleanedJson, new TypeReference<>() {});
        } catch (Exception e) {
            System.err.println("Upcoming exams AI fetch error: " + e.getMessage());
            return List.of();
        }
    }
}
