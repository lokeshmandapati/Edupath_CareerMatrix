package com.smartcareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

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
import java.util.TreeMap;

/**
 * Loads {@code BranchCareerMapping.json}: branch metadata, career lists, chat hints, and rich roadmaps.
 */
@Service
public class BranchCareerMappingService {

    private final ObjectMapper objectMapper;
    private final Map<String, String> branchLabelToCode = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
    private final Map<String, BranchMeta> branchesByCode = new LinkedHashMap<>();
    private final Map<String, List<String>> careersByBranch = new LinkedHashMap<>();
    /** Key: normalizedCareerLower + "|" + branchCodeUpper → JSON array of step objects */
    private final Map<String, JsonNode> richRoadmaps = new LinkedHashMap<>();

    public BranchCareerMappingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void load() throws IOException {
        ClassPathResource resource = new ClassPathResource("BranchCareerMapping.json");
        try (InputStream is = resource.getInputStream()) {
            String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonNode root = objectMapper.readTree(json);
            JsonNode branches = root.path("branches");
            if (branches.isArray()) {
                for (JsonNode b : branches) {
                    String code = b.path("code").asText("").trim().toUpperCase(Locale.ROOT);
                    String label = b.path("label").asText(code);
                    if (code.isEmpty()) {
                        continue;
                    }
                    branchesByCode.put(code, new BranchMeta(code, label, b.path("chatHints")));
                    branchLabelToCode.put(label, code);
                    branchLabelToCode.put(code, code);
                }
            }
            JsonNode cb = root.path("careersByBranch");
            if (cb.isObject()) {
                cb.fields().forEachRemaining(e -> {
                    List<String> list = new ArrayList<>();
                    for (JsonNode n : e.getValue()) {
                        list.add(n.asText());
                    }
                    careersByBranch.put(e.getKey().toUpperCase(Locale.ROOT), List.copyOf(list));
                });
            }
            JsonNode rm = root.path("richRoadmaps");
            if (rm.isObject()) {
                rm.fields().forEachRemaining(e -> richRoadmaps.put(e.getKey(), e.getValue()));
            }
        }
    }

    public Optional<BranchMeta> findBranch(String branchInput) {
        if (branchInput == null || branchInput.isBlank()) {
            return Optional.empty();
        }
        String raw = branchInput.trim();
        String code = branchLabelToCode.get(raw);
        if (code == null) {
            code = branchLabelToCode.get(raw.toUpperCase(Locale.ROOT));
        }
        if (code == null) {
            String lc = raw.toLowerCase(Locale.ROOT);
            for (Map.Entry<String, BranchMeta> e : branchesByCode.entrySet()) {
                if (e.getKey().equalsIgnoreCase(raw)
                        || e.getValue().label().toLowerCase(Locale.ROOT).contains(lc)
                        || lc.contains(e.getValue().label().toLowerCase(Locale.ROOT))) {
                    code = e.getKey();
                    break;
                }
            }
        }
        if (code == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(branchesByCode.get(code.toUpperCase(Locale.ROOT)));
    }

    public String resolveBranchCodeOrOther(String branchInput) {
        return findBranch(branchInput).map(BranchMeta::code).orElse("OTHER");
    }

    public List<String> careersForBranch(String branchCode) {
        if (branchCode == null) {
            return List.of();
        }
        return careersByBranch.getOrDefault(branchCode.toUpperCase(Locale.ROOT), List.of());
    }

    /**
     * Lookup rich roadmap: key = normalizeCareer(career) + "|" + branchCode.
     */
    public Optional<JsonNode> findRichRoadmapArray(String career, String branchCode) {
        if (career == null || career.isBlank()) {
            return Optional.empty();
        }
        String c = normalizeCareerKey(career);
        String bc = branchCode == null || branchCode.isBlank() ? "OTHER" : branchCode.trim().toUpperCase(Locale.ROOT);
        String key = c + "|" + bc;
        JsonNode direct = richRoadmaps.get(key);
        if (direct != null && direct.isArray() && !direct.isEmpty()) {
            return Optional.of(direct);
        }
        String fallback = c + "|DEFAULT";
        JsonNode def = richRoadmaps.get(fallback);
        if (def != null && def.isArray() && !def.isEmpty()) {
            return Optional.of(def);
        }
        return Optional.empty();
    }

    public static String normalizeCareerKey(String career) {
        return career.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    public String buildChatSystemAugmentation(BranchMeta meta, List<String> skills, List<String> interests) {
        StringBuilder sb = new StringBuilder();
        if (meta != null) {
            sb.append("Student branch: ").append(meta.label()).append(" (").append(meta.code()).append(").\n");
            JsonNode h = meta.chatHints();
            if (h != null && h.isObject()) {
                appendJsonArrayLine(sb, "Typical tools", h.path("tools"));
                appendJsonArrayLine(sb, "Technologies & domains", h.path("technologies"));
                appendJsonArrayLine(sb, "Career focus", h.path("careers"));
            }
            List<String> cr = careersForBranch(meta.code());
            if (!cr.isEmpty()) {
                sb.append("Branch-relevant roles (examples): ")
                        .append(String.join(", ", cr.subList(0, Math.min(12, cr.size()))))
                        .append(".\n");
            }
        }
        if (skills != null && !skills.isEmpty()) {
            sb.append("User-selected skills: ").append(String.join(", ", skills.subList(0, Math.min(20, skills.size())))).append(".\n");
        }
        if (interests != null && !interests.isEmpty()) {
            sb.append("User interests: ").append(String.join(", ", interests.subList(0, Math.min(15, interests.size())))).append(".\n");
        }
        sb.append("Note: The student is in this branch/stream. You can use this for context, but prioritize answering their technical or general questions directly first.");
        return sb.toString();
    }

    private static void appendJsonArrayLine(StringBuilder sb, String title, JsonNode arr) {
        if (arr == null || !arr.isArray() || arr.isEmpty()) {
            return;
        }
        List<String> parts = new ArrayList<>();
        for (JsonNode n : arr) {
            parts.add(n.asText());
        }
        sb.append(title).append(": ").append(String.join(", ", parts)).append(".\n");
    }

    public record BranchMeta(String code, String label, JsonNode chatHints) {}
}
