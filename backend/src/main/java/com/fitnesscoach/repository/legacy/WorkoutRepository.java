package com.fitnesscoach.repository.legacy;

import com.fitnesscoach.model.legacy.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByUserId(Long userId);
    List<Workout> findByUserIdAndStatus(Long userId, Workout.WorkoutStatus status);
    List<Workout> findByUserIdAndScheduledDateBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COUNT(w) FROM Workout w WHERE w.userId = ?1 AND w.status = ?2")
    long countByUserIdAndStatus(Long userId, Workout.WorkoutStatus status);

    @Query("SELECT COALESCE(SUM(w.caloriesBurned), 0) FROM Workout w WHERE w.userId = ?1 AND w.status = 'COMPLETED'")
    Integer sumCaloriesBurnedByUserId(Long userId);
}