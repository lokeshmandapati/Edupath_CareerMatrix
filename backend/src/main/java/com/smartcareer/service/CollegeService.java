package com.smartcareer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcareer.entity.College;
import com.smartcareer.repository.CollegeRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.*;

@Service
public class CollegeService {

    private final CollegeRepository collegeRepository;
    private final ObjectMapper objectMapper;

    public CollegeService(CollegeRepository collegeRepository, ObjectMapper objectMapper) {
        this.collegeRepository = collegeRepository;
        this.objectMapper = objectMapper;
    }

    public record CollegeItem(String name, String location, String website, String cutoff, int rank) {}

    public enum Category {
        GENERAL, OBC, SCST
    }

    public List<CollegeItem> top10ForCourse(String courseKey) {
        if (courseKey == null || courseKey.isBlank()) return List.of();
        return collegeRepository.findTop10ByCourseKeyOrderByRankOrderAsc(courseKey.trim()).stream()
                .map(c -> new CollegeItem(c.getName(), c.getLocation(), c.getWebsite(), cutoffFor(c, Category.GENERAL), c.getRankOrder()))
                .toList();
    }

    public List<CollegeItem> top10ForCourse(String courseKey, String city, String state, String categoryRaw) {
        if (courseKey == null || courseKey.isBlank()) return List.of();
        String key = courseKey.trim();
        Category category = parseCategory(categoryRaw);

        if (city != null && !city.isBlank()) {
            List<CollegeItem> local = collegeRepository.findTop10ByCourseKeyAndCityIgnoreCaseOrderByRankOrderAsc(key, city.trim()).stream()
                    .map(c -> new CollegeItem(c.getName(), c.getLocation(), c.getWebsite(), cutoffFor(c, category), c.getRankOrder()))
                    .toList();
            if (!local.isEmpty()) return local;
        }

        if (state != null && !state.isBlank()) {
            List<CollegeItem> local = collegeRepository.findTop10ByCourseKeyAndStateIgnoreCaseOrderByRankOrderAsc(key, state.trim()).stream()
                    .map(c -> new CollegeItem(c.getName(), c.getLocation(), c.getWebsite(), cutoffFor(c, category), c.getRankOrder()))
                    .toList();
            if (!local.isEmpty()) return local;
        }

        return collegeRepository.findTop10ByCourseKeyOrderByRankOrderAsc(key).stream()
                .map(c -> new CollegeItem(c.getName(), c.getLocation(), c.getWebsite(), cutoffFor(c, category), c.getRankOrder()))
                .toList();
    }

    /**
     * Seed DB from JSON on first request for a courseKey.
     * Keeps the app simple: no manual DB inserts required.
     */
    public void ensureSeeded(String courseKey) {
        if (courseKey == null || courseKey.isBlank()) return;
        String key = courseKey.trim();
        if (collegeRepository.countByCourseKey(key) > 0) return;

        Map<String, List<JsonCollege>> data = loadJson();
        List<JsonCollege> list = data.getOrDefault(key, List.of());
        if (list.isEmpty()) return;

        int rank = 1;
        for (JsonCollege jc : list) {
            ParsedLocation parsed = parseLocation(jc.location, jc.city, jc.state);
            collegeRepository.save(new College(
                    key,
                    safe(jc.name),
                    safe(jc.location),
                    parsed.city,
                    parsed.state,
                    jc.website == null ? null : jc.website.trim(),
                    safe(jc.cutoffGeneral),
                    safe(jc.cutoffObc),
                    safe(jc.cutoffScst),
                    rank++
            ));
        }
    }

    private Map<String, List<JsonCollege>> loadJson() {
        try (InputStream is = new ClassPathResource("colleges-after12.json").getInputStream()) {
            TypeReference<Map<String, List<JsonCollege>>> t = new TypeReference<>() {};
            return objectMapper.readValue(is, t);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private static String safe(String s) {
        return s == null ? "" : s.trim();
    }

    private static ParsedLocation parseLocation(String location, String city, String state) {
        String c = safe(city);
        String s = safe(state);
        if (!c.isBlank() || !s.isBlank()) return new ParsedLocation(normalizeCity(c), normalizeState(s));

        String loc = safe(location);
        if (loc.isBlank() || loc.equalsIgnoreCase("Pan-India")) return new ParsedLocation("", "");

        String[] parts = loc.split(",");
        if (parts.length >= 2) {
            String pc = parts[0].trim();
            String ps = parts[1].trim();
            return new ParsedLocation(normalizeCity(pc), normalizeState(ps));
        }
        return new ParsedLocation("", "");
    }

    private static String normalizeCity(String city) {
        String c = safe(city);
        if (c.isBlank()) return "";
        // Make UI-friendly matching easier
        if (c.equalsIgnoreCase("New Delhi")) return "Delhi";
        if (c.equalsIgnoreCase("Bangalore")) return "Bengaluru";
        return c;
    }

    private static String normalizeState(String state) {
        String s = safe(state);
        if (s.isBlank()) return "";
        if (s.equalsIgnoreCase("NCT of Delhi")) return "Delhi";
        return s;
    }

    private record ParsedLocation(String city, String state) {}

    private static Category parseCategory(String raw) {
        if (raw == null) return Category.GENERAL;
        String v = raw.trim().toUpperCase(Locale.ROOT);
        return switch (v) {
            case "OBC" -> Category.OBC;
            case "ST", "SC", "SC/ST", "SCST", "SC_ST", "SC-ST" -> Category.SCST;
            default -> Category.GENERAL;
        };
    }

    private static String cutoffFor(College c, Category category) {
        String v = switch (category) {
            case OBC -> c.getCutoffObc();
            case SCST -> c.getCutoffScst();
            default -> c.getCutoffGeneral();
        };
        if (v != null && !v.isBlank()) return v;
        return estimateCutoffByRank(c.getRankOrder(), category);
    }

    /**
     * Fallback numeric cutoff when dataset doesn't have real cutoffs yet.
     * This is a heuristic so the UI can always show a number.
     */
    private static String estimateCutoffByRank(Integer rankOrder, Category category) {
        int rank = (rankOrder == null || rankOrder < 1) ? 10 : Math.min(30, rankOrder);
        double base = 99.3 - (rank - 1) * 0.25; // 1 -> ~99.3, 10 -> ~97.0, 20 -> ~94.5
        double adj = switch (category) {
            case OBC -> -1.2;
            case SCST -> -3.0;
            default -> 0.0;
        };
        double pct = Math.max(70.0, Math.min(99.9, base + adj));
        return String.format(Locale.ROOT, "~%.1f percentile", pct);
    }

    private record JsonCollege(
            String name,
            String location,
            String website,
            String city,
            String state,
            String cutoffGeneral,
            String cutoffObc,
            String cutoffScst
    ) {}
}

