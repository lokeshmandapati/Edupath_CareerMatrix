package com.smartcareer.entity;

import jakarta.persistence.*;
import java.time.Instant;
 
/**
 * Prediction output: JSON map of career name → score, plus top pick and explanation.
 */
@Entity
@Table(name = "results")
public class CareerResult {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
 
    /** JSON object: { "Software Engineering": 72.5, ... } */
    @Column(name = "career_scores", columnDefinition = "TEXT")
    private String careerScoresJson;
 
    @Column(name = "top_career")
    private String topCareer;
 
    @Column(columnDefinition = "TEXT")
    private String explanation;
 
    /** JSON: confidencePercent, skillMatchBreakdown, interestMatchBreakdown */
    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;
 
    @Column(name = "assessment_type")
    private String assessmentType = "ENGINEERING";
 
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public CareerResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCareerScoresJson() { return careerScoresJson; }
    public void setCareerScoresJson(String careerScoresJson) { this.careerScoresJson = careerScoresJson; }
    public String getTopCareer() { return topCareer; }
    public void setTopCareer(String topCareer) { this.topCareer = topCareer; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getMetadataJson() { return metadataJson; }
    public void setMetadataJson(String metadataJson) { this.metadataJson = metadataJson; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
