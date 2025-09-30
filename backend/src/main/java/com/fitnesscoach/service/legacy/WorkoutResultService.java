package com.fitnesscoach.service.legacy;

import com.fitnesscoach.exception.ResourceNotFoundException;
import com.fitnesscoach.model.legacy.User;
import com.fitnesscoach.model.legacy.WorkoutResult;
import com.fitnesscoach.repository.legacy.WorkoutResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class WorkoutResultService {

    @Autowired
    private WorkoutResultRepository workoutResultRepository;

    public WorkoutResult createWorkoutResult(Long workoutId, WorkoutResult workoutResult) {
        workoutResult.setWorkoutId(workoutId);
        return workoutResultRepository.save(workoutResult);
    }

    public WorkoutResult updateWorkoutResult(Long resultId, WorkoutResult workoutResult) {
        WorkoutResult existing = workoutResultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout result not found with id: " + resultId));

        if (workoutResult.getDurationMinutes() != null) {
            existing.setDurationMinutes(workoutResult.getDurationMinutes());
        }
        if (workoutResult.getCaloriesBurned() != null) {
            existing.setCaloriesBurned(workoutResult.getCaloriesBurned());
        }
        if (workoutResult.getAverageHeartRate() != null) {
            existing.setAverageHeartRate(workoutResult.getAverageHeartRate());
        }
        if (workoutResult.getMaxHeartRate() != null) {
            existing.setMaxHeartRate(workoutResult.getMaxHeartRate());
        }
        if (workoutResult.getRpeRating() != null) {
            existing.setRpeRating(workoutResult.getRpeRating());
        }
        if (workoutResult.getNotes() != null) {
            existing.setNotes(workoutResult.getNotes());
        }
        if (workoutResult.getIsPersonalRecord() != null) {
            existing.setIsPersonalRecord(workoutResult.getIsPersonalRecord());
        }
        if (workoutResult.getMetrics() != null) {
            existing.setMetrics(workoutResult.getMetrics());
        }

        return workoutResultRepository.save(existing);
    }

    public WorkoutResult getWorkoutResult(Long resultId) {
        return workoutResultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout result not found with id: " + resultId));
    }

    public WorkoutResult getWorkoutResultByWorkoutId(Long workoutId) {
        return workoutResultRepository.findByWorkoutId(workoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout result not found for workout id: " + workoutId));
    }

    public List<WorkoutResult> getWorkoutResultsByUser(User user) {
        return workoutResultRepository.findByUserId(user.getId());
    }

    public List<WorkoutResult> getWorkoutResultsByUserAndDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return workoutResultRepository.findByUserIdAndCompletedAtBetween(user.getId(), startDate, endDate);
    }

    public List<WorkoutResult> getRecentWorkoutResults(User user, int limit) {
        return workoutResultRepository.findRecentByUserId(user.getId(), PageRequest.of(0, limit));
    }

    public Map<String, Object> getUserWorkoutStatistics(User user) {
        List<WorkoutResult> results = workoutResultRepository.findByUserId(user.getId());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalWorkouts", results.size());

        double avgDuration = results.stream()
                .filter(r -> r.getDurationMinutes() != null)
                .mapToInt(WorkoutResult::getDurationMinutes)
                .average()
                .orElse(0.0);
        stats.put("averageDuration", avgDuration);

        int totalCalories = results.stream()
                .filter(r -> r.getCaloriesBurned() != null)
                .mapToInt(WorkoutResult::getCaloriesBurned)
                .sum();
        stats.put("totalCalories", totalCalories);

        long personalRecords = results.stream()
                .filter(r -> r.getIsPersonalRecord() != null && r.getIsPersonalRecord())
                .count();
        stats.put("personalRecords", personalRecords);

        double avgRPE = results.stream()
                .filter(r -> r.getRpeRating() != null)
                .mapToInt(WorkoutResult::getRpeRating)
                .average()
                .orElse(0.0);
        stats.put("averageRPE", avgRPE);

        return stats;
    }

    public Map<String, Object> getUserWorkoutStatisticsForPeriod(User user, LocalDateTime startDate, LocalDateTime endDate) {
        List<WorkoutResult> results = workoutResultRepository.findByUserIdAndCompletedAtBetween(user.getId(), startDate, endDate);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalWorkouts", results.size());

        double avgDuration = results.stream()
                .filter(r -> r.getDurationMinutes() != null)
                .mapToInt(WorkoutResult::getDurationMinutes)
                .average()
                .orElse(0.0);
        stats.put("averageDuration", avgDuration);

        int totalCalories = results.stream()
                .filter(r -> r.getCaloriesBurned() != null)
                .mapToInt(WorkoutResult::getCaloriesBurned)
                .sum();
        stats.put("totalCalories", totalCalories);

        return stats;
    }

    public List<WorkoutResult> getWorkoutResultsWithPersonalRecords(User user) {
        return workoutResultRepository.findByUserIdAndIsPersonalRecord(user.getId(), true);
    }

    public void deleteWorkoutResult(Long resultId) {
        WorkoutResult result = workoutResultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout result not found with id: " + resultId));
        workoutResultRepository.delete(result);
    }
}