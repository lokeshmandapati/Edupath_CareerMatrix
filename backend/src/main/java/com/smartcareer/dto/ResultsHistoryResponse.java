package com.smartcareer.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ResultsHistoryResponse(
        String resultId,
        String topCareer,
        Map<String, Double> careerScores,
        String explanation,
        Instant createdAt,
        Double confidencePercent,
        Map<String, Double> skillMatchBreakdown,
        Map<String, Double> interestMatchBreakdown,
        String branchCode,
        String branchLabel,
        String whyBranchFit,
        List<String> crossBranchSuggestions,
        List<String> recommendedSubjects,
        List<String> examPaths,
        List<String> nextSteps,
        String assessmentType
) {
    public ResultsHistoryResponse(
            String resultId,
            String topCareer,
            Map<String, Double> careerScores,
            String explanation,
            Instant createdAt
    ) {
        this(resultId, topCareer, careerScores, explanation, createdAt, null, null, null, null, null, null, null, null, null, null, null);
    }
}
