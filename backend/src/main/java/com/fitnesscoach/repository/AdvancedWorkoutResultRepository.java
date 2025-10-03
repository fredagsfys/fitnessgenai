package com.fitnesscoach.repository;

import com.fitnesscoach.model.AdvancedWorkoutResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AdvancedWorkoutResultRepository extends JpaRepository<AdvancedWorkoutResult, UUID> {
    List<AdvancedWorkoutResult> findByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
    List<AdvancedWorkoutResult> findByUserId(UUID userId);
    List<AdvancedWorkoutResult> findByUserIdOrderByDateDesc(UUID userId);
    List<AdvancedWorkoutResult> findByTemplateId(UUID templateId);
}