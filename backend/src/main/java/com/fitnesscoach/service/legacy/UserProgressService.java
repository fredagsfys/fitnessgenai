package com.fitnesscoach.service.legacy;

import com.fitnesscoach.exception.ResourceNotFoundException;
import com.fitnesscoach.model.legacy.User;
import com.fitnesscoach.model.legacy.UserProgressSnapshot;
import com.fitnesscoach.repository.legacy.UserProgressSnapshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class UserProgressService {

    @Autowired
    private UserProgressSnapshotRepository snapshotRepository;

    public UserProgressSnapshot createProgressSnapshot(User user, UserProgressSnapshot snapshot) {
        snapshot.setUserId(user.getId());
        return snapshotRepository.save(snapshot);
    }

    public UserProgressSnapshot updateProgressSnapshot(Long snapshotId, UserProgressSnapshot snapshot) {
        UserProgressSnapshot existing = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress snapshot not found with id: " + snapshotId));

        if (snapshot.getSnapshotDate() != null) {
            existing.setSnapshotDate(snapshot.getSnapshotDate());
        }
        if (snapshot.getWeightKg() != null) {
            existing.setWeightKg(snapshot.getWeightKg());
        }
        if (snapshot.getBodyFatPercentage() != null) {
            existing.setBodyFatPercentage(snapshot.getBodyFatPercentage());
        }
        if (snapshot.getMuscleMassKg() != null) {
            existing.setMuscleMassKg(snapshot.getMuscleMassKg());
        }
        if (snapshot.getChestCm() != null) {
            existing.setChestCm(snapshot.getChestCm());
        }
        if (snapshot.getWaistCm() != null) {
            existing.setWaistCm(snapshot.getWaistCm());
        }
        if (snapshot.getHipsCm() != null) {
            existing.setHipsCm(snapshot.getHipsCm());
        }
        if (snapshot.getBicepLeftCm() != null) {
            existing.setBicepLeftCm(snapshot.getBicepLeftCm());
        }
        if (snapshot.getBicepRightCm() != null) {
            existing.setBicepRightCm(snapshot.getBicepRightCm());
        }
        if (snapshot.getThighLeftCm() != null) {
            existing.setThighLeftCm(snapshot.getThighLeftCm());
        }
        if (snapshot.getThighRightCm() != null) {
            existing.setThighRightCm(snapshot.getThighRightCm());
        }
        if (snapshot.getCalfLeftCm() != null) {
            existing.setCalfLeftCm(snapshot.getCalfLeftCm());
        }
        if (snapshot.getCalfRightCm() != null) {
            existing.setCalfRightCm(snapshot.getCalfRightCm());
        }
        if (snapshot.getNotes() != null) {
            existing.setNotes(snapshot.getNotes());
        }
        if (snapshot.getPhotoUrl() != null) {
            existing.setPhotoUrl(snapshot.getPhotoUrl());
        }

        return snapshotRepository.save(existing);
    }

    public UserProgressSnapshot getProgressSnapshot(Long snapshotId) {
        return snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress snapshot not found with id: " + snapshotId));
    }

    public List<UserProgressSnapshot> getProgressSnapshotsByUser(User user) {
        return snapshotRepository.findByUserIdOrderBySnapshotDateDesc(user.getId());
    }

    public List<UserProgressSnapshot> getProgressSnapshotsByUserAndDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return snapshotRepository.findByUserIdAndSnapshotDateBetween(user.getId(), startDate.toLocalDate(), endDate.toLocalDate());
    }

    public List<UserProgressSnapshot> getRecentProgressSnapshots(User user, int limit) {
        return snapshotRepository.findRecentByUserId(user.getId(), PageRequest.of(0, limit));
    }

    public Optional<UserProgressSnapshot> getLatestProgressSnapshot(User user) {
        return snapshotRepository.findFirstByUserIdOrderBySnapshotDateDesc(user.getId());
    }

    public Map<String, Object> getProgressAnalytics(User user) {
        List<UserProgressSnapshot> snapshots = snapshotRepository.findByUserIdOrderBySnapshotDateDesc(user.getId());

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalSnapshots", snapshots.size());

        if (!snapshots.isEmpty()) {
            UserProgressSnapshot latest = snapshots.get(0);
            analytics.put("latestWeight", latest.getWeightKg());
            analytics.put("latestBodyFat", latest.getBodyFatPercentage());

            if (snapshots.size() > 1) {
                UserProgressSnapshot oldest = snapshots.get(snapshots.size() - 1);

                if (latest.getWeightKg() != null && oldest.getWeightKg() != null) {
                    double weightChange = latest.getWeightKg() - oldest.getWeightKg();
                    analytics.put("weightChange", weightChange);
                }

                if (latest.getBodyFatPercentage() != null && oldest.getBodyFatPercentage() != null) {
                    double bodyFatChange = latest.getBodyFatPercentage() - oldest.getBodyFatPercentage();
                    analytics.put("bodyFatChange", bodyFatChange);
                }
            }
        }

        return analytics;
    }

    public Map<String, Object> getProgressTrends(User user, LocalDateTime startDate, LocalDateTime endDate) {
        List<UserProgressSnapshot> snapshots = snapshotRepository.findByUserIdAndSnapshotDateBetween(
                user.getId(), startDate.toLocalDate(), endDate.toLocalDate());

        Map<String, Object> trends = new HashMap<>();

        List<Double> weightTrend = new ArrayList<>();
        List<Double> bodyFatTrend = new ArrayList<>();

        for (UserProgressSnapshot snapshot : snapshots) {
            if (snapshot.getWeightKg() != null) {
                weightTrend.add(snapshot.getWeightKg());
            }
            if (snapshot.getBodyFatPercentage() != null) {
                bodyFatTrend.add(snapshot.getBodyFatPercentage());
            }
        }

        trends.put("weightTrend", weightTrend);
        trends.put("bodyFatTrend", bodyFatTrend);

        return trends;
    }

    public List<UserProgressSnapshot> getSnapshotsWithWeight(User user) {
        return snapshotRepository.findByUserIdAndWeightKgIsNotNull(user.getId());
    }

    public List<UserProgressSnapshot> getSnapshotsWithBodyFat(User user) {
        return snapshotRepository.findByUserIdAndBodyFatPercentageIsNotNull(user.getId());
    }

    public void deleteProgressSnapshot(Long snapshotId) {
        UserProgressSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress snapshot not found with id: " + snapshotId));
        snapshotRepository.delete(snapshot);
    }
}