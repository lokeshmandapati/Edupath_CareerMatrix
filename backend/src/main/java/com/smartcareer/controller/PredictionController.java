package com.smartcareer.controller;

import com.smartcareer.dto.PredictionRequest;
import com.smartcareer.dto.PredictionResponse;
import com.smartcareer.dto.ResultsHistoryResponse;
import com.smartcareer.dto.Class10StreamRequest;
import com.smartcareer.dto.After12CareerRequest;
import com.smartcareer.service.CareerFitPredictionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Career prediction and persisted results (JWT required).
 */
@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class PredictionController {

    private final CareerFitPredictionService predictionService;

    public PredictionController(CareerFitPredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/api/predict-career")
    public PredictionResponse predict(
            @Valid @RequestBody PredictionRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        return predictionService.predict(userId, request);
    }

    @PostMapping("/api/predict-class10-stream")
    public PredictionResponse predictClass10(
            @Valid @RequestBody Class10StreamRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        return predictionService.predictClass10Stream(userId, request);
    }

    @PostMapping("/api/predict-after12-career")
    public PredictionResponse predictAfter12(
            @Valid @RequestBody After12CareerRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        return predictionService.predictAfter12Career(userId, request);
    }

    @GetMapping("/api/results/{userId}")
    public ResultsHistoryResponse getResults(
            @PathVariable String userId,
            @RequestParam(name = "type", required = false) String type,
            Authentication authentication
    ) {
        String authId = (String) authentication.getPrincipal();
        return predictionService.getLatestResult(authId, userId, type);
    }
}
