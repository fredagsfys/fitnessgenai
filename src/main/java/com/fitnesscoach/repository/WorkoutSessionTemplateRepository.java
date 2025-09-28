package com.fitnesscoach.repository;

import com.fitnesscoach.model.WorkoutSessionTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkoutSessionTemplateRepository extends JpaRepository<WorkoutSessionTemplate, UUID> {

    List<WorkoutSessionTemplate> findByProgramIdOrderByOrderIndex(UUID programId);

    @Query("SELECT wst FROM WorkoutSessionTemplate wst WHERE wst.program.id = :programId AND wst.title = :title")
    WorkoutSessionTemplate findByProgramIdAndTitle(@Param("programId") UUID programId, @Param("title") String title);

    @Query("SELECT wst FROM WorkoutSessionTemplate wst WHERE wst.title LIKE %:title%")
    List<WorkoutSessionTemplate> findByTitleContaining(@Param("title") String title);
}