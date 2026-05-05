package com.smartcareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Loads branch priors, legacy→career projection, skill-direct overlays, and cross-branch rules
 * from {@code branch-career-config.json}.
 */
@Service
public class BranchCareerConfigService {

    private static final double SKILL_DIRECT_WEIGHT = 0.28;

    private final ObjectMapper objectMapper;
    private List<String> careerDomains = List.of();
    private List<String> legacyOrder = List.of();
    /** legacy domain name → (career → weight row) */
    private Map<String, Map<String, Double>> legacyToCareer = Map.of();
    private Map<String, BranchProfile> branches = Map.of();
    private Map<String, Map<String, Double>> skillDirectCareer = Map.of();
    private List<CrossBranchRule> crossBranchRules = List.of();
    private final Map<String, String> skillDirectIndex = new TreeMap<>();

    public BranchCareerConfigService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void load() throws IOException {
        ClassPathResource resource = new ClassPathResource("branch-career-config.json");
        try (InputStream is = resource.getInputStream()) {
            String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonNode root = objectMapper.readTree(json);
            careerDomains = readStringArray(root.path("careerDomains"));
            legacyOrder = readStringArray(root.path("legacyDomains"));
            legacyToCareer = readLegacyToCareer(root.path("legacyToCareer"));
            branches = readBranches(root.path("branches"));
            skillDirectCareer = readSkillDirect(root.path("skillDirectCareer"));
            indexSkillDirect();
            crossBranchRules = readCrossRules(root.path("crossBranchRules"));
        }
    }

    private void indexSkillDirect() {
        skillDirectIndex.clear();
        for (String k : skillDirectCareer.keySet()) {
            skillDirectIndex.put(k.toLowerCase(Locale.ROOT).trim(), k);
        }
    }

