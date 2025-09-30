package com.fitnesscoach.repository;

import com.fitnesscoach.model.AdvancedSetResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdvancedSetResultRepository extends JpaRepository<AdvancedSetResult, UUID> {
    List<AdvancedSetResult> findByWorkoutResultId(UUID workoutResultId);
    List<AdvancedSetResult> findByExerciseId(UUID exerciseId);
}