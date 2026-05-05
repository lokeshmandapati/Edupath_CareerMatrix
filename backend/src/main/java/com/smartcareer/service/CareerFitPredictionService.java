package com.smartcareer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcareer.dto.PredictionRequest;
import com.smartcareer.dto.PredictionResponse;
import com.smartcareer.dto.ResultsHistoryResponse;
import com.smartcareer.dto.Class10StreamRequest;
import com.smartcareer.dto.After12CareerRequest;
import com.smartcareer.entity.CareerResult;
import com.smartcareer.entity.User;
import com.smartcareer.entity.UserInput;
import com.smartcareer.repository.CareerResultRepository;
import com.smartcareer.repository.UserInputRepository;
import com.smartcareer.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * CareerFit Prediction Algorithm (CFPA): skills 35%, interests 25%, branch 20%,
 * academic performance 10%, projects 10% — legacy skill/interest mappings project into
 * branch-aware career titles via {@code branch-career-config.json}.
 */
@Service
public class CareerFitPredictionService {

    public static final String SOFTWARE = "Software Engineering";
    public static final String DATA_SCIENCE = "Data Science";
    public static final String CYBER = "Cybersecurity";
    public static final String FULL_STACK = "Full Stack Development";
    public static final String CLOUD = "Cloud Computing";

    private static final double W_SKILLS = 0.35;
    private static final double W_INTERESTS = 0.25;
    private static final double W_BRANCH = 0.20;
    private static final double W_ACADEMIC = 0.10;
    private static final double W_PROJECT = 0.10;

    private final UserRepository userRepository;
    private final UserInputRepository userInputRepository;
    private final CareerResultRepository careerResultRepository;
    private final ObjectMapper objectMapper;
    private final CfpaMappingService mappingService;
    private final BranchCareerConfigService branchConfig;

    public CareerFitPredictionService(
            UserRepository userRepository,
            UserInputRepository userInputRepository,
            CareerResultRepository careerResultRepository,
            ObjectMapper objectMapper,
            CfpaMappingService mappingService,
            BranchCareerConfigService branchConfig
    ) {
        this.userRepository = userRepository;
        this.userInputRepository = userInputRepository;
        this.careerResultRepository = careerResultRepository;
        this.objectMapper = objectMapper;
        this.mappingService = mappingService;
        this.branchConfig = branchConfig;
    }

