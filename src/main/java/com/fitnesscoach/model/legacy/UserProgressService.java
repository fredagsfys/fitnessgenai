package com.fitnesscoach.service;

import com.fitnesscoach.exception.ResourceNotFoundException;
import com.fitnesscoach.model.User;
import com.fitnesscoach.model.UserProgressSnapshot;
import com.fitnesscoach.repository.UserProgressSnapshotRepository;
import com.fitnesscoach.repository.WorkoutResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
@Transactional
public class UserProgressService {

    @Autowired
    private UserProgressSnapshotRepository progressRepository;

    @Autowired
    private WorkoutResultRepository workoutResultRepository;

    public UserProgressSnapshot createProgressSnapshot(User user, UserProgressSnapshot snapshot) {
        snapshot.setUser(user);

        if (snapshot.getSnapshotDate() == null) {
            snapshot.setSnapshotDate(LocalDateTime.now());
        }

        enrichSnapshotWithWorkoutData(user, snapshot);

        return progressRepository.save(snapshot);
    }

    public UserProgressSnapshot updateProgressSnapshot(Long snapshotId, UserProgressSnapshot updatedSnapshot) {
        UserProgressSnapshot existingSnapshot = progressRepository.findById(snapshotId)
            .orElseThrow(() -> new ResourceNotFoundException("Progress snapshot not found with id: " + snapshotId));

        if (updatedSnapshot.getWeight() != null) {
            existingSnapshot.setWeight(updatedSnapshot.getWeight());
        }
        if (updatedSnapshot.getBodyFatPercentage() != null) {
            existingSnapshot.setBodyFatPercentage(updatedSnapshot.getBodyFatPercentage());
        }
        if (updatedSnapshot.getMuscleMass() != null) {
            existingSnapshot.setMuscleMass(updatedSnapshot.getMuscleMass());
        }
        if (updatedSnapshot.getChestMeasurement() != null) {
            existingSnapshot.setChestMeasurement(updatedSnapshot.getChestMeasurement());
        }
        if (updatedSnapshot.getWaistMeasurement() != null) {
            existingSnapshot.setWaistMeasurement(updatedSnapshot.getWaistMeasurement());
        }
        if (updatedSnapshot.getHipMeasurement() != null) {
            existingSnapshot.setHipMeasurement(updatedSnapshot.getHipMeasurement());
        }
        if (updatedSnapshot.getArmMeasurement() != null) {
            existingSnapshot.setArmMeasurement(updatedSnapshot.getArmMeasurement());
        }
        if (updatedSnapshot.getThighMeasurement() != null) {
            existingSnapshot.setThighMeasurement(updatedSnapshot.getThighMeasurement());
        }
        if (updatedSnapshot.getRestingHeartRate() != null) {
            existingSnapshot.setRestingHeartRate(updatedSnapshot.getRestingHeartRate());
        }
        if (updatedSnapshot.getBloodPressureSystolic() != null) {
            existingSnapshot.setBloodPressureSystolic(updatedSnapshot.getBloodPressureSystolic());
        }
        if (updatedSnapshot.getBloodPressureDiastolic() != null) {
            existingSnapshot.setBloodPressureDiastolic(updatedSnapshot.getBloodPressureDiastolic());
        }
        if (updatedSnapshot.getFitnessLevel() != null) {
            existingSnapshot.setFitnessLevel(updatedSnapshot.getFitnessLevel());
        }
        if (updatedSnapshot.getEnergyLevel() != null) {
            existingSnapshot.setEnergyLevel(updatedSnapshot.getEnergyLevel());
        }
        if (updatedSnapshot.getSleepQuality() != null) {
            existingSnapshot.setSleepQuality(updatedSnapshot.getSleepQuality());
        }
        if (updatedSnapshot.getAverageSleepHours() != null) {
            existingSnapshot.setAverageSleepHours(updatedSnapshot.getAverageSleepHours());
        }
        if (updatedSnapshot.getStressLevel() != null) {
            existingSnapshot.setStressLevel(updatedSnapshot.getStressLevel());
        }
        if (updatedSnapshot.getOverallWellness() != null) {
            existingSnapshot.setOverallWellness(updatedSnapshot.getOverallWellness());
        }
        if (updatedSnapshot.getGoals() != null) {
            existingSnapshot.setGoals(updatedSnapshot.getGoals());
        }
        if (updatedSnapshot.getNotes() != null) {
            existingSnapshot.setNotes(updatedSnapshot.getNotes());
        }

        return progressRepository.save(existingSnapshot);
    }

    @Transactional(readOnly = true)
    public UserProgressSnapshot getProgressSnapshot(Long snapshotId) {
        return progressRepository.findById(snapshotId)
            .orElseThrow(() -> new ResourceNotFoundException("Progress snapshot not found with id: " + snapshotId));
    }

    @Transactional(readOnly = true)
    public List<UserProgressSnapshot> getProgressSnapshotsByUser(User user) {
        return progressRepository.findByUserOrderBySnapshotDateDesc(user);
    }

