package com.fitnesscoach.repository;

import com.fitnesscoach.model.SetResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SetResultRepository extends JpaRepository<SetResult, UUID> {

    List<SetResult> findBySessionIdOrderByBlockLabelAscBlockItemOrderAscSetNumberAsc(UUID sessionId);

    @Query("SELECT sr FROM SetResult sr WHERE sr.exercise.id = :exerciseId ORDER BY sr.completedAt DESC")
    List<SetResult> findByExerciseIdOrderByCompletedAtDesc(@Param("exerciseId") UUID exerciseId);

    @Query("SELECT sr FROM SetResult sr WHERE sr.session.date >= :startDate AND sr.session.date <= :endDate ORDER BY sr.completedAt DESC")
    List<SetResult> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT sr FROM SetResult sr WHERE sr.blockLabel = :blockLabel AND sr.blockItemOrder = :blockItemOrder ORDER BY sr.completedAt DESC")
    List<SetResult> findByBlockLabelAndItemOrder(@Param("blockLabel") String blockLabel, @Param("blockItemOrder") int blockItemOrder);

    @Query("SELECT sr FROM SetResult sr WHERE sr.exercise.id = :exerciseId AND sr.session.date >= :startDate ORDER BY sr.completedAt DESC")
    List<SetResult> findByExerciseIdAndDateAfter(@Param("exerciseId") UUID exerciseId, @Param("startDate") LocalDate startDate);

    @Query("SELECT MAX(sr.weight) FROM SetResult sr WHERE sr.exercise.id = :exerciseId AND sr.weightUnit = :weightUnit")
    Double findMaxWeightByExerciseAndUnit(@Param("exerciseId") UUID exerciseId, @Param("weightUnit") String weightUnit);
}