package com.smartcareer.service;

import com.smartcareer.dto.ChatRequest;
import com.smartcareer.dto.ChatResponse;
import com.smartcareer.dto.ChatTurnDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Career guidance chat: branch-aware system prompt + rules; OpenAI when configured.
 */
@Service
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            You are CareerMatrix Assistant, a concise and practical career coach.
            You support 3 contexts:
            - ENGINEERING: engineering students (skills, tech, roles, resumes, roadmaps).
            - CLASS10: class 10 students choosing a stream (Science/Commerce/Humanities).
            - AFTER12: students deciding next steps after class 12 (entrances, degrees, shortlisting).
            Keep answers structured and actionable. Do not invent credentials or guarantees.
            If the user asks something unrelated to careers or learning, politely steer back.
            """;

    private final GeminiService geminiService;
    private final OpenAiService openAiService;
    private final BranchCareerMappingService branchCareerMappingService;

    public ChatService(GeminiService geminiService, OpenAiService openAiService, BranchCareerMappingService branchCareerMappingService) {
        this.geminiService = geminiService;
        this.openAiService = openAiService;
        this.branchCareerMappingService = branchCareerMappingService;
    }

    public ChatResponse chat(ChatRequest request) {
        String message = request.message().trim();
        List<ChatTurnDto> history = trimHistory(request.history(), 12);

        String type = request.assessmentType() == null ? "ENGINEERING" : request.assessmentType().trim().toUpperCase(Locale.ROOT);
        Optional<BranchCareerMappingService.BranchMeta> branchOpt = branchCareerMappingService.findBranch(request.branch());
        
        String augmentation = branchCareerMappingService.buildChatSystemAugmentation(
                branchOpt.orElse(null),
                request.skills(),
                request.interests()
        );
        String topNote = request.topCareer() != null && !request.topCareer().isBlank()
                ? "User context: " + type + ". Latest assessment top career/stream: " + request.topCareer().trim() + ".\n"
                : "User context: " + type + ".\n";
        String systemPrompt = SYSTEM_PROMPT + "\n\n" + topNote + augmentation;

        // 1. Try Gemini First (Real AI)
        if (geminiService.isConfigured()) {
            try {
                String reply = geminiService.chatCompletion(systemPrompt, history, message);
                return new ChatResponse(reply);
            } catch (Exception e) {
                e.printStackTrace();
                return new ChatResponse("⚠️ Gemini Error: " + e.getMessage());
            }
        }

        // 2. Try OpenAI Second (Real AI)
        if (openAiService.isConfigured()) {
            try {
                var messages = OpenAiService.buildMessages(systemPrompt, history, message);
                String reply = openAiService.chatCompletion(messages);
                return new ChatResponse(reply);
            } catch (Exception e) {
                e.printStackTrace();
                return new ChatResponse("⚠️ OpenAI Error: " + e.getMessage());
            }
        }

        // 3. Fallback to Rule-Based if AI is down
        if ("CLASS10".equals(type)) {
            return new ChatResponse(ruleBasedClass10(message, request.topCareer(), request.interests()));
        }
        if ("AFTER12".equals(type)) {
            return new ChatResponse(ruleBasedAfter12(message, request.topCareer(), request.interests()));
        }

        return new ChatResponse(ruleBasedReply(message, branchOpt, request.skills(), request.interests()));
    }

    private String ruleBasedClass10(String message, String topStream, List<String> interests) {
        String stream = (topStream == null || topStream.isBlank()) ? "your stream options" : topStream.trim();
        String base = """
                Class 10 guidance (stream selection):
                - Focus on fundamentals + consistency.
                - Choose a stream that matches strengths and interest, not only trends.
                - Keep doors open with optional subjects where possible.
                """.stripIndent().trim();
        String interestLine = (interests != null && !interests.isEmpty())
                ? "You mentioned interests like: " + String.join(", ", interests.subList(0, Math.min(6, interests.size()))) + ".\n"
                : "";
        String q = message.toLowerCase(Locale.ROOT);
        if (q.contains("science")) {
            return interestLine + "For Science: focus on Math + Science basics, daily problem practice, and strong revision.\n"
                    + "Recommended: Mathematics, Physics, Chemistry, Biology/CS.\n"
                    + "Next: Explore PCM vs PCB based on comfort with math vs bio.\n\n" + base;
        }
        if (q.contains("commerce")) {
            return interestLine + "For Commerce: build Accountancy basics, improve quantitative aptitude, and strengthen communication.\n"
                    + "Recommended: Accountancy, Business Studies, Economics, Math (optional).\n"
                    + "Next: Explore CA/CS vs B.Com/BBA early.\n\n" + base;
        }
        if (q.contains("humanities") || q.contains("arts")) {
            return interestLine + "For Humanities: strengthen reading/writing, current affairs, and analytical thinking.\n"
                    + "Recommended: History, Political Science, Psychology/Sociology, English.\n"
                    + "Next: Explore law, design, journalism, psychology, civil services.\n\n" + base;
        }
        return interestLine + "Your current best-fit stream (from assessment): " + stream + ".\n"
                + "Tell me your marks in Math/Science/English/Social and what you enjoy, and I’ll suggest a weekly plan + subject combo.";
    }

    private String ruleBasedAfter12(String message, String topDirection, List<String> interests) {
        String dir = (topDirection == null || topDirection.isBlank()) ? "your top direction" : topDirection.trim();
        String interestLine = (interests != null && !interests.isEmpty())
                ? "Your interests: " + String.join(", ", interests.subList(0, Math.min(6, interests.size()))) + ".\n"
                : "";
        String q = message.toLowerCase(Locale.ROOT);
        if (q.contains("jee")) {
            return interestLine + "JEE plan: NCERT + strong problem practice + PYQs + mocks.\n"
                    + "Weekly: 5 days practice, 1 day revision, 1 day mock + analysis.\n"
                    + "If your target is " + dir + ", shortlist exams + colleges early.";
        }
        if (q.contains("neet")) {
            return interestLine + "NEET plan: NCERT is priority (Bio/Chem), then PYQs + mocks.\n"
                    + "Weekly: daily Biology revision + 2 mocks/week near the exam.\n"
                    + "If your target is " + dir + ", confirm eligibility and attempt strategy.";
        }
        if (q.contains("clat") || q.contains("law")) {
            return interestLine + "Law path (CLAT/AILET): reading + reasoning + GK/current affairs.\n"
                    + "Daily: editorial reading + 30–45 mins reasoning practice.\n"
                    + "Also build writing + debate skills.";
        }
        return interestLine + "Your current best-fit direction (from assessment): " + dir + ".\n"
                + "Ask me: entrances for this path, an 8-week plan, or how to shortlist colleges based on budget and goals.";
    }

    private static List<ChatTurnDto> trimHistory(List<ChatTurnDto> history, int maxTurns) {
        if (history == null || history.isEmpty()) {
            return List.of();
        }
        int from = Math.max(0, history.size() - maxTurns);
        return new ArrayList<>(history.subList(from, history.size()));
    }

    private String ruleBasedReply(
            String raw,
            Optional<BranchCareerMappingService.BranchMeta> branch,
            List<String> skills,
            List<String> interests
    ) {
        String m = raw.toLowerCase(Locale.ROOT);
        m = Pattern.compile("\\s+").matcher(m).replaceAll(" ").trim();

        if (m.isEmpty()) {
            return branch.map(b -> "Ask me anything about careers and skills for " + b.label() + " — or your resume and learning plan.")
                    .orElse("Ask me anything about careers, skills, tech stacks, resumes, or learning resources.");
        }

        if (branch.isPresent()) {
            String code = branch.get().code();
            if (containsAny(m, "skill", "learn", "what should i", "technologies", "tools", "stack")) {
                return branchSkillGuidance(code, branch.get(), skills);
            }
            if (containsAny(m, "career", "job", "role", "path")) {
                return branchCareerGuidance(branch.get());
            }
        }

        if (containsAny(m, "resume", "cv", "cover letter")) {
            return """
                    Resume tips:
                    • Use clear section headers (Summary, Skills, Experience, Education, Projects).
                    • Quantify impact: metrics, scale, savings—stay truthful.
                    • Match keywords to the job description (skills/tools) for ATS without stuffing.
                    • One page for early career; link GitHub/portfolio for projects.
                    • Proofread; peer review for clarity."""
                    .stripIndent().trim();
        }

        if (containsAny(m, "data scientist", "data science", "machine learning engineer", "ml engineer")) {
            return """
                    Data / ML direction:
                    • Core: Python, SQL, probability, experimentation mindset.
                    • ML: scikit-learn pipelines, evaluation, leakage avoidance; scale to deep learning if needed.
                    • Practice: end-to-end notebooks + README; Kaggle for discipline.
                    • Comms: clear charts and stakeholder-ready takeaways."""
                    .stripIndent().trim();
        }

        if (containsAny(m, "software engineer", "backend", "frontend", "full stack")) {
            return """
                    Software path:
                    • One language deeply + DSA patterns; build APIs and tests.
                    • Ship projects with CI, reviews, and readable READMEs.
                    • Learn system design incrementally (databases, caching, reliability)."""
                    .stripIndent().trim();
        }

        if (containsAny(m, "cyber", "security", "pentest", "soc")) {
            return """
                    Security:
                    • Foundations: networking, Linux, scripting.
                    • Practice ethically: labs, CTFs, OWASP; never test without permission.
                    • Align certs to your target (e.g. Security+ / cloud security)."""
                    .stripIndent().trim();
        }

        if (containsAny(m, "cloud", "aws", "azure", "gcp", "kubernetes", "terraform", "devops")) {
            return """
                    Cloud / DevOps:
                    • Pick one cloud: IAM, networking, compute, storage, observability.
                    • IaC + containers; build CI/CD for a real service.
                    • Automate safely: secrets, least privilege, cost alerts."""
                    .stripIndent().trim();
        }

        if (containsAny(m, "interview", "leetcode", "salary", "offer")) {
            return """
                    Interviews:
                    • Technical: communicate approach, test edge cases, analyze complexity.
                    • Behavioral: STAR stories grounded in projects.
                    • Ask about team, stack, on-call, growth."""
                    .stripIndent().trim();
        }

        return branch
                .map(b -> "I’m tuned for " + b.label() + ". Ask about skills to learn, careers in your branch, tools, or your resume—or say “suggest careers” for branch-specific roles.")
                .orElse("""
                        I can help with career paths, skills, technologies, resumes, and resources.
                        Tell me your engineering branch for more targeted advice.""")
                .stripIndent().trim();
    }

    private String branchSkillGuidance(String code, BranchCareerMappingService.BranchMeta meta, List<String> skills) {
        String skillLine = (skills != null && !skills.isEmpty())
                ? "You mentioned: " + String.join(", ", skills.subList(0, Math.min(8, skills.size()))) + ".\n"
                : "";
        String uc = code.toUpperCase(Locale.ROOT);
        if ("CSE".equals(uc) || "IT".equals(uc)) {
            return skillLine + """
                    Computing focus:
                    • Core: DSA + one language (Java/Python/JS); Git fluency.
                    • Track: backend (APIs, DB), frontend (React), cloud (IAM, containers), or security basics.
                    • Projects: production-ish repo with tests and README—not only tutorials."""
                    .stripIndent().trim();
        }
        return switch (uc) {
            case "ME" -> skillLine + """
                    Mechanical focus:
                    • CAD: SolidWorks/Fusion—sketch constraints, assemblies, drawings (GD&T intro).
                    • Analysis: statics, materials selection; intro FEA (ANSYS/SW Simulation).
                    • Manufacturing: tolerances, machining basics, design for assembly.
                    • Projects: design a bracket/assembly with drawings + simple FEA report."""
                    .stripIndent().trim();
            case "CE" -> skillLine + """
                    Civil focus:
                    • Drafting: AutoCAD; learn local building codes at overview level.
                    • Analysis: structural basics—loads, beams; intro ETABS/STAAD workflows.
                    • Site: surveying concepts, safety on site visits.
                    • Projects: small structural model + BOQ-style quantity takeoff exercise."""
                    .stripIndent().trim();
            case "EE" -> skillLine + """
                    Electrical focus:
                    • Circuits & machines fundamentals; MATLAB/Simulink for models.
                    • Power: load flow/protection concepts at intro level; ETAP awareness.
                    • Hands-on: breadboard projects, safety first; read datasheets.
                    • Projects: motor control or small power electronics lab with documentation."""
                    .stripIndent().trim();
            case "ECE" -> skillLine + """
                    ECE focus:
                    • Embedded C, MCU peripherals, debugging with scope/logic analyzer.
                    • Signals: DSP basics; VLSI/Verilog intro if targeting silicon.
                    • IoT: MQTT, sensors, edge-to-cloud security basics.
                    • Projects: UART/I2C sensor node + firmware tests."""
                    .stripIndent().trim();
            case "CHE" -> skillLine + """
                    Chemical / process focus:
                    • Balances: mass & energy; unit operations (heat exchangers, distillation).
                    • Tools: Excel/MATLAB; Aspen/HYSYS tutorials when ready.
                    • Safety: HAZOP mindset; P&ID literacy.
                    • Projects: simulate a small process block with assumptions documented."""
                    .stripIndent().trim();
            case "BT" -> skillLine + """
                    Biotechnology focus:
                    • Bioinformatics: Python/R, Bioconductor, stats for genomics.
                    • Lab literacy: assays, QC, reproducibility; GLP awareness.
                    • Projects: public dataset pipeline (QC → alignment → summary figures)."""
                    .stripIndent().trim();
            case "AE" -> skillLine + """
                    Aerospace focus:
                    • Math/physics: dynamics, fluids intro; MATLAB for simulation.
                    • CAD/CAE: CAD parts; FEM intro for structures.
                    • Systems: requirements traceability mindset; safety culture.
                    • Projects: simple structural FEM + hand-check assumptions."""
                    .stripIndent().trim();
            case "MTR" -> skillLine + """
                    Mechatronics focus:
                    • PLC ladder basics, sensors/actuators, PID tuning.
                    • Embedded + mechanical integration; industrial communication basics.
                    • Projects: PID temperature control or small automated cell mock."""
                    .stripIndent().trim();
            default -> skillLine + "Explore fundamentals for " + meta.label()
                    + ", then align projects with job descriptions you target.";
        };
    }

    private String branchCareerGuidance(BranchCareerMappingService.BranchMeta meta) {
        List<String> careers = branchCareerMappingService.careersForBranch(meta.code());
        String list = careers.isEmpty()
                ? "Explore roles aligned with your coursework and internships."
                : String.join(", ", careers.subList(0, Math.min(12, careers.size())));
        return "For " + meta.label() + ", strong starting roles include: " + list
                + ". Pick 1–2 target titles, read 10 JDs, and map skills you already have vs gaps.";
    }

    private static boolean containsAny(String m, String... keywords) {
        for (String k : keywords) {
            if (m.contains(k)) {
                return true;
            }
        }
        return false;
    }
}
