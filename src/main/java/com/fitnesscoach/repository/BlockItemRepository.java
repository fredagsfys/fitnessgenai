package com.fitnesscoach.repository;

import com.fitnesscoach.model.BlockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlockItemRepository extends JpaRepository<BlockItem, UUID> {

    List<BlockItem> findByBlockIdOrderByOrderIndex(UUID blockId);

    @Query("SELECT bi FROM BlockItem bi WHERE bi.exercise.id = :exerciseId")
    List<BlockItem> findByExerciseId(@Param("exerciseId") UUID exerciseId);

    @Query("SELECT bi FROM BlockItem bi WHERE bi.block.session.program.id = :programId ORDER BY bi.block.session.orderIndex, bi.block.orderIndex, bi.orderIndex")
    List<BlockItem> findByProgramId(@Param("programId") UUID programId);

    @Query("SELECT bi FROM BlockItem bi WHERE bi.prescription.weekStart <= :week AND bi.prescription.weekEnd >= :week")
    List<BlockItem> findByWeek(@Param("week") int week);
}