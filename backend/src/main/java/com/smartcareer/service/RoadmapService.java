package com.smartcareer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcareer.dto.RoadmapRequest;
import com.smartcareer.dto.RoadmapResponse;
import com.smartcareer.dto.RoadmapStepDto;
import org.springframework.core.io.ClassPathResource;
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
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

/**
 * Career roadmaps: rich branch-aware data from {@code BranchCareerMapping.json},
 * legacy {@code roadmaps.json}, optional OpenAI, then generic fallback.
 */
@Service
public class RoadmapService {

    private static final List<String> KNOWN_ORDER = List.of(
            "Software Engineering",
            "Data Science",
            "Cybersecurity",
            "Full Stack Development",
            "Cloud Computing"
    );

    private final ObjectMapper objectMapper;
    private final OpenAiService openAiService;
    private final BranchCareerMappingService branchCareerMappingService;

    private Map<String, List<RoadmapStepDto>> predefined = Map.of();

    public RoadmapService(
            ObjectMapper objectMapper,
            OpenAiService openAiService,
            BranchCareerMappingService branchCareerMappingService
    ) {
        this.objectMapper = objectMapper;
        this.openAiService = openAiService;
        this.branchCareerMappingService = branchCareerMappingService;
    }

    @PostConstruct
    void loadRoadmaps() {
        try {
            ClassPathResource resource = new ClassPathResource("roadmaps.json");
            try (InputStream is = resource.getInputStream()) {
                String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                Map<String, List<RoadmapStepDto>> raw = objectMapper.readValue(json, new TypeReference<>() {
                });
                Map<String, List<RoadmapStepDto>> map = new LinkedHashMap<>();
                for (String key : KNOWN_ORDER) {
                    if (raw.containsKey(key)) {
                        map.put(key, List.copyOf(raw.get(key)));
                    }
                }
                for (Map.Entry<String, List<RoadmapStepDto>> e : raw.entrySet()) {
                    map.putIfAbsent(e.getKey(), List.copyOf(e.getValue()));
                }
                predefined = map;
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load roadmaps.json", e);
        }
    }

    public RoadmapResponse generate(RoadmapRequest request) {
        String careerInput = request.career();
        String normalized = normalize(careerInput);
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Career name is empty");
        }

        String type = request.type() == null ? "ENGINEERING" : request.type().trim().toUpperCase(Locale.ROOT);
        String branchCode = branchCareerMappingService.resolveBranchCodeOrOther(request.branch());

        // 1. Try AI First for "Live" data
        if (openAiService.isConfigured()) {
            try {
                // Include type in the prompt for AI to know context
                String context = type + " roadmap for career " + careerInput + " in stream " + branchCode;
                List<RoadmapStepDto> aiSteps = generateWithOpenAi(context, branchCode);
                if (!aiSteps.isEmpty()) {
                    return new RoadmapResponse(aiSteps);
                }
            } catch (Exception ignored) {
                /* fall through to static/fallback */
            }
        }

        // 2. Fallback to rich pre-mapped data
        Optional<JsonNode> rich = branchCareerMappingService.findRichRoadmapArray(careerInput, branchCode);
        if (rich.isPresent()) {
            List<RoadmapStepDto> steps = parseRichSteps(rich.get());
            if (!steps.isEmpty()) {
                return new RoadmapResponse(steps);
            }
        }

        // 3. Fallback to specialized static roadmaps
        if ("CLASS10".equals(type)) {
            return new RoadmapResponse(class10Roadmap(careerInput.trim(), branchCode));
        }
        if ("AFTER12".equals(type)) {
            return new RoadmapResponse(after12Roadmap(careerInput.trim(), branchCode));
        }

        String key = resolveKey(normalized);
        if (key != null && predefined.containsKey(key)) {
            return new RoadmapResponse(predefined.get(key));
        }

        return new RoadmapResponse(genericRoadmap(careerInput.trim(), branchCode));
    }

