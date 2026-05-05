package com.smartcareer.repository;

import com.smartcareer.entity.CareerResult;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
import java.util.Optional;
 
public interface CareerResultRepository extends JpaRepository<CareerResult, Long> {
    List<CareerResult> findByUser_IdOrderByCreatedAtDesc(Long userId);
    Optional<CareerResult> findFirstByUser_IdOrderByCreatedAtDesc(Long userId);
    Optional<CareerResult> findFirstByUser_IdAndAssessmentTypeOrderByCreatedAtDesc(Long userId, String assessmentType);
}
