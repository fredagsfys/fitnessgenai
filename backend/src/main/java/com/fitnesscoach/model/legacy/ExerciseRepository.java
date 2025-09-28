package com.fitnesscoach.repository;

import com.fitnesscoach.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findByWorkoutIdOrderByCreatedAt(Long workoutId);

    List<Exercise> findByWorkoutId(Long workoutId);

    @Query("SELECT e FROM Exercise e WHERE e.workout.user.id = :userId ORDER BY e.createdAt DESC")
    List<Exercise> findByUserId(@Param("userId") Long userId);

    @Query("SELECT e FROM Exercise e WHERE e.category = :category ORDER BY e.name")
    List<Exercise> findByCategory(@Param("category") Exercise.ExerciseCategory category);

    @Query("SELECT e FROM Exercise e WHERE e.muscleGroup = :muscleGroup ORDER BY e.name")
    List<Exercise> findByMuscleGroup(@Param("muscleGroup") String muscleGroup);

    @Query("SELECT DISTINCT e.muscleGroup FROM Exercise e WHERE e.muscleGroup IS NOT NULL ORDER BY e.muscleGroup")
    List<String> findDistinctMuscleGroups();
}