    private List<RoadmapStepDto> class10Roadmap(String streamLabel, String branchCode) {
        Stream10 stream = resolveClass10Stream(streamLabel, branchCode);
        String streamTitle = stream.display;

        List<RoadmapStepDto> steps = new ArrayList<>();
        steps.add(new RoadmapStepDto(
                "Step 1: Lock the +2 subject combo (Week 1)",
                "Target stream: " + streamTitle + ". Choose a subject combo that matches BOTH your marks and consistency. "
                        + "Recommended focus subjects: " + String.join(", ", stream.subjects) + ". "
                        + "Talk to 1 teacher + 1 senior and confirm what optional subjects keep more doors open.",
                List.of("School syllabus", "Notebook"),
                List.of("Final subject combo decision"),
                List.of("NCERT syllabus PDFs", "School subject handbook")
        ));

        steps.add(new RoadmapStepDto(
                "Step 2: Build a weekly system (Weeks 2–6)",
                "Weekly plan: 4 study days + 1 revision day + 1 test day + 1 rest day. "
                        + "Daily: 2 focused blocks + 15 min recap. "
                        + "Use 60% time on weak topics and 40% on strengths; keep short notes.",
                List.of("Pomodoro timer", "Previous papers"),
                List.of("6-week timetable + revision notebook"),
                List.of("School sample papers", "NCERT exercises")
        ));

        steps.add(new RoadmapStepDto(
                "Step 3: Stream-specific practice (Months 1–3)",
                stream.streamPractice,
                stream.tools,
                stream.projects,
                stream.resources
        ));

        steps.add(new RoadmapStepDto(
                "Step 4: Career exploration (Months 2–6)",
                "Each month, explore 2 careers aligned to " + streamTitle + ". Shortlist from: " + String.join(", ", stream.careers) + ". "
                        + "For each: what they do, required subjects, and entrances after 12th (high-level).",
                List.of("Web research", "Mentor chat"),
                List.of("Career notebook (12 pages)"),
                List.of("Exam official sites", "College brochures")
        ));

        steps.add(new RoadmapStepDto(
                "Step 5: Keep doors open (Month 3–6)",
                "If you are unsure, pick optional subjects that keep flexibility (e.g., Math with Commerce, CS with Science). "
                        + "Avoid choices based only on trends; prioritize consistency and interest.",
                List.of("Counselor/mentor"),
                List.of("Plan A/B subject mapping"),
                List.of("Teacher guidance", "Senior notes")
        ));

        steps.add(new RoadmapStepDto(
                "Step 6: Exam awareness (not preparation yet) (Month 4–6)",
                "Understand future entrances early (no pressure): " + String.join(", ", stream.futureExams) + ". "
                        + "Goal: know syllabus + eligibility + timeline so you don’t panic later.",
                List.of("Official brochures"),
                List.of("Entrance timeline page (one sheet)"),
                List.of("Exam notifications", "Counseling videos")
        ));

        steps.add(new RoadmapStepDto(
                "Step 7: Build communication + digital skills (Ongoing)",
                "Regardless of stream: improve English writing, presentations, and basic computer skills (docs + spreadsheets). "
                        + "This helps in admissions, projects, and interviews later.",
                List.of("Docs", "Sheets", "Presentation tools"),
                List.of("1 presentation/month + 1 page write-up"),
                List.of("Typing practice", "Basic Excel tutorials")
        ));

        steps.add(new RoadmapStepDto(
                "Step 8: Health + consistency (Ongoing)",
                "Sleep and routine are part of performance. Review progress every Sunday and adjust targets. "
                        + "If a plan fails, reduce scope but keep the habit.",
                List.of("Calendar"),
                List.of("Weekly review ritual"),
                List.of("Time management templates")
        ));

        return steps;
    }

