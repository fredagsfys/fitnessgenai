package com.fitnesscoach.repository;

import com.fitnesscoach.model.User;
import com.fitnesscoach.model.Workout;
import com.fitnesscoach.model.WorkoutResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutResultRepository extends JpaRepository<WorkoutResult, Long> {

    Optional<WorkoutResult> findByWorkout(Workout workout);

    Optional<WorkoutResult> findByWorkoutId(Long workoutId);

    List<WorkoutResult> findByWorkoutUserOrderByCompletedAtDesc(User user);

    @Query("SELECT wr FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user AND wr.completedAt BETWEEN :startDate AND :endDate ORDER BY wr.completedAt DESC")
    List<WorkoutResult> findByUserAndCompletedAtBetween(
        @Param("user") User user,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(wr) FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user")
    Long countByUser(@Param("user") User user);

    @Query("SELECT SUM(wr.actualCaloriesBurned) FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user AND wr.completedAt BETWEEN :startDate AND :endDate")
    Long sumCaloriesBurnedByUserAndDateRange(
        @Param("user") User user,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT AVG(wr.actualDurationMinutes) FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user")
    Double getAverageWorkoutDurationByUser(@Param("user") User user);

    @Query("SELECT AVG(wr.perceivedExertion) FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user AND wr.perceivedExertion IS NOT NULL")
    Double getAveragePerceivedExertionByUser(@Param("user") User user);

    @Query("SELECT COUNT(wr) FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user AND w.type = :workoutType")
    Long countByUserAndWorkoutType(@Param("user") User user, @Param("workoutType") Workout.WorkoutType workoutType);

    @Query("SELECT wr FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user ORDER BY wr.completedAt DESC")
    List<WorkoutResult> findRecentWorkoutResultsByUser(@Param("user") User user, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT SUM(wr.personalRecords) FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user")
    Long getTotalPersonalRecordsByUser(@Param("user") User user);

    @Query("SELECT wr FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user AND wr.personalRecords > 0 ORDER BY wr.completedAt DESC")
    List<WorkoutResult> findWorkoutResultsWithPersonalRecords(@Param("user") User user);

    @Query("SELECT MAX(wr.totalVolume) FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user AND w.type = 'STRENGTH'")
    Double getMaxTotalVolumeByUser(@Param("user") User user);

    @Query("SELECT wr FROM WorkoutResult wr JOIN wr.workout w WHERE w.user = :user AND wr.completedAt >= :date ORDER BY wr.completedAt ASC")
    List<WorkoutResult> findWorkoutResultsSince(@Param("user") User user, @Param("date") LocalDateTime date);
}