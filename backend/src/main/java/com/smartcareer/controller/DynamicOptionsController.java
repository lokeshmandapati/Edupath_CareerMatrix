package com.smartcareer.controller;

import com.smartcareer.dto.DynamicOptionsResponse;
import com.smartcareer.service.DynamicOptionsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/options")
public class DynamicOptionsController {

    private final DynamicOptionsService dynamicOptionsService;

    public DynamicOptionsController(DynamicOptionsService dynamicOptionsService) {
        this.dynamicOptionsService = dynamicOptionsService;
    }

    @GetMapping("/dynamic")
    public ResponseEntity<DynamicOptionsResponse> getDynamicOptions(@RequestParam String stream) {
        if (stream == null || stream.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        DynamicOptionsResponse response = dynamicOptionsService.generateOptionsForStream(stream);
        return ResponseEntity.ok(response);
    }
}