    private List<RoadmapStepDto> after12Roadmap(String careerDirection, String branchCode) {
        Direction12 dir = resolveAfter12Direction(careerDirection, branchCode);
        String label = dir.display;

        List<RoadmapStepDto> steps = new ArrayList<>();
        steps.add(new RoadmapStepDto(
                "Step 1: Confirm the path + eligibility (Week 1)",
                "Target direction: " + label + ". Based on your branch (" + branchCode + "), confirm your eligibility and required subjects for entrances: " + String.join(", ", dir.exams) + ". "
                        + "Research 2 senior mentors in your branch who successfully shifted to " + label + ".",
                List.of("Official websites", "Brochures"),
                List.of("Eligibility + entrance shortlist"),
                List.of("Exam brochures", "College eligibility pages")
        ));

        steps.add(new RoadmapStepDto(
                "Step 2: Make an 8-week prep plan (Weeks 2–9)",
                dir.prepPlan + " Adjust the pace based on your strong subjects in " + branchCode + ".",
                List.of("PYQs", "Mock tests", "Revision notes"),
                List.of("8-week plan + weekly mock review"),
                List.of("NCERT (where relevant)", "PYQ collections")
        ));

        steps.add(new RoadmapStepDto(
                "Step 3: Build proof-of-interest (Month 1–3)",
                dir.proofOfInterest + " Try to leverage your " + branchCode + " knowledge in these projects to stand out.",
                dir.proofTools,
                dir.proofProjects,
                dir.proofResources
        ));

        steps.add(new RoadmapStepDto(
                "Step 4: College shortlisting (Month 2–3)",
                "Shortlist 12 colleges for " + label + ": check fees, location, and scholarship eligibility for " + branchCode + " students. "
                        + "Create a comparison sheet focused on ROI.",
                List.of("Spreadsheet"),
                List.of("College comparison sheet"),
                List.of("College websites", "Scholarship pages", "NIRF (reference only)")
        ));

        steps.add(new RoadmapStepDto(
                "Step 5: Applications + documents (Month 2–4)",
                "Prepare documents: " + branchCode + " mark sheets, certificates, ID. Track deadlines for " + label + " portals.",
                List.of("Calendar", "Drive folder"),
                List.of("Deadline tracker"),
                List.of("Application portals")
        ));

        steps.add(new RoadmapStepDto(
                "Step 6: Backup plans (Month 2–4)",
                "Keep 2 backups: one in your core branch (" + branchCode + ") and one alternate degree in " + label + ". "
                        + "Map Plan A/B/C clearly.",
                List.of("Mentor call"),
                List.of("Plan A/B/C"),
                List.of("Counselor guidance")
        ));

        steps.add(new RoadmapStepDto(
                "Step 7: Weekly execution loop (Ongoing)",
                "Every Sunday: review " + label + " mocks, identify gaps, and set next week's targets.",
                List.of("Planner"),
                List.of("Weekly review ritual"),
                List.of("Timeboxing templates")
        ));

        steps.add(new RoadmapStepDto(
                "Step 8: Health + consistency (Ongoing)",
                "Sustainable study is key to success in " + label + ". Keep the habit daily.",
                List.of("Habit tracker"),
                List.of("Sustainable schedule"),
                List.of("Stress management resources")
        ));

        return steps;
    }

    private record Stream10(
            String code,
            String display,
            List<String> subjects,
            List<String> careers,
            List<String> futureExams,
            String streamPractice,
            List<String> tools,
            List<String> projects,
            List<String> resources
    ) {}

