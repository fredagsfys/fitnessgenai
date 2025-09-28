package com.fitnesscoach.repository;

import com.fitnesscoach.model.Workout;
import com.fitnesscoach.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findByUserOrderByWorkoutDateDesc(User user);

    List<Workout> findByUserIdOrderByWorkoutDateDesc(Long userId);

    @Query("SELECT w FROM Workout w WHERE w.user.id = :userId AND w.workoutDate BETWEEN :startDate AND :endDate ORDER BY w.workoutDate DESC")
    List<Workout> findByUserIdAndDateRange(@Param("userId") Long userId,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT w FROM Workout w WHERE w.user.id = :userId AND w.status = :status ORDER BY w.workoutDate DESC")
    List<Workout> findByUserIdAndStatus(@Param("userId") Long userId,
                                       @Param("status") Workout.WorkoutStatus status);

    @Query("SELECT COUNT(w) FROM Workout w WHERE w.user.id = :userId AND w.status = 'COMPLETED'")
    long countCompletedWorkoutsByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(w.caloriesBurned) FROM Workout w WHERE w.user.id = :userId AND w.status = 'COMPLETED'")
    Integer getTotalCaloriesBurnedByUserId(@Param("userId") Long userId);
}