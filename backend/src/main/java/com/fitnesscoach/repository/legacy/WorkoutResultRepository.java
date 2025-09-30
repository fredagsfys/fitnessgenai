package com.fitnesscoach.repository.legacy;

import com.fitnesscoach.model.legacy.WorkoutResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutResultRepository extends JpaRepository<WorkoutResult, Long> {
    Optional<WorkoutResult> findByWorkoutId(Long workoutId);
    List<WorkoutResult> findByUserId(Long userId);
    List<WorkoutResult> findByUserIdAndCompletedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);
    List<WorkoutResult> findByUserIdOrderByCompletedAtDesc(Long userId);
    List<WorkoutResult> findByUserIdAndIsPersonalRecord(Long userId, Boolean isPersonalRecord);

    @Query("SELECT w FROM WorkoutResult w WHERE w.userId = ?1 ORDER BY w.completedAt DESC")
    List<WorkoutResult> findRecentByUserId(Long userId, org.springframework.data.domain.Pageable pageable);
}