    @Transactional(readOnly = true)
    public List<UserProgressSnapshot> getProgressSnapshotsByUserAndDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return progressRepository.findByUserAndSnapshotDateBetweenOrderBySnapshotDateDesc(user, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<UserProgressSnapshot> getRecentProgressSnapshots(User user, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return progressRepository.findRecentSnapshotsByUser(user, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<UserProgressSnapshot> getLatestProgressSnapshot(User user) {
        return progressRepository.findFirstByUserOrderBySnapshotDateDesc(user);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProgressAnalytics(User user) {
        Map<String, Object> analytics = new HashMap<>();

        Optional<UserProgressSnapshot> latest = progressRepository.findFirstByUserOrderBySnapshotDateDesc(user);
        Optional<UserProgressSnapshot> earliest = progressRepository.findFirstByUserOrderBySnapshotDateAsc(user);

        if (latest.isPresent() && earliest.isPresent()) {
            UserProgressSnapshot latestSnapshot = latest.get();
            UserProgressSnapshot earliestSnapshot = earliest.get();

            analytics.put("latestSnapshot", latestSnapshot);
            analytics.put("earliestSnapshot", earliestSnapshot);

            if (latestSnapshot.getWeight() != null && earliestSnapshot.getWeight() != null) {
                double weightChange = latestSnapshot.getWeight() - earliestSnapshot.getWeight();
                analytics.put("weightChange", weightChange);
                analytics.put("weightChangePercentage", (weightChange / earliestSnapshot.getWeight()) * 100);
            }

            if (latestSnapshot.getBodyFatPercentage() != null && earliestSnapshot.getBodyFatPercentage() != null) {
                double bodyFatChange = latestSnapshot.getBodyFatPercentage() - earliestSnapshot.getBodyFatPercentage();
                analytics.put("bodyFatChange", bodyFatChange);
            }

            long daysBetween = ChronoUnit.DAYS.between(earliestSnapshot.getSnapshotDate(), latestSnapshot.getSnapshotDate());
            analytics.put("trackingDuration", daysBetween);
        }

        Object[] weightRange = progressRepository.getWeightRange(user);
        if (weightRange[0] != null && weightRange[1] != null) {
            analytics.put("lowestWeight", weightRange[0]);
            analytics.put("highestWeight", weightRange[1]);
        }

        Long totalSnapshots = progressRepository.countByUser(user);
        analytics.put("totalSnapshots", totalSnapshots);

        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProgressTrends(User user, LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> trends = new HashMap<>();

        List<UserProgressSnapshot> snapshots = progressRepository.findByUserAndSnapshotDateBetweenOrderBySnapshotDateDesc(user, startDate, endDate);
        trends.put("snapshots", snapshots);

        if (!snapshots.isEmpty()) {
            Double averageWeight = progressRepository.getAverageWeightInPeriod(user, startDate, endDate);
            trends.put("averageWeight", averageWeight);

            trends.put("totalSnapshots", snapshots.size());

            long averageSleepHours = snapshots.stream()
                .filter(s -> s.getAverageSleepHours() != null)
                .mapToLong(s -> Math.round(s.getAverageSleepHours()))
                .sum() / Math.max(1, snapshots.stream()
                    .filter(s -> s.getAverageSleepHours() != null)
                    .count());
            trends.put("averageSleepHours", averageSleepHours);

            Map<UserProgressSnapshot.EnergyLevel, Long> energyLevelCounts = new HashMap<>();
            snapshots.stream()
                .filter(s -> s.getEnergyLevel() != null)
                .forEach(s -> energyLevelCounts.merge(s.getEnergyLevel(), 1L, Long::sum));
            trends.put("energyLevelDistribution", energyLevelCounts);

            Map<UserProgressSnapshot.WellnessRating, Long> wellnessCounts = new HashMap<>();
            snapshots.stream()
                .filter(s -> s.getOverallWellness() != null)
                .forEach(s -> wellnessCounts.merge(s.getOverallWellness(), 1L, Long::sum));
            trends.put("wellnessDistribution", wellnessCounts);
        }

        return trends;
    }

    @Transactional(readOnly = true)
    public List<UserProgressSnapshot> getSnapshotsWithWeight(User user) {
        return progressRepository.findSnapshotsWithWeight(user);
    }

    @Transactional(readOnly = true)
    public List<UserProgressSnapshot> getSnapshotsWithBodyFat(User user) {
        return progressRepository.findSnapshotsWithBodyFat(user);
    }

    public void deleteProgressSnapshot(Long snapshotId) {
        UserProgressSnapshot snapshot = progressRepository.findById(snapshotId)
            .orElseThrow(() -> new ResourceNotFoundException("Progress snapshot not found with id: " + snapshotId));

        progressRepository.delete(snapshot);
    }

    private void enrichSnapshotWithWorkoutData(User user, UserProgressSnapshot snapshot) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        Long workoutCount = workoutResultRepository.countByUser(user);
        snapshot.setTotalWorkoutsCompleted(workoutCount.intValue());

        Double averageDuration = workoutResultRepository.getAverageWorkoutDurationByUser(user);
        if (averageDuration != null) {
            snapshot.setAverageWorkoutDuration(averageDuration);
        }

        Long caloriesBurned = workoutResultRepository.sumCaloriesBurnedByUserAndDateRange(user, thirtyDaysAgo, LocalDateTime.now());
        if (caloriesBurned != null) {
            snapshot.setTotalCaloriesBurned(caloriesBurned.intValue());
        }

        int recentWorkoutCount = workoutResultRepository.findWorkoutResultsSince(user, thirtyDaysAgo).size();
        int weeklyFrequency = Math.round(recentWorkoutCount * 7.0f / 30.0f);
        snapshot.setWeeklyWorkoutFrequency(weeklyFrequency);
    }
}