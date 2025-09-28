package com.fitnesscoach.repository;

import com.fitnesscoach.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {

    List<WorkoutSession> findByDateOrderByDateDesc(LocalDate date);

    @Query("SELECT ws FROM WorkoutSession ws WHERE ws.date >= :startDate AND ws.date <= :endDate ORDER BY ws.date DESC")
    List<WorkoutSession> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<WorkoutSession> findByTemplateIdOrderByDateDesc(UUID templateId);

    @Query("SELECT ws FROM WorkoutSession ws WHERE ws.template.program.id = :programId ORDER BY ws.date DESC")
    List<WorkoutSession> findByProgramId(@Param("programId") UUID programId);

    @Query("SELECT ws FROM WorkoutSession ws WHERE ws.week = :week ORDER BY ws.date DESC")
    List<WorkoutSession> findByWeek(@Param("week") int week);

    @Query("SELECT ws FROM WorkoutSession ws ORDER BY ws.date DESC")
    List<WorkoutSession> findAllOrderByDateDesc();
}