    private Stream10 resolveClass10Stream(String streamLabel, String branchCode) {
        String s = streamLabel == null ? "" : streamLabel.trim().toLowerCase(Locale.ROOT);
        
        // Intelligent mapping for career keywords
        if (s.contains("commerce") || s.contains("ca") || s.contains("account") || s.contains("finance") || s.contains("business")) {
            return new Stream10(
                    "COMMERCE",
                    "Commerce",
                    List.of("Accountancy", "Business Studies", "Economics", "Mathematics (optional)"),
                    List.of("CA/CS/CMA", "Finance & Banking", "Business/Management", "Economics", "Digital Marketing"),
                    List.of("CUET (varies)", "College-specific entrances (varies)"),
                    "Commerce practice: build Accountancy fundamentals (journal -> ledger -> final accounts), start basic quantitative aptitude, and improve communication.",
                    List.of("Accountancy textbook", "Aptitude practice"),
                    List.of("Monthly accounts practice set", "Personal budget sheet in Excel"),
                    List.of("NCERT Economics basics", "Spreadsheet basics")
            );
        }
        if (s.contains("human") || s.contains("arts") || s.contains("law") || s.contains("media") || s.contains("psychology") || s.contains("design")) {
            return new Stream10(
                    "HUMANITIES",
                    "Humanities",
                    List.of("History", "Political Science", "Psychology / Sociology", "English"),
                    List.of("Law", "Psychology", "Journalism/Media", "Design", "Civil Services (later)"),
                    List.of("CLAT (later)", "NID/UCEED (if design)", "CUET (varies)"),
                    "Humanities practice: build reading + writing habit, improve answers with structure, and start current affairs notes weekly.",
                    List.of("Newspaper/editorials", "Writing practice"),
                    List.of("1 essay/week", "Current affairs notes (weekly)"),
                    List.of("NCERT Social Science", "Editorial reading guides")
            );
        }
        
        // Default or Science-related
        String display = (s.contains("tech") || s.contains("stack") || s.contains("engineer") || s.contains("science")) ? "Science (for " + streamLabel + ")" : "Science";
        return new Stream10(
                "SCIENCE",
                display,
                List.of("Mathematics", "Physics", "Chemistry", "Biology / Computer Science"),
                List.of("Engineering", "Medicine", "Pure Sciences", "Architecture", "Tech careers (later)"),
                List.of("JEE (later)", "NEET (later)", "NATA (later)"),
                "Science practice: daily numericals (if PCM), regular concept revision, and error-log for mistakes. If PCB, prioritize NCERT Bio + Chem understanding.",
                List.of("NCERT", "Problem sets"),
                List.of("Error log notebook", "Monthly mock test"),
                List.of("NCERT + exemplar (as available)", "School PYQs")
        );
    }

    private record Direction12(
            String code,
            String display,
            List<String> exams,
            String prepPlan,
            String proofOfInterest,
            List<String> proofTools,
            List<String> proofProjects,
            List<String> proofResources
    ) {}

