package com.smartcareer.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "colleges", indexes = {
    @Index(name = "idx_college_course_rank", columnList = "courseKey, rankOrder"),
    @Index(name = "idx_college_course_city", columnList = "courseKey, city"),
    @Index(name = "idx_college_course_state", columnList = "courseKey, state")
})
public class College {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "course_key")
    private String courseKey;

    private String name;

    private String location;

    private String city;

    private String state;

    private String website;

    private String cutoffGeneral;

    private String cutoffObc;

    private String cutoffScst;

    private Integer rankOrder;

    protected College() {}

    public College(
            String courseKey,
            String name,
            String location,
            String city,
            String state,
            String website,
            String cutoffGeneral,
            String cutoffObc,
            String cutoffScst,
            Integer rankOrder
    ) {
        this.courseKey = courseKey;
        this.name = name;
        this.location = location;
        this.city = city;
        this.state = state;
        this.website = website;
        this.cutoffGeneral = cutoffGeneral;
        this.cutoffObc = cutoffObc;
        this.cutoffScst = cutoffScst;
        this.rankOrder = rankOrder;
    }

    public Long getId() {
        return id;
    }

    public String getCourseKey() {
        return courseKey;
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getWebsite() {
        return website;
    }

    public String getCutoffGeneral() {
        return cutoffGeneral;
    }

    public String getCutoffObc() {
        return cutoffObc;
    }

    public String getCutoffScst() {
        return cutoffScst;
    }

    public Integer getRankOrder() {
        return rankOrder;
    }
}

