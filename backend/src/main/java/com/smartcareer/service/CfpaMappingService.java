package com.smartcareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Loads skill/interest → career domain weights from {@code cfpa-mappings.json}.
 * Keys are matched case-insensitively (labels must align with the frontend assessment lists).
 */
@Service
public class CfpaMappingService {

    private static final List<String> DOMAIN_ORDER = List.of(
            "Software Engineering",
            "Data Science",
            "Cybersecurity",
            "Full Stack Development",
            "Cloud Computing"
    );

    private final ObjectMapper objectMapper;
    private Map<String, Map<String, Double>> skillWeights = Map.of();
    private Map<String, Map<String, Double>> interestWeights = Map.of();
    /** Lowercase key → canonical label */
    private final Map<String, String> skillKeyIndex = new TreeMap<>();
    private final Map<String, String> interestKeyIndex = new TreeMap<>();

    public CfpaMappingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void load() throws IOException {
        ClassPathResource resource = new ClassPathResource("cfpa-mappings.json");
        try (InputStream is = resource.getInputStream()) {
            String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonNode root = objectMapper.readTree(json);
            skillWeights = readMap(root.path("skills"));
            interestWeights = readMap(root.path("interests"));
            indexKeys(skillWeights, skillKeyIndex);
            indexKeys(interestWeights, interestKeyIndex);
        }
    }

    private static void indexKeys(Map<String, Map<String, Double>> src, Map<String, String> index) {
        index.clear();
        for (String k : src.keySet()) {
            index.put(k.toLowerCase(Locale.ROOT).trim(), k);
        }
    }

    private Map<String, Map<String, Double>> readMap(JsonNode node) {
        Map<String, Map<String, Double>> out = new LinkedHashMap<>();
        if (node == null || !node.isObject()) {
            return out;
        }
        node.fields().forEachRemaining(e -> {
            String name = e.getKey();
            JsonNode domains = e.getValue();
            Map<String, Double> row = new LinkedHashMap<>();
            if (domains.isObject()) {
                domains.fields().forEachRemaining(d -> row.put(d.getKey(), d.getValue().asDouble()));
            }
            out.put(name, row);
        });
        return out;
    }

    public List<String> domains() {
        return DOMAIN_ORDER;
    }

    public Optional<Map<String, Double>> skillWeights(String label) {
        return resolve(label, skillWeights, skillKeyIndex);
    }

    public Optional<Map<String, Double>> interestWeights(String label) {
        return resolve(label, interestWeights, interestKeyIndex);
    }

    private Optional<Map<String, Double>> resolve(
            String label,
            Map<String, Map<String, Double>> data,
            Map<String, String> index
    ) {
        if (label == null) {
            return Optional.empty();
        }
        String t = label.trim();
        if (t.isEmpty()) {
            return Optional.empty();
        }
        Map<String, Double> direct = data.get(t);
        if (direct != null) {
            return Optional.of(direct);
        }
        String canon = index.get(t.toLowerCase(Locale.ROOT));
        if (canon != null) {
            return Optional.ofNullable(data.get(canon));
        }
        return Optional.empty();
    }

    public boolean hasSkillMapping(String label) {
        return skillWeights(label).isPresent();
    }

    public boolean hasInterestMapping(String label) {
        return interestWeights(label).isPresent();
    }

    /** Empty map with all domains at 0 — insertion order stable. */
    public Map<String, Double> emptyDomainScores() {
        Map<String, Double> m = new LinkedHashMap<>();
        for (String d : DOMAIN_ORDER) {
            m.put(d, 0.0);
        }
        return m;
    }

    public static Map<String, Double> normalizeToPercentages(Map<String, Double> raw) {
        double sum = raw.values().stream().mapToDouble(Double::doubleValue).sum();
        Map<String, Double> out = new LinkedHashMap<>();
        if (sum <= 0) {
            double eq = 100.0 / raw.size();
            raw.keySet().forEach(k -> out.put(k, Math.round(eq * 10.0) / 10.0));
            return out;
        }
        for (Map.Entry<String, Double> e : raw.entrySet()) {
            double pct = (e.getValue() / sum) * 100.0;
            out.put(e.getKey(), Math.round(pct * 10.0) / 10.0);
        }
        fixRoundingDrift(out, 100.0);
        return out;
    }

    private static void fixRoundingDrift(Map<String, Double> out, double target) {
        double total = out.values().stream().mapToDouble(Double::doubleValue).sum();
        if (Math.abs(total - target) > 0.01 && !out.isEmpty()) {
            String first = out.keySet().iterator().next();
            out.put(first, Math.round((out.get(first) + (target - total)) * 10.0) / 10.0);
        }
    }

    public static LinkedHashMap<String, Double> sortByValueDesc(Map<String, Double> map) {
        return map.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

    public static Map<String, Double> immutableCopy(Map<String, Double> m) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(m));
    }
}