    private Direction12 resolveAfter12Direction(String careerDirection, String branchCode) {
        String s = careerDirection == null ? "" : careerDirection.trim().toLowerCase(Locale.ROOT);
        String bc = branchCode == null ? "OTHER" : branchCode.trim().toUpperCase(Locale.ROOT);

        // 1. Check for cross-stream conflicts (e.g., Commerce student wanting Engineering)
        boolean isScience = bc.contains("SCI") || bc.contains("ENG");
        boolean isMed = bc.contains("BIO") || bc.contains("MED");
        
        // If non-science student wants Engineering/Med, give them a "Transition" roadmap
        if (!isScience && !isMed && (s.contains("engineer") || s.contains("tech") || s.contains("science") || s.contains("mbbs") || s.contains("neet"))) {
            return new Direction12(
                "TRANSITION",
                careerDirection + " (Cross-Stream Path)",
                List.of("Bridge Exams", "NIOS (if applicable)", "Private College Entrances"),
                "Transition plan: Since your current stream is " + branchCode + ", you may need to clear additional Math/Science papers via NIOS or look for universities that offer 'Bridge Courses' for " + careerDirection + ". Focus on foundational logic first.",
                "Proof: Complete a foundational certification in " + careerDirection + " basics to prove your aptitude to admissions committees.",
                List.of("Online Bridge Courses", "NIOS handbook"),
                List.of("Foundational project", "Learning log"),
                List.of("University bridge program lists")
            );
        }

        // 2. Standard path resolution
        if (s.contains("neet") || s.contains("mbbs") || s.contains("medicine") || s.contains("bds")) {
            return new Direction12(
                    "MED",
                    "Medicine (MBBS/BDS)",
                    List.of("NEET UG"),
                    "NEET plan: NCERT-first (Bio/Chem), then PYQs + weekly mocks. Since you are in " + branchCode + ", focus heavily on NCERT Physics/Bio consistency.",
                    "Proof: 1-page reflection after talking to a doctor/medical student + a basic biology revision notebook.",
                    List.of("NCERT", "PYQs"),
                    List.of("Weekly mock analysis sheet"),
                    List.of("NEET official syllabus", "NCERT Biology")
            );
        }
        if (s.contains("clat") || s.contains("law")) {
            return new Direction12(
                    "LAW",
                    "Law",
                    List.of("CLAT", "AILET", "LSAT"),
                    "Law entrances: " + branchCode + " students often excel here. Daily: reading + GK + legal reasoning sets. Weekly: 1 mock + analysis.",
                    "Proof: writing samples (2 essays) + 1 current-affairs summary per week.",
                    List.of("Newspaper", "Mock tests"),
                    List.of("Essay folder", "Weekly GK notes"),
                    List.of("CLAT/AILET official sites")
            );
        }
        if (s.contains("design") || s.contains("nid") || s.contains("uceed") || s.contains("architecture") || s.contains("nata")) {
            return new Direction12(
                    "DESIGN",
                    "Design / Architecture",
                    List.of("NID DAT / UCEED (design)", "NATA / JEE Paper 2 (architecture)"),
                    "Design/Arch plan: portfolio + daily sketching + fundamentals. Your background in " + branchCode + " can help in the theoretical/analytical sections.",
                    "Proof: portfolio with 10–15 pieces (sketches + concepts) and 1 case study.",
                    List.of("Sketchbook", "Portfolio folder"),
                    List.of("Portfolio v1", "1 case study"),
                    List.of("UCEED/NID/NATA syllabi")
            );
        }
        if (s.contains("ca") || s.contains("cs") || s.contains("account")) {
            return new Direction12(
                    "COMMERCE_PRO",
                    "CA / CS / Accounting",
                    List.of("CA Foundation", "CS Foundation"),
                    "CA/CS plan: " + (bc.contains("COMMERCE") ? "Use your school Accountancy base." : "Start with basic Accountancy (Class 11/12 NCERT) first.") + " Build consistency and practice 2 tests weekly.",
                    "Proof: maintain a practice notebook (accounts + economics) and a plan for exam stages.",
                    List.of("Accountancy books", "PYQs"),
                    List.of("Accounts practice sets", "Stage timeline sheet"),
                    List.of("ICAI/ICSI official sites")
            );
        }
        if (s.contains("business") || s.contains("management") || s.contains("bba") || s.contains("marketing") || s.contains("finance")) {
            return new Direction12(
                    "MGMT",
                    "Business / Management",
                    List.of("CUET", "IPMAT", "NPAT"),
                    "Management plan: aptitude + English + interview readiness. Leverage your " + branchCode + " analytical skills for the QA section.",
                    "Proof: 1 mini business case + 1 presentation + a basic resume/portfolio.",
                    List.of("Spreadsheet", "Presentation tool"),
                    List.of("1 case study", "1 presentation"),
                    List.of("College entrance pages")
            );
        }
        // Default engineering/CS direction
        return new Direction12(
                "ENG",
                "Engineering / Tech",
                List.of("JEE Main", "State CETs", "VITEEE/BITSATH"),
                "Engineering plan: NCERT + problem practice + PYQs. Since you are in " + branchCode + ", ensure your Math/Physics logic is your top priority.",
                "Proof: one small project aligned to interest (basic website/app) OR a 1-page technical learning log.",
                List.of("PYQs", "Mock tests"),
                List.of("Weekly mock analysis", "Mini project/learning log"),
                List.of("JEE/CET official sites")
        );
    }