    private static List<String> readStringArray(JsonNode node) {
        List<String> out = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode n : node) {
                out.add(n.asText());
            }
        }
        return List.copyOf(out);
    }

    private static Map<String, Map<String, Double>> readLegacyToCareer(JsonNode node) {
        Map<String, Map<String, Double>> out = new LinkedHashMap<>();
        if (node == null || !node.isObject()) {
            return out;
        }
        node.fields().forEachRemaining(e -> {
            Map<String, Double> row = new LinkedHashMap<>();
            e.getValue().fields().forEachRemaining(d -> row.put(d.getKey(), d.getValue().asDouble()));
            out.put(e.getKey(), row);
        });
        return out;
    }

    private static Map<String, BranchProfile> readBranches(JsonNode node) {
        Map<String, BranchProfile> out = new LinkedHashMap<>();
        if (node == null || !node.isObject()) {
            return out;
        }
        node.fields().forEachRemaining(e -> {
            String code = e.getKey();
            JsonNode b = e.getValue();
            String label = b.path("label").asText(code);
            List<String> primary = readStringArray(b.path("primaryCareers"));
            Map<String, Double> prior = new LinkedHashMap<>();
            JsonNode p = b.path("branchPrior");
            if (p.isObject()) {
                p.fields().forEachRemaining(x -> prior.put(x.getKey(), x.getValue().asDouble()));
            }
            double penalty = b.path("offBranchPenalty").asDouble(0.5);
            out.put(code, new BranchProfile(code, label, primary, prior, penalty));
        });
        return out;
    }

    private static Map<String, Map<String, Double>> readSkillDirect(JsonNode node) {
        Map<String, Map<String, Double>> out = new LinkedHashMap<>();
        if (node == null || !node.isObject()) {
            return out;
        }
        node.fields().forEachRemaining(e -> {
            Map<String, Double> row = new LinkedHashMap<>();
            e.getValue().fields().forEachRemaining(d -> row.put(d.getKey(), d.getValue().asDouble()));
            out.put(e.getKey(), row);
        });
        return out;
    }

    private static List<CrossBranchRule> readCrossRules(JsonNode node) {
        List<CrossBranchRule> rules = new ArrayList<>();
        if (node == null || !node.isArray()) {
            return rules;
        }
        for (JsonNode r : node) {
            String branch = r.path("branch").asText("");
            List<String> skillsAny = readStringArray(r.path("skillsAny"));
            List<String> boost = readStringArray(r.path("boostCareers"));
            double factor = r.path("boostFactor").asDouble(1.2);
            if (!branch.isEmpty() && !skillsAny.isEmpty() && !boost.isEmpty()) {
                rules.add(new CrossBranchRule(branch, skillsAny, boost, factor));
            }
        }
        return rules;
    }

    public List<String> getCareerDomains() {
        return careerDomains;
    }

    public BranchProfile requireBranch(String code) {
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Branch is required");
        }
        String c = code.trim().toUpperCase(Locale.ROOT);
        BranchProfile p = branches.get(c);
        if (p == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown branch: " + code);
        }
        return p;
    }

    public Optional<BranchProfile> findBranch(String code) {
        if (code == null || code.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(branches.get(code.trim().toUpperCase(Locale.ROOT)));
    }

    /**
     * Maps normalized legacy domain percentages (5 domains) to career percentages (16 careers).
     */
    public Map<String, Double> projectLegacyToCareer(Map<String, Double> legacyNorm) {
        Map<String, Double> out = emptyCareerScores();
        for (String legacyName : legacyOrder) {
            double pct = legacyNorm.getOrDefault(legacyName, 0.0);
            Map<String, Double> row = legacyToCareer.get(legacyName);
            if (row == null) {
                continue;
            }
            for (String career : careerDomains) {
                double w = row.getOrDefault(career, 0.0);
                out.merge(career, pct * w, Double::sum);
            }
        }
        return CfpaMappingService.normalizeToPercentages(out);
    }

    public Map<String, Double> combineSkillCareerSignals(Map<String, Double> projectedFromLegacy, List<String> skills) {
        Map<String, Double> directRaw = aggregateSkillDirectRaw(skills);
        if (directRaw.values().stream().mapToDouble(Double::doubleValue).sum() <= 0) {
            return projectedFromLegacy;
        }
        Map<String, Double> directNorm = CfpaMappingService.normalizeToPercentages(directRaw);
        Map<String, Double> merged = new LinkedHashMap<>();
        for (String c : careerDomains) {
            double a = projectedFromLegacy.getOrDefault(c, 0.0);
            double b = directNorm.getOrDefault(c, 0.0);
            double v = (1.0 - SKILL_DIRECT_WEIGHT) * a + SKILL_DIRECT_WEIGHT * b;
            merged.put(c, v);
        }
        return CfpaMappingService.normalizeToPercentages(merged);
    }

    private Map<String, Double> aggregateSkillDirectRaw(List<String> skills) {
        Map<String, Double> sum = emptyCareerScores();
        if (skills == null) {
            return sum;
        }
        for (String skill : skills) {
            if (skill == null) {
                continue;
            }
            String canon = skillDirectIndex.get(skill.toLowerCase(Locale.ROOT).trim());
            if (canon == null) {
                continue;
            }
            Map<String, Double> row = skillDirectCareer.get(canon);
            if (row == null) {
                continue;
            }
            for (Map.Entry<String, Double> e : row.entrySet()) {
                sum.merge(e.getKey(), e.getValue(), Double::sum);
            }
        }
        return sum;
    }

    public Map<String, Double> branchPriorAsPercentages(String branchCode) {
        BranchProfile p = requireBranch(branchCode);
        Map<String, Double> raw = new LinkedHashMap<>();
        for (String c : careerDomains) {
            raw.put(c, p.branchPrior().getOrDefault(c, 0.0));
        }
        return CfpaMappingService.normalizeToPercentages(raw);
    }

    public Map<String, Double> emptyCareerScores() {
        Map<String, Double> m = new LinkedHashMap<>();
        for (String c : careerDomains) {
            m.put(c, 0.0);
        }
        return m;
    }

    public void applyOffBranchPenalty(Map<String, Double> scores, String branchCode) {
        BranchProfile p = requireBranch(branchCode);
        Set<String> primary = p.primaryCareers().stream()
                .collect(Collectors.toSet());
        double penalty = p.offBranchPenalty();
        for (String c : careerDomains) {
            if (!primary.contains(c)) {
                scores.computeIfPresent(c, (k, v) -> v * penalty);
            }
        }
    }

    public void applyCrossBranchBoosts(Map<String, Double> scores, String branchCode, List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return;
        }
        Set<String> skillSet = skills.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .collect(Collectors.toSet());
        for (CrossBranchRule rule : crossBranchRules) {
            if (!rule.branch().equalsIgnoreCase(branchCode)) {
                continue;
            }
            boolean any = rule.skillsAny().stream().anyMatch(skillSet::contains);
            if (!any) {
                continue;
            }
            for (String career : rule.boostCareers()) {
                scores.computeIfPresent(career, (k, v) -> v * rule.boostFactor());
            }
        }
    }

    /** Careers suggested by cross-branch rules when skill triggers match (for UI). */
    public List<String> crossBranchSuggestions(String branchCode, List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return List.of();
        }
        Set<String> skillSet = skills.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .collect(Collectors.toSet());
        List<String> out = new ArrayList<>();
        for (CrossBranchRule rule : crossBranchRules) {
            if (!rule.branch().equalsIgnoreCase(branchCode)) {
                continue;
            }
            boolean any = rule.skillsAny().stream().anyMatch(skillSet::contains);
            if (!any) {
                continue;
            }
            for (String c : rule.boostCareers()) {
                if (!out.contains(c)) {
                    out.add(c);
                }
            }
        }
        return List.copyOf(out);
    }

    public boolean isPrimaryCareer(String branchCode, String career) {
        return requireBranch(branchCode).primaryCareers().contains(career);
    }

    public record BranchProfile(
            String code,
            String label,
            List<String> primaryCareers,
            Map<String, Double> branchPrior,
            double offBranchPenalty
    ) {}

    public record CrossBranchRule(String branch, List<String> skillsAny, List<String> boostCareers, double boostFactor) {}
}
