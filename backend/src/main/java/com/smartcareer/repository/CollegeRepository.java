package com.smartcareer.repository;

import com.smartcareer.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
 
public interface CollegeRepository extends JpaRepository<College, Long> {
    List<College> findTop10ByCourseKeyOrderByRankOrderAsc(String courseKey);
    List<College> findTop10ByCourseKeyAndCityIgnoreCaseOrderByRankOrderAsc(String courseKey, String city);
    List<College> findTop10ByCourseKeyAndStateIgnoreCaseOrderByRankOrderAsc(String courseKey, String state);
    long countByCourseKey(String courseKey);
}

