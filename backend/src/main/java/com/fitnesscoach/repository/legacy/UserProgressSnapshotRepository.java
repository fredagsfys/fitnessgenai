package com.fitnesscoach.repository.legacy;

import com.fitnesscoach.model.legacy.UserProgressSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressSnapshotRepository extends JpaRepository<UserProgressSnapshot, Long> {
    List<UserProgressSnapshot> findByUserId(Long userId);
    List<UserProgressSnapshot> findByUserIdAndSnapshotDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<UserProgressSnapshot> findByUserIdOrderBySnapshotDateDesc(Long userId);
    Optional<UserProgressSnapshot> findFirstByUserIdOrderBySnapshotDateDesc(Long userId);
    List<UserProgressSnapshot> findByUserIdAndWeightKgIsNotNull(Long userId);
    List<UserProgressSnapshot> findByUserIdAndBodyFatPercentageIsNotNull(Long userId);

    @Query("SELECT s FROM UserProgressSnapshot s WHERE s.userId = ?1 ORDER BY s.snapshotDate DESC")
    List<UserProgressSnapshot> findRecentByUserId(Long userId, org.springframework.data.domain.Pageable pageable);
}