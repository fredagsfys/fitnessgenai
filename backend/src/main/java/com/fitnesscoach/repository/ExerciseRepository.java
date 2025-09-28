package com.fitnesscoach.repository;

import com.fitnesscoach.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

    Optional<Exercise> findByName(String name);

    List<Exercise> findByPrimaryMuscle(String primaryMuscle);

    List<Exercise> findByEquipment(String equipment);

    @Query("SELECT e FROM Exercise e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Exercise> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);

    @Query("SELECT e FROM Exercise e WHERE LOWER(e.primaryMuscle) LIKE LOWER(CONCAT('%', :muscle, '%'))")
    List<Exercise> findByPrimaryMuscleContainingIgnoreCase(@Param("muscle") String muscle);
}