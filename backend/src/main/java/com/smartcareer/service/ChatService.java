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
            You are CareerMatrix Assistant, a helpful and knowledgeable career coach.
            Your priority is to provide DIRECT and ACCURATE answers to the user's specific questions.
            Guidelines:
            1. Answer the specific question asked FIRST.
            2. Use a CLEAR and STRUCTURED format (bullet points, numbered lists, or bold headings) for every response.
            3. Provide direct and accurate technical information.
            4. After answering, you may BRIEFLY relate it to their career context if it adds value.
            5. Avoid unnecessary fluff or 'unknown matter' that isn't related to the user's question.
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
                System.err.println("Gemini failed, falling back to OpenAI: " + e.getMessage());
                // Fall through to OpenAI
            }
        }

        // 2. Try OpenAI Second (Real AI)
        if (openAiService.isConfigured()) {
            try {
                var messages = OpenAiService.buildMessages(systemPrompt, history, message);
                String reply = openAiService.chatCompletion(messages);
                return new ChatResponse(reply);
            } catch (Exception e) {
                System.err.println("OpenAI failed: " + e.getMessage());
                // Fall through to rule-based
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
        String smart = smartFallback(message);
        if (smart != null) return smart;

        return """
                I'm currently in **Offline Mode** because the AI services (Gemini/OpenAI) are temporarily busy or out of quota.
                
                I couldn't find a specific pre-programmed answer for: "%s".
                
                **What you can do:**
                1. Ask about common topics like **"diff between AI and ML"**, **"Food Technology"**, or **"Engineering branches"**.
                2. Check your API keys' billing/quota status.
                3. Try again in a few minutes.
                
                For Class 10 (Science Stream), focus on PCM (Physics, Chemistry, Math) for technical careers.""".formatted(message).stripIndent().trim();
    }

    private String ruleBasedAfter12(String message, String topDirection, List<String> interests) {
        String smart = smartFallback(message);
        if (smart != null) return smart;

        return """
                I'm currently in **Offline Mode** because the AI services (Gemini/OpenAI) are temporarily busy or out of quota.
                
                I couldn't find a specific pre-programmed answer for: "%s".
                
                **What you can do:**
                1. Ask about **"College selection"**, **"Entrance exams"**, or **"Job roles"**.
                2. Check your API keys' billing/quota status.
                3. Try again later.
                
                For After 12 guidance, I recommend focusing on Entrance Exam preparation for your target career.""".formatted(message).stripIndent().trim();
    }

    private String smartFallback(String message) {
        String m = message.toLowerCase(Locale.ROOT);
        if (m.matches(".*\\b(hi|hello|hey)\\b.*")) {
            return "Hello! I'm CareerMatrix Assistant. How can I help you with your career goals today?";
        }
        if (m.contains("full form") && m.contains("ai")) {
            return "The full form of AI is Artificial Intelligence.";
        }
        if (m.contains("rnn") || (m.contains("recurrent") && m.contains("neural"))) {
            return """
                    **Recurrent Neural Networks (RNN):**
                    RNNs are a class of neural networks designed for processing sequential data (like text, speech, or time-series).
                    
                    **Key Features:**
                    • **Internal Memory**: They maintain a "hidden state" that captures information from previous steps in the sequence.
                    • **Sequential Processing**: Unlike standard neural networks, RNNs process inputs one by one while keeping track of context.
                    • **Advanced Variants**: LSTMs (Long Short-Term Memory) and GRUs are used to handle long-term dependencies better than basic RNNs.""".stripIndent().trim();
        }
        if (m.contains("cnn") || (m.contains("convolutional") && m.contains("neural"))) {
            return """
                    **Convolutional Neural Networks (CNN):**
                    CNNs are specialized neural networks primarily used for image recognition and computer vision tasks.
                    
                    **Key Components:**
                    • **Convolutional Layers**: Use filters to detect patterns like edges, shapes, and textures.
                    • **Pooling Layers**: Reduce the spatial dimensions (downsampling) to make the model more efficient.
                    • **Fully Connected Layers**: Perform the final classification based on the detected features.""".stripIndent().trim();
        }
        if (m.contains("data science") || m.contains("what is data science")) {
            return """
                    **Data Science:**
                    Data Science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data.
                    
                    **Core Skills Needed:**
                    • **Programming**: Python or R.
                    • **Statistics**: Probability, hypothesis testing, and data distribution.
                    • **Tools**: SQL, Pandas, Scikit-learn, and Tableau/PowerBI for visualization.
                    • **Machine Learning**: Regression, classification, and clustering algorithms.""".stripIndent().trim();
        }
        if (m.contains("diff") && m.contains("ai") && (m.contains("ml") || m.contains("machine learning") || m.contains("dl") || m.contains("deep learning"))) {
            return """
                    **The AI Hierarchy:**
                    • **AI (Artificial Intelligence)**: The broad concept of machines acting "smart" or mimicking human intelligence.
                    • **ML (Machine Learning)**: A subset of AI where machines learn from data without being explicitly programmed.
                    • **DL (Deep Learning)**: A subset of ML using multi-layered neural networks (like brain neurons) to solve highly complex tasks like face ID or voice recognition.""".stripIndent().trim();
        }
        if (m.contains("who are you") || m.contains("what is your name")) {
            return "I am your CareerMatrix Assistant, here to help you navigate your education and career path.";
        }
        if (m.contains("career") && (m.contains("best") || m.contains("top"))) {
            return "The 'best' career depends on your interests. Currently, high-growth fields include Data Science, AI Engineering, Cyber Security, Renewable Energy, and Healthcare Technology. Tell me your favorite subjects for a better suggestion!";
        }
        if (m.contains("thank")) {
            return "You're welcome! Feel free to ask if you have more questions.";
        }
        if (m.contains("food technology") || (m.contains("food") && m.contains("tech"))) {
            return """
                    **Food Technology Overview:**
                    Food technology is the branch of food science that deals with the production, preservation, quality control, and research and development of food products.
                    
                    **Supply Chain in Food Tech:**
                    1. **Sourcing**: Obtaining raw ingredients from farmers.
                    2. **Processing**: Transforming raw materials into finished food products.
                    3. **Packaging**: Ensuring safety and shelf-life.
                    4. **Logistics**: Moving products at the right temperature (Cold Chain) to retailers.
                    
                    It is a great field if you are interested in Science and Engineering applied to the food industry!""".stripIndent().trim();
        }
        if (m.contains("pasteurization") || m.contains("pasturization")) {
            return """
                    **Pasteurization:**
                    Pasteurization is a heat-treatment process that destroys pathogenic microorganisms in certain foods and beverages (like milk and juice).
                    
                    **Key Facts:**
                    • Developed by **Louis Pasteur** in the 1860s.
                    • It involves heating the liquid to a specific temperature for a set time and then cooling it immediately.
                    • It makes food safer to consume and extends its shelf life without significantly changing the taste.""".stripIndent().trim();
        }
        if (m.contains("precision agriculture") || (m.contains("agri") && m.contains("tech"))) {
            return """
                    **Precision Agriculture:**
                    Precision agriculture uses technology (GPS, sensors, drones) to ensure that crops and soil receive exactly what they need for optimum health and productivity.
                    
                    **Benefits:**
                    • Optimized resource use (water, fertilizer).
                    • Reduced environmental impact.
                    • Higher crop yields and quality.""".stripIndent().trim();
        }
        if (m.contains("hydroponics")) {
            return """
                    **Hydroponics:**
                    Hydroponics is a method of growing plants without soil, using mineral nutrient solutions in a water solvent.
                    
                    **Advantages:**
                    • Faster growth than soil-based farming.
                    • Can be done indoors or in limited space.
                    • Uses significantly less water.""".stripIndent().trim();
        }
        return null;
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
        String smart = smartFallback(raw);
        if (smart != null) return smart;

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
