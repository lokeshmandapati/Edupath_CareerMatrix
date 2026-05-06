package com.smartcareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcareer.dto.DynamicOptionsResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DynamicOptionsService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    // Expert-curated fallback data for all major branches
    private static final Map<String, DynamicOptionsResponse> BRANCH_DATA = Map.ofEntries(
        Map.entry("CSE",  new DynamicOptionsResponse(
            List.of("Data Structures & Algorithms", "Full Stack Development", "Machine Learning", "Cloud Computing", "Database Management", "System Design", "Cybersecurity", "API Development"),
            List.of("Artificial Intelligence", "Open Source Contribution", "Competitive Programming", "App Development", "Cybersecurity Research", "Blockchain", "Virtual Reality", "Tech Startups")
        )),
        Map.entry("IT", new DynamicOptionsResponse(
            List.of("Network Administration", "Cloud Infrastructure", "Cybersecurity", "Database Administration", "IT Service Management", "Python Scripting", "System Monitoring", "DevOps"),
            List.of("Digital Transformation", "Cyber Forensics", "E-commerce", "Network Security", "Cloud Strategy", "Automation", "Big Data", "IT Management")
        )),
        Map.entry("ECE", new DynamicOptionsResponse(
            List.of("Embedded Systems", "VLSI Design", "Digital Signal Processing", "Microcontrollers (Arduino/Raspberry Pi)", "Internet of Things (IoT)", "Circuit Design", "PCB Design", "Signal Processing"),
            List.of("Robotics", "Wireless Communication", "Semiconductor Technology", "Smart Home Tech", "Drone Development", "Satellite Communication", "Automation", "Hardware Innovation")
        )),
        Map.entry("EE", new DynamicOptionsResponse(
            List.of("Power Systems Analysis", "Control Systems", "Electrical Machines", "Smart Grids", "Renewable Energy Systems", "PLC/SCADA Programming", "Analog Electronics", "High Voltage Engineering"),
            List.of("Electric Vehicles", "Green Energy", "Industrial Automation", "Robotics", "Energy Auditing", "Power Infrastructure", "Smart Meters", "Solar Technology")
        )),
        Map.entry("ME", new DynamicOptionsResponse(
            List.of("Thermodynamics", "Solid Mechanics & FEA", "CAD/CAM (SolidWorks/CATIA)", "Robotics & Automation", "Fluid Dynamics", "Manufacturing Processes", "Automobile Engineering", "CNC Programming"),
            List.of("Automotive Design", "3D Printing & Rapid Prototyping", "Aerospace Engineering", "Robotics", "Sustainable Manufacturing", "Product Innovation", "Industrial Machinery", "Formula Racing")
        )),
        Map.entry("CE", new DynamicOptionsResponse(
            List.of("Structural Analysis & Design", "Geotechnical Engineering", "Transportation Engineering", "Surveying & GIS", "Construction Project Management", "AutoCAD/Revit/STAAD.Pro", "Environmental Engineering", "Hydrology & Water Resources"),
            List.of("Urban Planning & Smart Cities", "Sustainable Architecture", "Bridge & Tunnel Design", "Environmental Protection", "Infrastructure Development", "Earthquake Engineering", "Public Works", "Real Estate Development")
        )),
        Map.entry("MBBS", new DynamicOptionsResponse(
            List.of("Clinical Diagnosis", "Anatomy & Physiology", "Pharmacology", "Surgery Techniques", "Patient Care & Communication", "Medical Research", "Radiology Basics", "Emergency Medicine"),
            List.of("Surgery", "Neurology", "Cardiology", "Medical Research", "Public Health", "Global Health Initiatives", "Telemedicine", "Oncology")
        )),
        Map.entry("BDS", new DynamicOptionsResponse(
            List.of("Oral Surgery", "Dental Radiology", "Prosthodontics", "Orthodontics", "Periodontics", "Dental Materials Science", "Endodontics", "Oral Pathology"),
            List.of("Cosmetic Dentistry", "Dental Research", "Oral Healthcare Advocacy", "Dental Implants", "Community Oral Health", "Pediatric Dentistry", "Sports Dentistry", "Orthodontics")
        )),
        Map.entry("PHARMA", new DynamicOptionsResponse(
            List.of("Drug Chemistry & Pharmacognosy", "Pharmaceutics", "Clinical Pharmacy", "Quality Control & Assurance", "Drug Regulatory Affairs", "Pharmacokinetics", "Medicinal Chemistry", "Biotechnology"),
            List.of("Drug Discovery", "Clinical Trials", "Pharmaceutical Manufacturing", "Herbal Medicine", "Healthcare Policy", "Biotechnology Startups", "Medical Writing", "Patient Safety")
        )),
        Map.entry("CA", new DynamicOptionsResponse(
            List.of("Financial Accounting & Reporting", "Auditing & Assurance", "Taxation (Direct & Indirect)", "Corporate Law & Governance", "Financial Modeling", "Cost Accounting", "Management Accounting", "IFRS Standards"),
            List.of("Stock Markets & Investment", "Entrepreneurship", "Financial Planning", "Mergers & Acquisitions", "Tax Strategy", "Corporate Governance", "Risk Management", "Startup Finance")
        )),
        Map.entry("BCOM", new DynamicOptionsResponse(
            List.of("Business Accounting", "Economics", "Marketing Management", "Human Resource Management", "Business Statistics", "E-Commerce", "Business Law", "Financial Markets"),
            List.of("Entrepreneurship", "Digital Marketing", "Stock Markets", "Business Strategy", "International Trade", "Retail Management", "Financial Planning", "Corporate Culture")
        )),
        Map.entry("BBA", new DynamicOptionsResponse(
            List.of("Organizational Behavior", "Marketing Strategy", "Business Analytics", "Operations Management", "Entrepreneurship", "Supply Chain Management", "Leadership & Communication", "Project Management"),
            List.of("Startup Building", "Brand Management", "Consulting", "International Business", "Social Entrepreneurship", "Digital Marketing", "Corporate Leadership", "Innovation Management")
        )),
        Map.entry("LAW_ARTS", new DynamicOptionsResponse(
            List.of("Constitutional Law", "Legal Research & Writing", "Criminal Law", "Contract Law", "Corporate Law", "Moot Court Advocacy", "Human Rights Law", "Intellectual Property"),
            List.of("Human Rights Advocacy", "Corporate Law", "Public Policy", "Social Justice", "Legal Aid", "International Law", "Environmental Law", "Judicial Services")
        )),
        Map.entry("DESIGN_ARTS", new DynamicOptionsResponse(
            List.of("Visual Design Principles", "Adobe Creative Suite", "UI/UX Design", "Typography", "Illustration & Painting", "Graphic Design", "Photography", "Art History & Theory"),
            List.of("UI/UX Innovation", "Film & Animation", "Brand Identity Design", "Fashion Design", "Concept Art", "Digital Art", "Exhibition Curation", "Art Direction")
        )),
        Map.entry("PSYCH", new DynamicOptionsResponse(
            List.of("Counseling Techniques", "Cognitive Psychology", "Research Methods & Statistics", "Developmental Psychology", "Behavioral Analysis", "Clinical Assessment", "Neuropsychology", "Social Psychology"),
            List.of("Mental Health Advocacy", "Child Psychology", "Organizational Behavior", "Therapy & Counseling", "Neuroscience Research", "Educational Psychology", "Social Work", "Positive Psychology")
        ))
    );

    public DynamicOptionsService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public DynamicOptionsResponse generateOptionsForStream(String stream) {
        if (stream == null || stream.isBlank()) {
            return getGenericOptions();
        }

        // Step 1: Try AI first (primary source)
        if (geminiService.isConfigured()) {
            try {
                DynamicOptionsResponse result = callGeminiForStream(stream);
                if (result != null) return result;
            } catch (Exception e) {
                System.err.println("Gemini failed for stream '" + stream + "': " + e.getMessage());
            }
        }

        // Step 2: Use expert fallback database
        String upper = stream.trim().toUpperCase(Locale.ROOT);
        if (BRANCH_DATA.containsKey(upper)) {
            return BRANCH_DATA.get(upper);
        }

        // Step 3: Fuzzy match for custom streams
        String lower = stream.trim().toLowerCase(Locale.ROOT);
        if (lower.contains("computer") || lower.contains("cse") || lower.contains("software")) return BRANCH_DATA.get("CSE");
        if (lower.contains("information tech") || lower.equals("it")) return BRANCH_DATA.get("IT");
        if (lower.contains("electron") || lower.contains("ece") || lower.contains("communicat")) return BRANCH_DATA.get("ECE");
        if (lower.contains("electrical") || lower.equals("ee") || lower.equals("eee")) return BRANCH_DATA.get("EE");
        if (lower.contains("mechanic") || lower.equals("me")) return BRANCH_DATA.get("ME");
        if (lower.contains("civil") || lower.equals("ce")) return BRANCH_DATA.get("CE");
        if (lower.contains("aeronat") || lower.contains("aerospace") || lower.contains("aviation")) return new DynamicOptionsResponse(
            List.of("Aerodynamics", "Flight Mechanics", "Avionics Systems", "Propulsion Engineering", "Aircraft Structural Design", "MATLAB/Simulink", "Composite Materials", "CFD Analysis"),
            List.of("Aircraft Design", "Space Exploration", "Drone Technology", "Model Rocketry", "Aviation Safety", "Satellite Systems", "Defense Tech", "Fluid Dynamics Research")
        );
        if (lower.contains("petrol") || lower.contains("oil") || lower.contains("gas")) return new DynamicOptionsResponse(
            List.of("Drilling Engineering", "Reservoir Modeling", "Petrophysics", "Well Logging", "Geology", "HSE Management", "Production Engineering", "Chemical Analysis"),
            List.of("Energy Industry", "Environmental Protection", "Ocean Engineering", "Industrial Safety", "Global Energy Policy", "Sustainability", "Geoscience Research", "Refinery Operations")
        );
        if (lower.contains("biotech") || lower.contains("biomed")) return new DynamicOptionsResponse(
            List.of("Molecular Biology", "Bioinformatics", "Genetic Engineering", "Cell Culture Techniques", "CRISPR/Cas9", "Bioprocess Engineering", "Biomedical Instrumentation", "Clinical Research"),
            List.of("Genetic Research", "Healthcare Innovation", "Disease Prevention", "Pharmaceutical Development", "Lab Research", "Ethical Biotech", "Cancer Research", "Regenerative Medicine")
        );
        if (lower.contains("food") && (lower.contains("tech") || lower.contains("eng"))) return new DynamicOptionsResponse(
            List.of("Food Microbiology", "Packaging Technology", "HACCP & Food Safety", "Food Chemistry", "Process Engineering", "Sensory Evaluation", "Nutrition Science", "Quality Assurance"),
            List.of("Product Innovation", "Sustainable Food Systems", "Culinary Science", "Public Health Nutrition", "Organic Farming", "Food Biotechnology", "Global Food Security", "Functional Foods")
        );
        if (lower.contains("agri") || lower.contains("agriculture")) return new DynamicOptionsResponse(
            List.of("Soil Science", "Irrigation Engineering", "Crop Protection", "Farm Machinery & Automation", "Precision Agriculture", "Horticulture", "Plant Breeding & Genetics", "Post-Harvest Management"),
            List.of("Sustainable Farming", "Organic Agriculture", "Rural Development", "Climate-Smart Farming", "Agri-Biotechnology", "Water Conservation", "Animal Husbandry", "Food Security")
        );
        if (lower.contains("pharma") || lower.contains("pharmacy")) return BRANCH_DATA.get("PHARMA");
        if (lower.contains("law") || lower.contains("legal")) return BRANCH_DATA.get("LAW_ARTS");
        if (lower.contains("design") || lower.contains("arts") || lower.contains("fine art")) return BRANCH_DATA.get("DESIGN_ARTS");
        if (lower.contains("psych")) return BRANCH_DATA.get("PSYCH");
        if (lower.contains("mbbs") || lower.contains("medic") || lower.contains("doctor")) return BRANCH_DATA.get("MBBS");
        if (lower.contains("account") || lower.contains("commerce") || lower.contains("bcom")) return BRANCH_DATA.get("BCOM");
        if (lower.contains("manage") || lower.contains("bba") || lower.contains("mba")) return BRANCH_DATA.get("BBA");
        if (lower.contains("ca") || lower.contains("chartered")) return BRANCH_DATA.get("CA");

        return getGenericOptions();
    }

    private DynamicOptionsResponse callGeminiForStream(String stream) {
        String prompt = "The student selected the academic branch/stream: \"" + stream + "\".\n" +
            "List exactly 8 specific technical skills and 8 specific professional interests for this field.\n" +
            "Return ONLY this JSON, no other text:\n" +
            "{\"skills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\",\"skill5\",\"skill6\",\"skill7\",\"skill8\"]," +
            "\"interests\":[\"interest1\",\"interest2\",\"interest3\",\"interest4\",\"interest5\",\"interest6\",\"interest7\",\"interest8\"]}";

        String raw = geminiService.chatCompletion(
            "You are a career expert. Respond ONLY with the requested JSON object. No markdown, no explanation.",
            List.of(),
            prompt
        );

        // Aggressive JSON extraction
        String cleaned = raw.trim();
        // Remove markdown fences
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("```[a-z]*\\n?", "").replaceAll("```", "").trim();
        }
        // Extract JSON object
        int start = cleaned.indexOf("{");
        int end = cleaned.lastIndexOf("}");
        if (start >= 0 && end > start) {
            cleaned = cleaned.substring(start, end + 1);
        }

        try {
            JsonNode root = objectMapper.readTree(cleaned);
            List<String> skills = parseStringArray(root.path("skills"));
            List<String> interests = parseStringArray(root.path("interests"));

            if (skills.size() >= 4 && interests.size() >= 4) {
                System.out.println("AI successfully generated options for '" + stream + "': " + skills.size() + " skills, " + interests.size() + " interests");
                return new DynamicOptionsResponse(skills, interests);
            }
        } catch (Exception e) {
            System.err.println("JSON parse failed for AI response: " + e.getMessage());
            System.err.println("Raw AI response was: " + raw.substring(0, Math.min(200, raw.length())));
        }
        return null;
    }

    private DynamicOptionsResponse getGenericOptions() {
        return new DynamicOptionsResponse(
            List.of("Professional Communication", "Project Management", "Critical Thinking", "Problem Solving", "Data Analysis", "Research Methods", "Leadership", "Technical Writing"),
            List.of("Industry Innovation", "Career Growth", "Technology Trends", "Entrepreneurship", "Networking", "Mentorship", "Skill Development", "Social Impact")
        );
    }

    private List<String> parseStringArray(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode n : node) {
                String val = n.asText("").trim();
                if (!val.isEmpty()) list.add(val);
            }
        }
        return list;
    }
}
