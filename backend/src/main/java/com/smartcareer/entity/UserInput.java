package com.smartcareer.entity;

import jakarta.persistence.*;
import java.time.Instant;
 
/**
 * Stores one career-assessment form submission per user (latest can be overwritten or we keep history — we append new rows for history).
 */
@Entity
@Table(name = "user_inputs")
public class UserInput {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
 
    /** CGPA on scale 0–10 or percentage normalized by frontend */
    private Double cgpa;
 
    /** Comma-separated or JSON list of technical skills */
    @Column(name = "technical_skills", columnDefinition = "TEXT")
    private String technicalSkills;
 
    @Column(columnDefinition = "TEXT")
    private String interests;
 
    /** Beginner / Intermediate / Advanced */
    @Column(name = "project_experience")
    private String projectExperience;
 
    @Column(columnDefinition = "TEXT")
    private String certifications;
 
    @Column(name = "preferred_work_type")
    private String preferredWorkType;
 
    private String branch;
 
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public UserInput() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public String getTechnicalSkills() { return technicalSkills; }
    public void setTechnicalSkills(String technicalSkills) { this.technicalSkills = technicalSkills; }
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    public String getProjectExperience() { return projectExperience; }
    public void setProjectExperience(String projectExperience) { this.projectExperience = projectExperience; }
    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }
    public String getPreferredWorkType() { return preferredWorkType; }
    public void setPreferredWorkType(String preferredWorkType) { this.preferredWorkType = preferredWorkType; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
