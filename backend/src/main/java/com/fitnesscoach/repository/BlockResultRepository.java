package com.fitnesscoach.repository;

import com.fitnesscoach.model.BlockResult;
import com.fitnesscoach.model.ExerciseBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlockResultRepository extends JpaRepository<BlockResult, UUID> {
    List<BlockResult> findByWorkoutResultId(UUID workoutResultId);
    List<BlockResult> findByBlockType(ExerciseBlock.BlockType blockType);
}