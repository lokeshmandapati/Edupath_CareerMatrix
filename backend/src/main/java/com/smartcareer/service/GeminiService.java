package com.smartcareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcareer.dto.ChatTurnDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gemini Chat Completions API integration.
 */
@Service
public class GeminiService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
    private final String baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-flash-latest}")
    private String model;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String chatCompletion(String systemPrompt, List<ChatTurnDto> history, String userMessage) {
        String[] models = {model, "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-pro"};
        Exception lastEx = null;

        for (String m : models) {
            try {
                return callModel(m, systemPrompt, history, userMessage);
            } catch (Exception e) {
                String msg = e.getMessage();
                if (msg != null && (msg.contains("429") || msg.contains("503") || msg.contains("404"))) {
                    System.err.println("Model " + m + " failed (" + msg + "), trying next...");
                    lastEx = e;
                    continue;
                }
                if (e instanceof RuntimeException) throw (RuntimeException) e;
                throw new RuntimeException(e);
            }
        }
        throw new RuntimeException("All Gemini models exhausted: " + (lastEx != null ? lastEx.getMessage() : "Unknown error"));
    }

    private String callModel(String m, String systemPrompt, List<ChatTurnDto> history, String userMessage) throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException("Gemini API key not configured");
        }

        String url = String.format("%s/models/%s:generateContent?key=%s", baseUrl, m, apiKey.trim());

        List<Map<String, Object>> contents = new ArrayList<>();
        String lastRole = null;
        if (history != null && !history.isEmpty()) {
            for (ChatTurnDto turn : history) {
                String role = "assistant".equalsIgnoreCase(turn.role()) ? "model" : "user";
                if (lastRole == null && "model".equals(role)) {
                    contents.add(buildContent("user", "Hello"));
                    lastRole = "user";
                }
                if (role.equals(lastRole)) {
                    continue;
                }
                contents.add(buildContent(role, turn.content()));
                lastRole = role;
            }
        }
        
        if ("user".equals(lastRole)) {
            contents.add(buildContent("model", "Acknowledged."));
        }
        
        String combinedMessage = "SYSTEM: " + systemPrompt + "\n\nUSER: " + userMessage;
        contents.add(buildContent("user", combinedMessage));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", contents);

        String json = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(90))
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() >= 400) {
            System.err.println("Gemini API Error: " + response.statusCode() + " - " + response.body());
            System.err.println("URL called: " + url.replaceAll("key=[^&]+", "key=REDACTED"));
            throw new RuntimeException("Gemini API error: HTTP " + response.statusCode() + " for model " + m);
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode content = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        
        if (content.isMissingNode() || content.asText().isBlank()) {
            System.err.println("Gemini Unexpected Response: " + response.body());
            throw new RuntimeException("Unexpected Gemini response shape");
        }
        
        return content.asText().trim();
    }

    private Map<String, Object> buildContent(String role, String text) {
        Map<String, Object> content = new HashMap<>();
        // Gemini uses 'model' instead of 'assistant'
        content.put("role", "assistant".equalsIgnoreCase(role) ? "model" : "user");
        content.put("parts", List.of(Map.of("text", text)));
        return content;
    }
}