    public PredictionResponse predict(String authenticatedUserId, PredictionRequest req) {
        User user = userRepository.findById(Long.valueOf(authenticatedUserId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        BranchCareerConfigService.BranchProfile branchProfile = branchConfig.requireBranch(req.branch());
        List<String> careerDomains = branchConfig.getCareerDomains();

        List<String> legacyDomains = mappingService.domains();
        Map<String, Double> skillRaw = mappingService.emptyDomainScores();
        int matchedSkills = 0;
        for (String skill : req.technicalSkills()) {
            Optional<Map<String, Double>> w = mappingService.skillWeights(skill);
            if (w.isPresent()) {
                matchedSkills++;
                mergeWeights(skillRaw, w.get());
            } else {
                skillRaw.merge(SOFTWARE, 0.8, Double::sum);
            }
        }

        Map<String, Double> interestRaw = mappingService.emptyDomainScores();
        int matchedInterests = 0;
        for (String interest : req.interests()) {
            Optional<Map<String, Double>> w = mappingService.interestWeights(interest);
            if (w.isPresent()) {
                matchedInterests++;
                mergeWeights(interestRaw, w.get());
            } else {
                interestRaw.merge(SOFTWARE, 0.5, Double::sum);
            }
        }

        Map<String, Double> skillNorm = CfpaMappingService.normalizeToPercentages(skillRaw);
        Map<String, Double> interestNorm = CfpaMappingService.normalizeToPercentages(interestRaw);

        double scale10 = normalizeCgpaToScale10(req.cgpa());
        double cgpaFactor = scale10 / 10.0;

        Map<String, Double> projectRaw = mappingService.emptyDomainScores();
        double tier = projectTierMultiplier(req.projectExperience());
        for (String d : legacyDomains) {
            projectRaw.put(d, tier);
        }
        Map<String, Double> projectNorm = CfpaMappingService.normalizeToPercentages(projectRaw);

        Map<String, Double> skillCareer = branchConfig.combineSkillCareerSignals(
                branchConfig.projectLegacyToCareer(skillNorm),
                req.technicalSkills()
        );
        Map<String, Double> interestCareer = branchConfig.projectLegacyToCareer(interestNorm);
        Map<String, Double> projectCareer = branchConfig.projectLegacyToCareer(projectNorm);
        Map<String, Double> branchPrior = branchConfig.branchPriorAsPercentages(branchProfile.code());

        Map<String, Double> academicUniform = uniformCareerLayer(careerDomains);

        Map<String, Double> blended = new LinkedHashMap<>();
        for (String c : careerDomains) {
            double v = W_SKILLS * skillCareer.getOrDefault(c, 0.0)
                    + W_INTERESTS * interestCareer.getOrDefault(c, 0.0)
                    + W_BRANCH * branchPrior.getOrDefault(c, 0.0)
                    + W_ACADEMIC * academicUniform.getOrDefault(c, 0.0) * cgpaFactor
                    + W_PROJECT * projectCareer.getOrDefault(c, 0.0);
            blended.put(c, v);
        }

        if (req.certifications() != null && !req.certifications().isBlank()) {
            applyCertificationNudgeExpanded(blended);
        }
        if (req.preferredWorkType() != null && !req.preferredWorkType().isBlank()) {
            applyWorkTypeNudgeExpanded(blended, req.preferredWorkType());
        }

        branchConfig.applyOffBranchPenalty(blended, branchProfile.code());
        branchConfig.applyCrossBranchBoosts(blended, branchProfile.code(), req.technicalSkills());

        LinkedHashMap<String, Double> percentages = new LinkedHashMap<>(CfpaMappingService.sortByValueDesc(
                CfpaMappingService.normalizeToPercentages(blended)
        ));

        String top = percentages.entrySet().iterator().next().getKey();

        int totalInputs = req.technicalSkills().size() + req.interests().size();
        double mappingCoverage = totalInputs > 0
                ? Math.round(1000.0 * (matchedSkills + matchedInterests) / totalInputs) / 10.0
                : 0.0;
        double branchAlignment = branchConfig.isPrimaryCareer(branchProfile.code(), top) ? 100.0 : 68.0;
        double confidence = Math.round((0.62 * mappingCoverage + 0.38 * branchAlignment) * 10.0) / 10.0;

        List<String> crossSuggestions = branchConfig.crossBranchSuggestions(branchProfile.code(), req.technicalSkills());
        crossSuggestions = crossSuggestions.stream()
                .filter(s -> !s.equals(top))
                .limit(4)
                .collect(Collectors.toList());

        String whyBranchFit = buildWhyBranchFit(branchProfile, top, skillCareer, interestCareer);
        String explanation = buildExplanation(req, branchProfile, top, percentages, confidence, skillNorm, interestNorm, whyBranchFit);

        Map<String, Double> skillBreakdown = CfpaMappingService.immutableCopy(skillCareer);
        Map<String, Double> interestBreakdown = CfpaMappingService.immutableCopy(interestCareer);

        user.setBranch(branchProfile.code());
        userRepository.save(user);

        persistInputAndResult(
                user,
                req,
                branchProfile,
                percentages,
                top,
                explanation,
                confidence,
                skillBreakdown,
                interestBreakdown,
                whyBranchFit,
                crossSuggestions
        );

        List<PredictionResponse.CareerRankItem> ranked = rankList(percentages);
        return new PredictionResponse(
                top,
                percentages,
                ranked,
                explanation,
                confidence,
                skillBreakdown,
                interestBreakdown,
                branchProfile.code(),
                branchProfile.label(),
                whyBranchFit,
                crossSuggestions,
                null,
                null,
                null
        );
    }

    public PredictionResponse predictClass10Stream(String authenticatedUserId, Class10StreamRequest req) {
        User user = userRepository.findById(Long.valueOf(authenticatedUserId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Map<String, Double> raw = new LinkedHashMap<>();
        raw.put("Science", 0.0);
        raw.put("Commerce", 0.0);
        raw.put("Humanities", 0.0);

        double m = req.math() / 100.0;
        double s = req.science() / 100.0;
        double e = req.english() / 100.0;
        double so = req.social() / 100.0;

        raw.merge("Science", 0.40 * m + 0.35 * s + 0.15 * e + 0.10 * so, Double::sum);
        raw.merge("Commerce", 0.20 * m + 0.15 * s + 0.25 * e + 0.40 * so, Double::sum);
        raw.merge("Humanities", 0.10 * m + 0.10 * s + 0.40 * e + 0.40 * so, Double::sum);

        for (String interest : req.interests()) {
            if (interest == null) continue;
            String it = interest.trim().toLowerCase(Locale.ROOT);
            if (it.contains("technology") || it.contains("research") || it.contains("engineering") || it.contains("computer") || it.contains("medicine")) {
                raw.merge("Science", 0.12, Double::sum);
            }
            if (it.contains("business") || it.contains("finance") || it.contains("entrepreneur")) {
                raw.merge("Commerce", 0.12, Double::sum);
            }
            if (it.contains("law") || it.contains("design") || it.contains("writing") || it.contains("psychology") || it.contains("creative")) {
                raw.merge("Humanities", 0.12, Double::sum);
            }
        }

        if (req.aptitudeTags() != null) {
            for (String tag : req.aptitudeTags()) {
                if (tag == null) continue;
                String t = tag.trim().toLowerCase(Locale.ROOT);
                if (t.contains("numbers") || t.contains("logic") || t.contains("problem")) raw.merge("Science", 0.18, Double::sum);
                if (t.contains("analysis") || t.contains("cases") || t.contains("money")) raw.merge("Commerce", 0.18, Double::sum);
                if (t.contains("writing") || t.contains("debate") || t.contains("people") || t.contains("creative")) raw.merge("Humanities", 0.18, Double::sum);
            }
        }

        String ls = req.learningStyle() == null ? "" : req.learningStyle().trim().toLowerCase(Locale.ROOT);
        if (ls.contains("practical") || ls.contains("hands")) {
            raw.merge("Science", 0.06, Double::sum);
            raw.merge("Commerce", 0.04, Double::sum);
        } else if (ls.contains("reading") || ls.contains("theory")) {
            raw.merge("Humanities", 0.06, Double::sum);
        }

        if (req.subjectComfort() != null) {
            for (String sc : req.subjectComfort()) {
                if (sc == null) continue;
                String t = sc.trim().toLowerCase(Locale.ROOT);
                if (t.contains("math") || t.contains("science")) raw.merge("Science", 0.08, Double::sum);
                if (t.contains("social")) raw.merge("Commerce", 0.05, Double::sum);
                if (t.contains("english")) raw.merge("Humanities", 0.06, Double::sum);
            }
        }
        String fam = req.familyPriority() == null ? "" : req.familyPriority().trim().toLowerCase(Locale.ROOT);
        if (fam.contains("science")) raw.merge("Science", 0.04, Double::sum);
        if (fam.contains("commerce")) raw.merge("Commerce", 0.04, Double::sum);
        if (fam.contains("human")) raw.merge("Humanities", 0.04, Double::sum);

        LinkedHashMap<String, Double> percentages = new LinkedHashMap<>(CfpaMappingService.sortByValueDesc(
                CfpaMappingService.normalizeToPercentages(raw)
        ));
        String top = percentages.entrySet().iterator().next().getKey();
        String explanation = buildSimpleExplanation(
                "Class 10 stream suggestion",
                top,
                percentages,
                "We combined subject strengths with your interest signals to recommend a stream that stays realistic and flexible."
        );

        List<String> subjects = switch (top) {
            case "Science" -> List.of("Mathematics", "Physics", "Chemistry", "Biology / Computer Science");
            case "Commerce" -> List.of("Accountancy", "Business Studies", "Economics", "Mathematics (optional)");
            default -> List.of("History", "Political Science", "Psychology / Sociology", "English");
        };
        List<String> exams = List.of(
                "No fixed entrance at Class 10 → focus on basics + explore career videos/books",
                "Talk to seniors/teachers and compare +2 subject combinations"
        );
        List<String> nextSteps = List.of(
                "Pick a stream that you can study consistently for 2 years (not only based on trends)",
                "Choose optional subjects (e.g. Math/CS) that keep more doors open",
                "Create a simple weekly plan: 60% strengths + 40% weak areas"
        );

        String metadataJson = buildGuidanceMetadataJson(subjects, exams, nextSteps);
        persistAssessmentResult(user, "CLASS10", percentages, top, explanation, metadataJson);

        return new PredictionResponse(
                top,
                percentages,
                rankList(percentages),
                explanation,
                0.0,
                null,
                null,
                null,
                null,
                null,
                List.of(),
                subjects,
                exams,
                nextSteps
        );
    }

    public PredictionResponse predictAfter12Career(String authenticatedUserId, After12CareerRequest req) {
        User user = userRepository.findById(Long.valueOf(authenticatedUserId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String stream = req.stream() == null ? "" : req.stream().trim().toUpperCase(Locale.ROOT);
        List<String> careers = switch (stream) {
            case "COMMERCE" -> List.of("B.Com / Accounting", "CA / CS", "Business & Management", "Finance & Banking", "Digital Marketing");
            case "ARTS" -> List.of("Law", "Psychology", "Journalism & Media", "Design", "Civil Services (UPSC/State)");
            default -> List.of("Engineering (B.Tech)", "Medicine (MBBS/BDS)", "Computer Science & IT", "Pure Sciences (B.Sc)", "Architecture / Design");
        };

        Map<String, Double> raw = new LinkedHashMap<>();
        for (String c : careers) raw.put(c, 1.0);

        double pct = (req.percentage() == null ? 0 : req.percentage()) / 100.0;
        for (String c : careers) {
            raw.merge(c, 0.35 * pct, Double::sum);
        }

        for (String interest : req.interests()) {
            if (interest == null) continue;
            String it = interest.trim().toLowerCase(Locale.ROOT);
            if (it.contains("engineering")) raw.merge("Engineering (B.Tech)", 0.35, Double::sum);
            if (it.contains("medicine")) raw.merge("Medicine (MBBS/BDS)", 0.35, Double::sum);
            if (it.contains("computer")) raw.merge("Computer Science & IT", 0.35, Double::sum);
            if (it.contains("research")) raw.merge("Pure Sciences (B.Sc)", 0.30, Double::sum);
            if (it.contains("design")) {
                raw.merge("Architecture / Design", 0.28, Double::sum);
                raw.merge("Design", 0.28, Double::sum);
            }
            if (it.contains("business")) raw.merge("Business & Management", 0.35, Double::sum);
            if (it.contains("finance")) raw.merge("Finance & Banking", 0.35, Double::sum);
            if (it.contains("law")) raw.merge("Law", 0.35, Double::sum);
            if (it.contains("psychology")) raw.merge("Psychology", 0.35, Double::sum);
            if (it.contains("media")) raw.merge("Journalism & Media", 0.35, Double::sum);
            if (it.contains("government")) raw.merge("Civil Services (UPSC/State)", 0.35, Double::sum);
            if (it.contains("entrepreneur")) raw.merge("Business & Management", 0.25, Double::sum);
            if (it.contains("marketing")) raw.merge("Digital Marketing", 0.30, Double::sum);
            if (it.contains("account") || it.contains("commerce")) raw.merge("B.Com / Accounting", 0.30, Double::sum);
            if (it.contains("ca") || it.contains("cs")) raw.merge("CA / CS", 0.32, Double::sum);
        }

        if (req.aptitudeTags() != null) {
            for (String tag : req.aptitudeTags()) {
                if (tag == null) continue;
                String t = tag.trim().toLowerCase(Locale.ROOT);
                if (t.contains("numbers") || t.contains("logic")) {
                    raw.merge("Engineering (B.Tech)", 0.14, Double::sum);
                    raw.merge("Finance & Banking", 0.14, Double::sum);
                }
                if (t.contains("people") || t.contains("communication")) {
                    raw.merge("Business & Management", 0.14, Double::sum);
                    raw.merge("Journalism & Media", 0.14, Double::sum);
                }
                if (t.contains("biology") || t.contains("health")) {
                    raw.merge("Medicine (MBBS/BDS)", 0.16, Double::sum);
                }
                if (t.contains("creative") || t.contains("visual")) {
                    raw.merge("Design", 0.16, Double::sum);
                    raw.merge("Architecture / Design", 0.14, Double::sum);
                }
            }
        }

        String wp = req.workPreference() == null ? "" : req.workPreference().trim().toLowerCase(Locale.ROOT);
        if (wp.contains("startup")) raw.merge("Business & Management", 0.10, Double::sum);
        if (wp.contains("research")) raw.merge("Pure Sciences (B.Sc)", 0.10, Double::sum);
        if (wp.contains("stable") || wp.contains("government")) raw.merge("Civil Services (UPSC/State)", 0.10, Double::sum);

        String budget = req.budget() == null ? "" : req.budget().trim().toLowerCase(Locale.ROOT);
        if (budget.contains("low")) {
            raw.merge("Pure Sciences (B.Sc)", 0.08, Double::sum);
            raw.merge("B.Com / Accounting", 0.08, Double::sum);
        }
        String readiness = req.examReadiness() == null ? "" : req.examReadiness().trim().toLowerCase(Locale.ROOT);
        if (readiness.contains("mocks")) {
            raw.merge("Engineering (B.Tech)", 0.06, Double::sum);
            raw.merge("Medicine (MBBS/BDS)", 0.06, Double::sum);
            raw.merge("Law", 0.04, Double::sum);
        }

        LinkedHashMap<String, Double> percentages = new LinkedHashMap<>(CfpaMappingService.sortByValueDesc(
                CfpaMappingService.normalizeToPercentages(raw)
        ));
        String top = percentages.entrySet().iterator().next().getKey();
        String explanation = buildSimpleExplanation(
                "After 12th career directions",
                top,
                percentages,
                "We matched your stream and interests to common next-step paths. Use this as guidance and validate with mentors, colleges, and entrance requirements."
        );

        Guidance g = guidanceForAfter12(top);
        String metadataJson = buildGuidanceMetadataJson(g.subjects, g.exams, g.nextSteps);
        persistAssessmentResult(user, "AFTER12", percentages, top, explanation, metadataJson);

        return new PredictionResponse(
                top,
                percentages,
                rankList(percentages),
                explanation,
                0.0,
                null,
                null,
                null,
                null,
                null,
                List.of(),
                g.subjects,
                g.exams,
                g.nextSteps
        );
    }

    private static Map<String, Double> uniformCareerLayer(List<String> careerDomains) {
        Map<String, Double> m = new LinkedHashMap<>();
        double n = careerDomains.size();
        double eq = 100.0 / n;
        for (String c : careerDomains) {
            m.put(c, eq);
        }
        return m;
    }

    private static void mergeWeights(Map<String, Double> target, Map<String, Double> row) {
        for (Map.Entry<String, Double> e : row.entrySet()) {
            target.merge(e.getKey(), e.getValue(), Double::sum);
        }
    }

    private static double projectTierMultiplier(String tier) {
        String t = tier == null ? "" : tier.trim().toLowerCase(Locale.ROOT);
        return switch (t) {
            case "beginner" -> 1.0;
            case "intermediate" -> 2.0;
            case "advanced" -> 3.0;
            default -> 1.5;
        };
    }

    private static void applyCertificationNudgeExpanded(Map<String, Double> blended) {
        blended.merge("Software Engineer", 0.85, Double::sum);
        blended.merge("Cloud Engineer", 0.55, Double::sum);
    }

    private static void applyWorkTypeNudgeExpanded(Map<String, Double> blended, String workType) {
        String w = workType.trim().toLowerCase(Locale.ROOT);
        if (w.contains("remote") || w.contains("distributed")) {
            blended.merge("Cloud Engineer", 1.15, Double::sum);
            blended.merge("Web Developer", 0.75, Double::sum);
        } else if (w.contains("startup")) {
            blended.merge("Web Developer", 1.35, Double::sum);
            blended.merge("Software Engineer", 0.85, Double::sum);
        } else if (w.contains("enterprise")) {
            blended.merge("Software Engineer", 1.05, Double::sum);
            blended.merge("Cloud Engineer", 0.75, Double::sum);
        }
    }

    private void persistInputAndResult(
            User user,
            PredictionRequest req,
            BranchCareerConfigService.BranchProfile branchProfile,
            LinkedHashMap<String, Double> percentages,
            String topCareer,
            String explanation,
            double confidence,
            Map<String, Double> skillBreakdown,
            Map<String, Double> interestBreakdown,
            String whyBranchFit,
            List<String> crossBranchSuggestions
    ) {
        UserInput input = new UserInput();
        input.setUser(user);
        input.setCgpa(req.cgpa());
        input.setBranch(branchProfile.code());
        input.setTechnicalSkills(String.join(",", req.technicalSkills()));
        input.setInterests(String.join(",", req.interests()));
        input.setProjectExperience(req.projectExperience());
        input.setCertifications(req.certifications());
        input.setPreferredWorkType(req.preferredWorkType());
        userInputRepository.save(input);

        CareerResult result = new CareerResult();
        result.setUser(user);
        result.setAssessmentType("ENGINEERING");
        try {
            result.setCareerScoresJson(objectMapper.writeValueAsString(percentages));
            result.setMetadataJson(buildMetadataJson(
                    confidence,
                    skillBreakdown,
                    interestBreakdown,
                    branchProfile.code(),
                    branchProfile.label(),
                    whyBranchFit,
                    crossBranchSuggestions
            ));
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not serialize scores");
        }
        result.setTopCareer(topCareer);
        result.setExplanation(explanation);
        careerResultRepository.save(result);
    }

    private String buildMetadataJson(
            double confidence,
            Map<String, Double> skill,
            Map<String, Double> interest,
            String branchCode,
            String branchLabel,
            String whyBranchFit,
            List<String> crossBranchSuggestions
    ) throws JsonProcessingException {
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("confidencePercent", confidence);
        meta.put("skillMatchBreakdown", skill);
        meta.put("interestMatchBreakdown", interest);
        meta.put("branchCode", branchCode);
        meta.put("branchLabel", branchLabel);
        meta.put("whyBranchFit", whyBranchFit);
        meta.put("crossBranchSuggestions", crossBranchSuggestions);
        return objectMapper.writeValueAsString(meta);
    }

    public ResultsHistoryResponse getLatestResult(String authenticatedUserId, String pathUserId, String type) {
        if (!authenticatedUserId.equals(pathUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your own results");
        }
        String t = (type == null || type.isBlank()) ? "ENGINEERING" : type.trim().toUpperCase(Locale.ROOT);
        CareerResult latest = (t.equals("ENGINEERING")
                ? careerResultRepository.findFirstByUser_IdOrderByCreatedAtDesc(Long.valueOf(pathUserId))
                : careerResultRepository.findFirstByUser_IdAndAssessmentTypeOrderByCreatedAtDesc(Long.valueOf(pathUserId), t)
        )
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No results yet"));
        try {
            Map<String, Double> scores = objectMapper.readValue(
                    latest.getCareerScoresJson(),
                    new TypeReference<>() {}
            );
            Double confidence = null;
            Map<String, Double> skillBd = null;
            Map<String, Double> interestBd = null;
            String branchCode = null;
            String branchLabel = null;
            String whyBranchFit = null;
            List<String> cross = null;
            List<String> subjects = null;
            List<String> exams = null;
            List<String> nextSteps = null;
            if (latest.getMetadataJson() != null && !latest.getMetadataJson().isBlank()) {
                JsonNode meta = objectMapper.readTree(latest.getMetadataJson());
                if (meta.has("confidencePercent")) {
                    confidence = meta.get("confidencePercent").asDouble();
                }
                if (meta.has("skillMatchBreakdown")) {
                    skillBd = objectMapper.convertValue(meta.get("skillMatchBreakdown"), new TypeReference<>() {});
                }
                if (meta.has("interestMatchBreakdown")) {
                    interestBd = objectMapper.convertValue(meta.get("interestMatchBreakdown"), new TypeReference<>() {});
                }
                if (meta.has("branchCode")) {
                    branchCode = meta.get("branchCode").asText(null);
                }
                if (meta.has("branchLabel")) {
                    branchLabel = meta.get("branchLabel").asText(null);
                }
                if (meta.has("whyBranchFit")) {
                    whyBranchFit = meta.get("whyBranchFit").asText(null);
                }
                if (meta.has("crossBranchSuggestions")) {
                    cross = objectMapper.convertValue(meta.get("crossBranchSuggestions"), new TypeReference<>() {});
                }
                if (meta.has("recommendedSubjects")) {
                    subjects = objectMapper.convertValue(meta.get("recommendedSubjects"), new TypeReference<>() {});
                }
                if (meta.has("examPaths")) {
                    exams = objectMapper.convertValue(meta.get("examPaths"), new TypeReference<>() {});
                }
                if (meta.has("nextSteps")) {
                    nextSteps = objectMapper.convertValue(meta.get("nextSteps"), new TypeReference<>() {});
                }
            }
            return new ResultsHistoryResponse(
                    String.valueOf(latest.getId()),
                    latest.getTopCareer(),
                    scores,
                    latest.getExplanation(),
                    latest.getCreatedAt(),
                    confidence,
                    skillBd,
                    interestBd,
                    branchCode,
                    branchLabel,
                    whyBranchFit,
                    cross,
                    subjects,
                    exams,
                    nextSteps,
                    latest.getAssessmentType()
            );
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read scores");
        }
    }

    private static double normalizeCgpaToScale10(double cgpa) {
        if (cgpa <= 10.0) {
            return Math.min(10.0, Math.max(0.0, cgpa));
        }
        return Math.min(10.0, Math.max(0.0, (cgpa / 100.0) * 10.0));
    }

    private static List<PredictionResponse.CareerRankItem> rankList(LinkedHashMap<String, Double> ordered) {
        List<String> keys = new ArrayList<>(ordered.keySet());
        return IntStream.range(0, keys.size())
                .mapToObj(i -> new PredictionResponse.CareerRankItem(
                        keys.get(i),
                        ordered.get(keys.get(i)),
                        i + 1
                ))
                .collect(Collectors.toList());
    }

    private static String buildWhyBranchFit(
            BranchCareerConfigService.BranchProfile branch,
            String top,
            Map<String, Double> skillCareer,
            Map<String, Double> interestCareer
    ) {
        double s = skillCareer.getOrDefault(top, 0.0);
        double in = interestCareer.getOrDefault(top, 0.0);
        return String.format(
                Locale.US,
                "Based on your %s background and how your skills (≈%.0f%% toward this role family) "
                        + "and interests (≈%.0f%%) align, %s is a strong, realistic match.",
                branch.label(),
                s,
                in,
                top
        );
    }

    private static String buildExplanation(
            PredictionRequest req,
            BranchCareerConfigService.BranchProfile branch,
            String top,
            Map<String, Double> percentages,
            double confidence,
            Map<String, Double> skillNorm,
            Map<String, Double> interestNorm,
            String whyBranchFit
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("Your top match is ").append(top).append(" at ").append(percentages.get(top)).append("%. ");
        sb.append("Confidence score: ").append(String.format(Locale.US, "%.0f%%", confidence)).append(
                " (combines mapping coverage of selected skills/interests with fit to your branch). ");
        sb.append("CFPA weights: skills 35%, interests 25%, branch context 20%, academic performance 10%, project experience 10%. ");

        double sTop = skillNorm.values().stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        double iTop = interestNorm.values().stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        sb.append("Legacy skill profile peaks at about ")
                .append(String.format(Locale.US, "%.0f%%", sTop))
                .append(" in its strongest bucket; interests peak at about ")
                .append(String.format(Locale.US, "%.0f%%", iTop))
                .append(". ");

        sb.append(whyBranchFit).append(" ");

        List<String> hints = new ArrayList<>();
        if (req.technicalSkills().stream().anyMatch(s -> s != null && s.toLowerCase(Locale.ROOT).contains("python"))) {
            hints.add("Python supports data-heavy and automation paths");
        }
        if (req.interests().stream().anyMatch(s -> s != null && s.toLowerCase(Locale.ROOT).contains("security"))) {
            hints.add("security-oriented interests reinforce defensive and infrastructure roles");
        }
        if (req.projectExperience() != null && req.projectExperience().toLowerCase(Locale.ROOT).contains("advanced")) {
            hints.add("advanced project experience strengthens delivery and ownership signals");
        }
        if (!hints.isEmpty()) {
            sb.append(String.join("; ", hints)).append(". ");
        }
        sb.append("Use these scores as a structured guide alongside mentorship and job-market research.");
        return sb.toString();
    }

    private void persistAssessmentResult(
            User user,
            String assessmentType,
            LinkedHashMap<String, Double> percentages,
            String topCareer,
            String explanation,
            String metadataJson
    ) {
        CareerResult result = new CareerResult();
        result.setUser(user);
        result.setAssessmentType(assessmentType == null ? "ENGINEERING" : assessmentType);
        try {
            result.setCareerScoresJson(objectMapper.writeValueAsString(percentages));
            result.setMetadataJson(metadataJson);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not serialize scores");
        }
        result.setTopCareer(topCareer);
        result.setExplanation(explanation);
        careerResultRepository.save(result);
    }

    private static String buildSimpleExplanation(String title, String top, Map<String, Double> percentages, String tail) {
        Double p = percentages.get(top);
        String pct = p == null ? "—" : String.format(Locale.US, "%.1f%%", p);
        return title + ": top match is " + top + " (" + pct + "). " + tail;
    }

    private String buildGuidanceMetadataJson(List<String> subjects, List<String> exams, List<String> nextSteps) {
        try {
            Map<String, Object> meta = new LinkedHashMap<>();
            meta.put("recommendedSubjects", subjects);
            meta.put("examPaths", exams);
            meta.put("nextSteps", nextSteps);
            return objectMapper.writeValueAsString(meta);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not serialize guidance");
        }
    }

    private record Guidance(List<String> subjects, List<String> exams, List<String> nextSteps) {}

    private static Guidance guidanceForAfter12(String top) {
        if (top == null) {
            return new Guidance(List.of(), List.of(), List.of());
        }
        return switch (top) {
            case "Engineering (B.Tech)" -> new Guidance(
                    List.of("Mathematics", "Physics", "Chemistry", "Computer Science (helpful)"),
                    List.of("JEE Main/JEE Advanced", "State CET (as applicable)", "BITSAT/VITEEE (as applicable)"),
                    List.of("Shortlist branches + colleges; check cutoffs", "Start weak-topic plan for PCM", "Build 1 small tech project to confirm interest")
            );
            case "Medicine (MBBS/BDS)" -> new Guidance(
                    List.of("Biology", "Chemistry", "Physics"),
                    List.of("NEET UG"),
                    List.of("Revise NCERT strongly (Bio/Chem)", "Solve PYQs weekly", "Confirm interest with doctor/medical student mentorship")
            );
            case "Computer Science & IT" -> new Guidance(
                    List.of("Mathematics", "Computer Science", "Physics (helpful)"),
                    List.of("JEE Main/State CET (for engineering CS)", "CUET / university entrances (varies by college)"),
                    List.of("Start coding basics (Python/JS)", "Try a mini-project (website/app)", "Pick college path: B.Tech CS vs BCA/B.Sc CS")
            );
            case "CA / CS" -> new Guidance(
                    List.of("Accountancy", "Economics", "Business Studies"),
                    List.of("CA Foundation", "CS Executive (via Foundation route)"),
                    List.of("Understand exam levels + articleship timeline", "Start basic accounts + cost concepts", "Discuss workload with a CA/CS student")
            );
            case "B.Com / Accounting" -> new Guidance(
                    List.of("Accountancy", "Economics", "Business Studies", "Mathematics (optional)"),
                    List.of("CUET / university entrances (varies)"),
                    List.of("Shortlist B.Com specializations", "Explore internships/part-time skills (Excel/Tally)", "Decide if CA/CS/CMA is a future goal")
            );
            case "Business & Management" -> new Guidance(
                    List.of("Economics", "Business Studies", "English/Communication"),
                    List.of("CUET / university entrances (varies)", "IPMAT (for integrated programs)"),
                    List.of("Build communication + presentation skills", "Do 1 small business case project", "Compare BBA/BMS vs B.Com paths")
            );
            case "Finance & Banking" -> new Guidance(
                    List.of("Mathematics", "Economics", "Accountancy"),
                    List.of("CUET / university entrances (varies)"),
                    List.of("Learn basics: interest, stocks, budgeting", "Practice quantitative aptitude weekly", "Explore B.Com/BBA/Eco (Hons) options")
            );
            case "Digital Marketing" -> new Guidance(
                    List.of("English/Communication", "Basic Business/Economics"),
                    List.of("No single entrance; depends on degree/college"),
                    List.of("Learn basics: SEO, social media, ads", "Build a portfolio (1 page + 2 campaigns)", "Choose degree path (BBA/B.Com/BA) + skill courses")
            );
            case "Law" -> new Guidance(
                    List.of("English", "General Knowledge", "Logical Reasoning"),
                    List.of("CLAT", "AILET (as applicable)"),
                    List.of("Start reading daily (editorials)", "Practice reasoning sets weekly", "Talk to a lawyer/law student about the field")
            );
            case "Psychology" -> new Guidance(
                    List.of("English", "Biology (helpful)", "Social Science"),
                    List.of("CUET / university entrances (varies)"),
                    List.of("Read intro psychology books", "Volunteer/observe in counseling settings (if possible)", "Compare BA vs B.Sc Psychology based on colleges")
            );
            case "Journalism & Media" -> new Guidance(
                    List.of("English", "Current Affairs", "Writing/Storytelling"),
                    List.of("CUET / university entrances (varies)", "College-specific media tests (varies)"),
                    List.of("Create a portfolio (articles/videos)", "Practice interviewing + editing basics", "Explore specializations: reporting, PR, filmmaking")
            );
            case "Design" -> new Guidance(
                    List.of("Art/Sketching", "Basic Math (helpful)", "English/Communication"),
                    List.of("NID DAT (as applicable)", "UCEED (as applicable)", "College-specific design entrances (varies)"),
                    List.of("Build a portfolio (10–15 pieces)", "Practice fundamentals: form, color, typography", "Explore UI/UX vs product vs graphic design")
            );
            case "Architecture / Design" -> new Guidance(
                    List.of("Mathematics", "Physics", "Drawing/Design"),
                    List.of("NATA", "JEE Main Paper 2 (as applicable)"),
                    List.of("Practice sketching + basic perspective", "Research B.Arch curriculum and workload", "Visit an architecture studio if possible")
            );
            case "Civil Services (UPSC/State)" -> new Guidance(
                    List.of("History", "Polity", "Geography", "Current Affairs"),
                    List.of("UPSC (later, after graduation)", "State PSC (later)"),
                    List.of("Pick a graduation path you can excel in", "Build reading habit + notes system", "Understand the 3–5 year long-term plan early")
            );
            default -> new Guidance(
                    List.of("English/Communication", "Mathematics (optional)", "Subject aligned with your degree choice"),
                    List.of("College-specific entrances (varies)"),
                    List.of("Shortlist colleges + check eligibility", "Talk to seniors/mentors", "Try a small project to validate interest")
            );
        };
    }
}
