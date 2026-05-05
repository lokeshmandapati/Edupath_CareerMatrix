package com.smartcareer.controller;

import com.smartcareer.service.CollegeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class CollegeController {

    private final CollegeService collegeService;

    public CollegeController(CollegeService collegeService) {
        this.collegeService = collegeService;
    }

    @GetMapping("/api/colleges/after12")
    public List<CollegeService.CollegeItem> after12TopColleges(
            @RequestParam(name = "course") String courseKey,
            @RequestParam(name = "city", required = false) String city,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "category", required = false) String category
    ) {
        collegeService.ensureSeeded(courseKey);
        return collegeService.top10ForCourse(courseKey, city, state, category);
    }
}

