package com.fitnesscoach.service;

import com.fitnesscoach.exception.ResourceNotFoundException;
import com.fitnesscoach.model.User;
import com.fitnesscoach.model.Workout;
import com.fitnesscoach.model.WorkoutResult;
import com.fitnesscoach.repository.WorkoutRepository;
import com.fitnesscoach.repository.WorkoutResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class WorkoutResultService {

    @Autowired
    private WorkoutResultRepository workoutResultRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    public WorkoutResult createWorkoutResult(Long workoutId, WorkoutResult workoutResult) {
        Workout workout = workoutRepository.findById(workoutId)
            .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id: " + workoutId));

        if (workoutResultRepository.findByWorkout(workout).isPresent()) {
            throw new IllegalStateException("Workout result already exists for this workout");
        }

        workoutResult.setWorkout(workout);

        if (workoutResult.getCompletedAt() == null) {
            workoutResult.setCompletedAt(LocalDateTime.now());
        }

        workout.setStatus(Workout.WorkoutStatus.COMPLETED);
        workoutRepository.save(workout);

        return workoutResultRepository.save(workoutResult);
    }

    public WorkoutResult updateWorkoutResult(Long resultId, WorkoutResult updatedResult) {
        WorkoutResult existingResult = workoutResultRepository.findById(resultId)
            .orElseThrow(() -> new ResourceNotFoundException("Workout result not found with id: " + resultId));

        if (updatedResult.getActualDurationMinutes() != null) {
            existingResult.setActualDurationMinutes(updatedResult.getActualDurationMinutes());
        }
        if (updatedResult.getActualCaloriesBurned() != null) {
            existingResult.setActualCaloriesBurned(updatedResult.getActualCaloriesBurned());
        }
        if (updatedResult.getAverageHeartRate() != null) {
            existingResult.setAverageHeartRate(updatedResult.getAverageHeartRate());
        }
        if (updatedResult.getMaxHeartRate() != null) {
            existingResult.setMaxHeartRate(updatedResult.getMaxHeartRate());
        }
        if (updatedResult.getPerceivedExertion() != null) {
            existingResult.setPerceivedExertion(updatedResult.getPerceivedExertion());
        }
        if (updatedResult.getDifficultyRating() != null) {
            existingResult.setDifficultyRating(updatedResult.getDifficultyRating());
        }
        if (updatedResult.getMoodAfter() != null) {
            existingResult.setMoodAfter(updatedResult.getMoodAfter());
        }
        if (updatedResult.getTotalVolume() != null) {
            existingResult.setTotalVolume(updatedResult.getTotalVolume());
        }
        if (updatedResult.getPersonalRecords() != null) {
            existingResult.setPersonalRecords(updatedResult.getPersonalRecords());
        }
        if (updatedResult.getNotes() != null) {
            existingResult.setNotes(updatedResult.getNotes());
        }
        if (updatedResult.getWeatherConditions() != null) {
            existingResult.setWeatherConditions(updatedResult.getWeatherConditions());
        }
        if (updatedResult.getWorkoutLocation() != null) {
            existingResult.setWorkoutLocation(updatedResult.getWorkoutLocation());
        }

        return workoutResultRepository.save(existingResult);
    }

    @Transactional(readOnly = true)
    public WorkoutResult getWorkoutResult(Long resultId) {
        return workoutResultRepository.findById(resultId)
            .orElseThrow(() -> new ResourceNotFoundException("Workout result not found with id: " + resultId));
    }

    @Transactional(readOnly = true)
    public WorkoutResult getWorkoutResultByWorkoutId(Long workoutId) {
        return workoutResultRepository.findByWorkoutId(workoutId)
            .orElseThrow(() -> new ResourceNotFoundException("Workout result not found for workout id: " + workoutId));
    }

    @Transactional(readOnly = true)
    public List<WorkoutResult> getWorkoutResultsByUser(User user) {
        return workoutResultRepository.findByWorkoutUserOrderByCompletedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<WorkoutResult> getWorkoutResultsByUserAndDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return workoutResultRepository.findByUserAndCompletedAtBetween(user, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<WorkoutResult> getRecentWorkoutResults(User user, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return workoutResultRepository.findRecentWorkoutResultsByUser(user, pageable);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserWorkoutStatistics(User user) {
        Map<String, Object> stats = new HashMap<>();

        Long totalWorkouts = workoutResultRepository.countByUser(user);
        stats.put("totalWorkouts", totalWorkouts);

        Double averageDuration = workoutResultRepository.getAverageWorkoutDurationByUser(user);
        stats.put("averageWorkoutDuration", averageDuration);

        Double averagePerceivedExertion = workoutResultRepository.getAveragePerceivedExertionByUser(user);
        stats.put("averagePerceivedExertion", averagePerceivedExertion);

        Long totalPersonalRecords = workoutResultRepository.getTotalPersonalRecordsByUser(user);
        stats.put("totalPersonalRecords", totalPersonalRecords);

        Double maxTotalVolume = workoutResultRepository.getMaxTotalVolumeByUser(user);
        stats.put("maxTotalVolume", maxTotalVolume);

        Long strengthWorkouts = workoutResultRepository.countByUserAndWorkoutType(user, Workout.WorkoutType.STRENGTH);
        Long cardioWorkouts = workoutResultRepository.countByUserAndWorkoutType(user, Workout.WorkoutType.CARDIO);
        Long flexibilityWorkouts = workoutResultRepository.countByUserAndWorkoutType(user, Workout.WorkoutType.FLEXIBILITY);

        Map<String, Long> workoutTypeBreakdown = new HashMap<>();
        workoutTypeBreakdown.put("strength", strengthWorkouts);
        workoutTypeBreakdown.put("cardio", cardioWorkouts);
        workoutTypeBreakdown.put("flexibility", flexibilityWorkouts);
        stats.put("workoutTypeBreakdown", workoutTypeBreakdown);

        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserWorkoutStatisticsForPeriod(User user, LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();

        List<WorkoutResult> workouts = workoutResultRepository.findByUserAndCompletedAtBetween(user, startDate, endDate);
        stats.put("totalWorkouts", workouts.size());

        Long totalCalories = workoutResultRepository.sumCaloriesBurnedByUserAndDateRange(user, startDate, endDate);
        stats.put("totalCaloriesBurned", totalCalories);

        Double averageDuration = workouts.stream()
            .filter(wr -> wr.getActualDurationMinutes() != null)
            .mapToDouble(WorkoutResult::getActualDurationMinutes)
            .average()
            .orElse(0.0);
        stats.put("averageWorkoutDuration", averageDuration);

        Integer totalPersonalRecords = workouts.stream()
            .filter(wr -> wr.getPersonalRecords() != null)
            .mapToInt(WorkoutResult::getPersonalRecords)
            .sum();
        stats.put("personalRecordsInPeriod", totalPersonalRecords);

        return stats;
    }

    @Transactional(readOnly = true)
    public List<WorkoutResult> getWorkoutResultsWithPersonalRecords(User user) {
        return workoutResultRepository.findWorkoutResultsWithPersonalRecords(user);
    }

    public void deleteWorkoutResult(Long resultId) {
        WorkoutResult workoutResult = workoutResultRepository.findById(resultId)
            .orElseThrow(() -> new ResourceNotFoundException("Workout result not found with id: " + resultId));

        Workout workout = workoutResult.getWorkout();
        workout.setStatus(Workout.WorkoutStatus.PLANNED);
        workoutRepository.save(workout);

        workoutResultRepository.delete(workoutResult);
    }
}