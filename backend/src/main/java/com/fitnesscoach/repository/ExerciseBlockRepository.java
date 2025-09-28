package com.fitnesscoach.repository;

import com.fitnesscoach.model.ExerciseBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseBlockRepository extends JpaRepository<ExerciseBlock, UUID> {

    List<ExerciseBlock> findBySessionIdOrderByOrderIndex(UUID sessionId);

    @Query("SELECT eb FROM ExerciseBlock eb WHERE eb.session.id = :sessionId AND eb.label = :label")
    ExerciseBlock findBySessionIdAndLabel(@Param("sessionId") UUID sessionId, @Param("label") String label);

    @Query("SELECT eb FROM ExerciseBlock eb WHERE eb.session.program.id = :programId ORDER BY eb.session.orderIndex, eb.orderIndex")
    List<ExerciseBlock> findByProgramId(@Param("programId") UUID programId);
}