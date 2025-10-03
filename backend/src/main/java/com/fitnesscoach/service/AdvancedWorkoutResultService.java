package com.fitnesscoach.service;

import com.fitnesscoach.model.AdvancedWorkoutResult;
import com.fitnesscoach.model.WorkoutSessionTemplate;
import com.fitnesscoach.repository.AdvancedWorkoutResultRepository;
import com.fitnesscoach.repository.WorkoutSessionTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service("advancedWorkoutResultService")
@Transactional
public class AdvancedWorkoutResultService {

    private final AdvancedWorkoutResultRepository workoutResultRepository;
    private final WorkoutSessionTemplateRepository sessionTemplateRepository;

    @Autowired
    public AdvancedWorkoutResultService(
            AdvancedWorkoutResultRepository workoutResultRepository,
            WorkoutSessionTemplateRepository sessionTemplateRepository) {
        this.workoutResultRepository = workoutResultRepository;
        this.sessionTemplateRepository = sessionTemplateRepository;
    }

    public AdvancedWorkoutResult saveWorkoutResult(AdvancedWorkoutResult result) {
        // Calculate metrics from set results if present
        if (result.getSetResults() != null && !result.getSetResults().isEmpty()) {
            result.calculateMetricsFromSets();
        }
        return workoutResultRepository.save(result);
    }

    public Optional<AdvancedWorkoutResult> findById(UUID id) {
        return workoutResultRepository.findById(id);
    }

    public List<AdvancedWorkoutResult> findAll() {
        return workoutResultRepository.findAll();
    }

    public List<AdvancedWorkoutResult> findByUserId(UUID userId) {
        return workoutResultRepository.findByUserId(userId);
    }

    public List<AdvancedWorkoutResult> findByUserIdAndDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return workoutResultRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    public List<AdvancedWorkoutResult> findByTemplate(UUID templateId) {
        return workoutResultRepository.findByTemplateId(templateId);
    }

    public void deleteWorkoutResult(UUID id) {
        workoutResultRepository.deleteById(id);
    }

    // Helper method to start a workout session
    public AdvancedWorkoutResult startWorkoutSession(UUID sessionTemplateId, UUID userId) {
        WorkoutSessionTemplate template = sessionTemplateRepository.findById(sessionTemplateId)
                .orElseThrow(() -> new RuntimeException("Session template not found"));

        AdvancedWorkoutResult result = new AdvancedWorkoutResult(template);
        result.setUserId(userId);
        return workoutResultRepository.save(result);
    }

    // Helper method to finish a workout session
    public AdvancedWorkoutResult finishWorkoutSession(UUID resultId) {
        AdvancedWorkoutResult result = workoutResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Workout result not found"));

        result.setEndTime(java.time.Instant.now());
        if (result.getStartTime() != null && result.getEndTime() != null) {
            long durationSeconds = java.time.Duration.between(result.getStartTime(), result.getEndTime()).getSeconds();
            result.setTotalDurationSeconds((int) durationSeconds);
        }

        result.calculateMetricsFromSets();
        return workoutResultRepository.save(result);
    }
}
