package com.smartcareer.repository;

import com.smartcareer.entity.UserInput;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
 
public interface UserInputRepository extends JpaRepository<UserInput, Long> {
    List<UserInput> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