    private static List<RoadmapStepDto> parseRichSteps(JsonNode arr) {
        List<RoadmapStepDto> out = new ArrayList<>();
        if (arr == null || !arr.isArray()) {
            return out;
        }
        for (JsonNode n : arr) {
            String step = n.path("step").asText("");
            String details = n.path("details").asText("");
            if (step.isEmpty() || details.isEmpty()) {
                continue;
            }
            out.add(new RoadmapStepDto(
                    step,
                    details,
                    readStringList(n.path("tools")),
                    readStringList(n.path("projects")),
                    readStringList(n.path("resources"))
            ));
        }
        return out;
    }

    private static List<String> readStringList(JsonNode node) {
        if (node == null || !node.isArray() || node.isEmpty()) {
            return List.of();
        }
        List<String> list = new ArrayList<>();
        for (JsonNode n : node) {
            String s = n.asText("").trim();
            if (!s.isEmpty()) {
                list.add(s);
            }
        }
        return List.copyOf(list);
    }

    private String normalize(String s) {
        if (s == null) {
            return "";
        }
        return Pattern.compile("\\s+").matcher(s.trim()).replaceAll(" ");
    }

    private String resolveKey(String normalized) {
        String lc = normalized.toLowerCase(Locale.ROOT);
        String aliased = aliasCareerToRoadmapKey(lc);
        if (aliased != null) {
            return aliased;
        }
        for (String k : predefined.keySet()) {
            if (k.toLowerCase(Locale.ROOT).equals(lc)) {
                return k;
            }
        }
        for (String k : predefined.keySet()) {
            if (lc.contains(k.toLowerCase(Locale.ROOT))
                    || k.toLowerCase(Locale.ROOT).contains(lc)) {
                return k;
            }
        }
        if (lc.contains("software") && lc.contains("engineer")) {
            return "Software Engineering";
        }
        if (lc.contains("data") && (lc.contains("science") || lc.contains("scientist"))) {
            return "Data Science";
        }
        if (lc.contains("cyber") || lc.contains("security")) {
            return "Cybersecurity";
        }
        if (lc.contains("full") && lc.contains("stack")) {
            return "Full Stack Development";
        }
        if (lc.contains("cloud") || lc.contains("devops") || lc.contains("aws")) {
            return "Cloud Computing";
        }
        return null;
    }

    private static String aliasCareerToRoadmapKey(String normalizedLower) {
        if (normalizedLower.contains("software engineer") && !normalizedLower.contains("embedded")) {
            return "Software Engineering";
        }
        if (normalizedLower.contains("data scientist") || (normalizedLower.contains("data science") && !normalizedLower.contains("analyst"))) {
            return "Data Science";
        }
        if (normalizedLower.contains("data analyst")) {
            return "Data Science";
        }
        if (normalizedLower.contains("ai engineer") || normalizedLower.contains("artificial intelligence")) {
            return "Data Science";
        }
        if (normalizedLower.contains("web developer") || normalizedLower.contains("full stack")) {
            return "Full Stack Development";
        }
        if (normalizedLower.contains("cloud engineer") || normalizedLower.contains("devops")) {
            return "Cloud Computing";
        }
        if (normalizedLower.contains("cybersecurity") || normalizedLower.contains("security engineer")) {
            return "Cybersecurity";
        }
        if (normalizedLower.contains("embedded") || normalizedLower.contains("vlsi") || normalizedLower.contains("iot engineer")) {
            return "Software Engineering";
        }
        if (normalizedLower.contains("electrical engineer") || normalizedLower.contains("power systems")) {
            return "Software Engineering";
        }
        if (normalizedLower.contains("mechanical") || normalizedLower.contains("production engineer")) {
            return "Software Engineering";
        }
        if (normalizedLower.contains("civil engineer") || normalizedLower.contains("structural engineer")) {
            return "Software Engineering";
        }
        return null;
    }

