package com.fitnesscoach.repository;

import com.fitnesscoach.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProgramRepository extends JpaRepository<Program, UUID> {

    List<Program> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT p FROM Program p WHERE p.startDate <= :date AND (p.endDate IS NULL OR p.endDate >= :date)")
    List<Program> findActivePrograms(@Param("date") LocalDate date);

    @Query("SELECT p FROM Program p WHERE p.startDate >= :startDate AND p.startDate <= :endDate")
    List<Program> findProgramsStartingBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM Program p ORDER BY p.startDate DESC")
    List<Program> findAllOrderByStartDateDesc();
}