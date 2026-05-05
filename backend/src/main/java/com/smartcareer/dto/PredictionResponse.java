package com.smartcareer.dto;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * CFPA output — ranked careers, confidence, skill/interest breakdowns, branch context, explanation.
 */
public record PredictionResponse(
        String topCareer,
        Map<String, Double> careerScores,
        List<CareerRankItem> rankedCareers,
        String explanation,
        double confidencePercent,
        Map<String, Double> skillMatchBreakdown,
        Map<String, Double> interestMatchBreakdown,
        String branchCode,
        String branchLabel,
        String whyBranchFit,
        List<String> crossBranchSuggestions,
        List<String> recommendedSubjects,
        List<String> examPaths,
        List<String> nextSteps
) {
    public record CareerRankItem(String career, double scorePercent, int rank) {}

    /** Preserve insertion order for consistent UI */
    public static Map<String, Double> orderedScores(LinkedHashMap<String, Double> map) {
        return map;
    }
}