    private List<RoadmapStepDto> genericRoadmap(String label, String branchCode) {
        String branchNote = branchCode != null && !branchCode.equalsIgnoreCase("OTHER")
                ? " Tailor each step to branch " + branchCode + " (labs, standards, and tools used in that industry)."
                : "";
        List<RoadmapStepDto> steps = new ArrayList<>();
        steps.add(new RoadmapStepDto(
                "Step 1: Clarify the role (Beginner)",
                "Define target titles and industries for \"" + label + "\". Review 10 job descriptions; list recurring skills and tools. Timeline: 1–2 weeks." + branchNote,
                List.of("Job boards", "LinkedIn", "Notion"),
                List.of("JD comparison matrix"),
                List.of("O*NET", "Glassdoor skill tags")
        ));
        steps.add(new RoadmapStepDto(
                "Step 2: Core skills",
                "Pick one primary skill chain aligned with your branch; follow official docs and short courses. Build weekly micro-projects.",
                List.of("IDE", "Official docs"),
                List.of("Weekly micro-project"),
                List.of("YouTube playlists with labs")
        ));
        steps.add(new RoadmapStepDto(
                "Step 3: Projects portfolio",
                "Ship 2–3 projects with README, assumptions, and metrics. Host demos where applicable.",
                List.of("Git", "CI optional"),
                List.of("Portfolio site or PDF"),
                List.of("Peer review checklist")
        ));
        steps.add(new RoadmapStepDto(
                "Step 4: Professional skills",
                "Practice behavioral interviews (STAR), collaboration, and written design notes.",
                List.of("Calendar", "Recording for mock interviews"),
                List.of("STAR story bank"),
                List.of("Company engineering blogs")
        ));
        steps.add(new RoadmapStepDto(
                "Step 5: Community & feedback",
                "Join domain communities, get mentorship, iterate on resume and headline.",
                List.of("Discord/Slack", "Meetup"),
                List.of("Mentor coffee chat"),
                List.of("Regional industry associations")
        ));
        steps.add(new RoadmapStepDto(
                "Step 6: Advanced growth",
                "Deepen specialization; certifications only if demanded by employers in your region.",
                List.of("Advanced courses"),
                List.of("Specialization capstone"),
                List.of("Certification roadmaps")
        ));
        return steps;
    }

    private List<RoadmapStepDto> generateWithOpenAi(String context, String branchCode) throws Exception {
        String branchLabel = branchCareerMappingService.findBranch(branchCode)
                .map(BranchCareerMappingService.BranchMeta::label)
                .orElse(branchCode);
        String userPrompt = """
                Generate a PROFESSIONAL and ACTIONABLE learning roadmap for: %s.
                Student Context: Current academic branch is %s (%s).
                
                REQUIREMENTS:
                1. Timeline: Break it down into clear weekly/monthly milestones (e.g., "Week 1-2", "Month 1").
                2. Tools: Recommend specific, industry-standard modern tools (e.g., VS Code, GitHub, Figma, specific libraries).
                3. Projects: Suggest 2-3 real-world practical projects with specific goals.
                4. Resources: Link to official documentation or top-tier learning platforms (e.g., MDN, Coursera, official sites).
                5. Stream Awareness: If the career doesn't match the stream, include "Bridge Steps" to help the transition.

                Return ONLY valid JSON (no markdown fences) with this exact shape:
                {"roadmap":[
                  {"step":"string (include timeline)","details":"string","tools":["string"],"projects":["string"],"resources":["string"]},
                  ...
                ]}
                Include 6-8 comprehensive steps from Beginner to Job-Ready.
                """.formatted(context.replace("\"", "'"), branchLabel, branchCode);

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", "You output only compact JSON objects. No prose outside JSON."),
                Map.of("role", "user", "content", userPrompt)
        );

        String raw = openAiService.chatCompletion(messages);
        raw = stripJsonFences(raw);
        JsonNode root = objectMapper.readTree(raw);
        JsonNode arr = root.path("roadmap");
        if (!arr.isArray() || arr.isEmpty()) {
            return List.of();
        }
        return parseRichSteps(arr);
    }

    private static String stripJsonFences(String raw) {
        String s = raw.trim();
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl > 0) {
                s = s.substring(nl + 1);
            }
            int end = s.lastIndexOf("```");
            if (end > 0) {
                s = s.substring(0, end);
            }
        }
        return s.trim();
    }
}
