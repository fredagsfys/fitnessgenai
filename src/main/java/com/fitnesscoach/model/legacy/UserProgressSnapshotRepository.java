package com.fitnesscoach.repository;

import com.fitnesscoach.model.User;
import com.fitnesscoach.model.UserProgressSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressSnapshotRepository extends JpaRepository<UserProgressSnapshot, Long> {

    List<UserProgressSnapshot> findByUserOrderBySnapshotDateDesc(User user);

    List<UserProgressSnapshot> findByUserAndSnapshotDateBetweenOrderBySnapshotDateDesc(
        User user,
        LocalDateTime startDate,
        LocalDateTime endDate
    );

    @Query("SELECT ups FROM UserProgressSnapshot ups WHERE ups.user = :user ORDER BY ups.snapshotDate DESC")
    List<UserProgressSnapshot> findRecentSnapshotsByUser(
        @Param("user") User user,
        org.springframework.data.domain.Pageable pageable
    );

    Optional<UserProgressSnapshot> findFirstByUserOrderBySnapshotDateDesc(User user);

    Optional<UserProgressSnapshot> findFirstByUserOrderBySnapshotDateAsc(User user);

    @Query("SELECT ups FROM UserProgressSnapshot ups WHERE ups.user = :user AND ups.weight IS NOT NULL ORDER BY ups.snapshotDate DESC")
    List<UserProgressSnapshot> findSnapshotsWithWeight(@Param("user") User user);

    @Query("SELECT ups FROM UserProgressSnapshot ups WHERE ups.user = :user AND ups.bodyFatPercentage IS NOT NULL ORDER BY ups.snapshotDate DESC")
    List<UserProgressSnapshot> findSnapshotsWithBodyFat(@Param("user") User user);

    @Query("SELECT AVG(ups.weight) FROM UserProgressSnapshot ups WHERE ups.user = :user AND ups.weight IS NOT NULL AND ups.snapshotDate BETWEEN :startDate AND :endDate")
    Double getAverageWeightInPeriod(
        @Param("user") User user,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(ups) FROM UserProgressSnapshot ups WHERE ups.user = :user")
    Long countByUser(@Param("user") User user);

    @Query("SELECT ups FROM UserProgressSnapshot ups WHERE ups.user = :user AND ups.snapshotDate >= :date ORDER BY ups.snapshotDate DESC")
    List<UserProgressSnapshot> findSnapshotsSince(@Param("user") User user, @Param("date") LocalDateTime date);

    @Query("SELECT ups FROM UserProgressSnapshot ups WHERE ups.user = :user AND ups.overallWellness = :wellness ORDER BY ups.snapshotDate DESC")
    List<UserProgressSnapshot> findSnapshotsByWellnessRating(
        @Param("user") User user,
        @Param("wellness") UserProgressSnapshot.WellnessRating wellness
    );

    @Query("SELECT MIN(ups.weight), MAX(ups.weight) FROM UserProgressSnapshot ups WHERE ups.user = :user AND ups.weight IS NOT NULL")
    Object[] getWeightRange(@Param("user") User user);

    @Query("SELECT ups FROM UserProgressSnapshot ups WHERE ups.user = :user AND ups.weight = (SELECT MIN(ups2.weight) FROM UserProgressSnapshot ups2 WHERE ups2.user = :user AND ups2.weight IS NOT NULL)")
    Optional<UserProgressSnapshot> findLowestWeightSnapshot(@Param("user") User user);

    @Query("SELECT ups FROM UserProgressSnapshot ups WHERE ups.user = :user AND ups.weight = (SELECT MAX(ups2.weight) FROM UserProgressSnapshot ups2 WHERE ups2.user = :user AND ups2.weight IS NOT NULL)")
    Optional<UserProgressSnapshot> findHighestWeightSnapshot(@Param("user") User user);
}