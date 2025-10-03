package com.fitnesscoach.controller;

import com.fitnesscoach.dto.WorkoutResultDTO;
import com.fitnesscoach.model.AdvancedWorkoutResult;
import com.fitnesscoach.model.AdvancedSetResult;
import com.fitnesscoach.model.Exercise;
import com.fitnesscoach.model.ExerciseCategory;
import com.fitnesscoach.model.WeightUnit;
import com.fitnesscoach.repository.ExerciseRepository;
import com.fitnesscoach.service.AdvancedWorkoutResultService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workout-results")
@CrossOrigin(origins = "*")
public class AdvancedWorkoutResultController {

    private final AdvancedWorkoutResultService workoutResultService;
    private final ExerciseRepository exerciseRepository;

    @Autowired
    public AdvancedWorkoutResultController(
            AdvancedWorkoutResultService workoutResultService,
            ExerciseRepository exerciseRepository) {
        this.workoutResultService = workoutResultService;
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResultDTO>> getAllResults() {
        List<AdvancedWorkoutResult> results = workoutResultService.findAll();
        List<WorkoutResultDTO> dtos = results.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutResultDTO> getResultById(@PathVariable UUID id) {
        return workoutResultService.findById(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutResultDTO>> getResultsByUser(@PathVariable UUID userId) {
        List<AdvancedWorkoutResult> results = workoutResultService.findByUserId(userId);
        List<WorkoutResultDTO> dtos = results.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<WorkoutResultDTO>> getResultsByUserAndDateRange(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AdvancedWorkoutResult> results = workoutResultService.findByUserIdAndDateRange(userId, startDate, endDate);
        List<WorkoutResultDTO> dtos = results.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/template/{templateId}")
    public ResponseEntity<List<WorkoutResultDTO>> getResultsByTemplate(@PathVariable UUID templateId) {
        List<AdvancedWorkoutResult> results = workoutResultService.findByTemplate(templateId);
        List<WorkoutResultDTO> dtos = results.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<WorkoutResultDTO> createResult(@Valid @RequestBody WorkoutResultDTO resultDTO) {
        try {
            AdvancedWorkoutResult result = fromDTO(resultDTO);
            AdvancedWorkoutResult savedResult = workoutResultService.saveWorkoutResult(result);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedResult));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutResultDTO> updateResult(
            @PathVariable UUID id,
            @Valid @RequestBody WorkoutResultDTO resultDTO) {
        return workoutResultService.findById(id)
                .map(existing -> {
                    updateFromDTO(existing, resultDTO);
                    AdvancedWorkoutResult updated = workoutResultService.saveWorkoutResult(existing);
                    return ResponseEntity.ok(toDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable UUID id) {
        try {
            workoutResultService.deleteWorkoutResult(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Start a new workout session
    @PostMapping("/start")
    public ResponseEntity<WorkoutResultDTO> startWorkoutSession(
            @RequestParam UUID sessionTemplateId,
            @RequestParam UUID userId) {
        try {
            AdvancedWorkoutResult result = workoutResultService.startWorkoutSession(sessionTemplateId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Finish a workout session
    @PostMapping("/{id}/finish")
    public ResponseEntity<WorkoutResultDTO> finishWorkoutSession(@PathVariable UUID id) {
        try {
            AdvancedWorkoutResult result = workoutResultService.finishWorkoutSession(id);
            return ResponseEntity.ok(toDTO(result));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DTO mapping methods
    private WorkoutResultDTO toDTO(AdvancedWorkoutResult result) {
        WorkoutResultDTO dto = new WorkoutResultDTO();
        dto.id = result.getId();
        dto.userId = result.getUserId();
        dto.sessionTemplateId = result.getTemplate() != null ? result.getTemplate().getId() : null;
        dto.sessionTitle = result.getTemplate() != null ? result.getTemplate().getTitle() : null;
        dto.date = result.getDate();
        dto.week = result.getWeek();
        dto.programWeek = result.getProgramWeek();

        dto.startTime = result.getStartTime();
        dto.endTime = result.getEndTime();
        dto.totalDurationSeconds = result.getTotalDurationSeconds();
        dto.workTimeSeconds = result.getWorkTimeSeconds();
        dto.restTimeSeconds = result.getRestTimeSeconds();

        dto.completionStatus = result.getCompletionStatus() != null ? result.getCompletionStatus().name() : null;
        dto.totalReps = result.getTotalReps();
        dto.totalVolumeLoad = result.getTotalVolumeLoad();
        dto.averageRPE = result.getAverageRPE();
        dto.caloriesBurned = result.getCaloriesBurned();

        dto.totalRounds = result.getTotalRounds();
        dto.targetRounds = result.getTargetRounds();
        dto.completedInTimeLimit = result.getCompletedInTimeLimit();
        dto.wodResult = result.getWodResult();
        dto.rxCompleted = result.getRxCompleted();

        dto.emomMinutesCompleted = result.getEmomMinutesCompleted();
        dto.emomMinutesTarget = result.getEmomMinutesTarget();
        dto.emomFailedMinutes = result.getEmomFailedMinutes();

        dto.tabataRoundsCompleted = result.getTabataRoundsCompleted();
        dto.tabataRoundsTarget = result.getTabataRoundsTarget();
        dto.tabataAverageReps = result.getTabataAverageReps();

        dto.circuitRoundsCompleted = result.getCircuitRoundsCompleted();
        dto.averageCircuitTime = result.getAverageCircuitTime();

        dto.workoutQuality = result.getWorkoutQuality();
        dto.workoutEnjoyment = result.getWorkoutEnjoyment();
        dto.difficultyRating = result.getDifficultyRating();

        dto.notes = result.getNotes();
        dto.achievements = result.getAchievements();

        // Map set results if present
        if (result.getSetResults() != null) {
            dto.setResults = result.getSetResults().stream()
                    .map(setResult -> {
                        WorkoutResultDTO.SetResultSummary summary = new WorkoutResultDTO.SetResultSummary();
                        summary.id = setResult.getId() != null ? setResult.getId().toString() : null;
                        summary.blockLabel = setResult.getBlockLabel();
                        summary.blockItemOrder = setResult.getBlockItemOrder();
                        summary.setNumber = setResult.getSetNumber();
                        summary.exerciseName = setResult.getExercise() != null ? setResult.getExercise().getName() : null;
                        summary.targetReps = setResult.getTargetReps();
                        summary.performedReps = setResult.getPerformedReps();
                        summary.weight = setResult.getWeight();
                        summary.weightUnit = setResult.getWeightUnit() != null ? setResult.getWeightUnit().name() : null;
                        summary.rpe = setResult.getRpe() != null ? setResult.getRpe().intValue() : null;
                        summary.restTakenSec = setResult.getRestTimeSeconds();
                        return summary;
                    })
                    .collect(Collectors.toList());
        }

        return dto;
    }

    private AdvancedWorkoutResult fromDTO(WorkoutResultDTO dto) {
        AdvancedWorkoutResult result = new AdvancedWorkoutResult();
        updateFromDTO(result, dto);
        return result;
    }

    private void updateFromDTO(AdvancedWorkoutResult result, WorkoutResultDTO dto) {
        if (dto.userId != null) result.setUserId(dto.userId);
        if (dto.date != null) result.setDate(dto.date);
        if (dto.week != null) result.setWeek(dto.week);
        if (dto.programWeek != null) result.setProgramWeek(dto.programWeek);

        if (dto.startTime != null) result.setStartTime(dto.startTime);
        if (dto.endTime != null) result.setEndTime(dto.endTime);
        if (dto.totalDurationSeconds != null) result.setTotalDurationSeconds(dto.totalDurationSeconds);
        if (dto.workTimeSeconds != null) result.setWorkTimeSeconds(dto.workTimeSeconds);
        if (dto.restTimeSeconds != null) result.setRestTimeSeconds(dto.restTimeSeconds);

        if (dto.completionStatus != null) {
            result.setCompletionStatus(AdvancedWorkoutResult.SessionCompletionStatus.valueOf(dto.completionStatus));
        }
        if (dto.totalReps != null) result.setTotalReps(dto.totalReps);
        if (dto.totalVolumeLoad != null) result.setTotalVolumeLoad(dto.totalVolumeLoad);
        if (dto.averageRPE != null) result.setAverageRPE(dto.averageRPE);
        if (dto.caloriesBurned != null) result.setCaloriesBurned(dto.caloriesBurned);

        if (dto.totalRounds != null) result.setTotalRounds(dto.totalRounds);
        if (dto.targetRounds != null) result.setTargetRounds(dto.targetRounds);
        if (dto.completedInTimeLimit != null) result.setCompletedInTimeLimit(dto.completedInTimeLimit);
        if (dto.wodResult != null) result.setWodResult(dto.wodResult);
        if (dto.rxCompleted != null) result.setRxCompleted(dto.rxCompleted);

        if (dto.emomMinutesCompleted != null) result.setEmomMinutesCompleted(dto.emomMinutesCompleted);
        if (dto.emomMinutesTarget != null) result.setEmomMinutesTarget(dto.emomMinutesTarget);
        if (dto.emomFailedMinutes != null) result.setEmomFailedMinutes(dto.emomFailedMinutes);

        if (dto.tabataRoundsCompleted != null) result.setTabataRoundsCompleted(dto.tabataRoundsCompleted);
        if (dto.tabataRoundsTarget != null) result.setTabataRoundsTarget(dto.tabataRoundsTarget);
        if (dto.tabataAverageReps != null) result.setTabataAverageReps(dto.tabataAverageReps);

        if (dto.circuitRoundsCompleted != null) result.setCircuitRoundsCompleted(dto.circuitRoundsCompleted);
        if (dto.averageCircuitTime != null) result.setAverageCircuitTime(dto.averageCircuitTime);

        if (dto.workoutQuality != null) result.setWorkoutQuality(dto.workoutQuality);
        if (dto.workoutEnjoyment != null) result.setWorkoutEnjoyment(dto.workoutEnjoyment);
        if (dto.difficultyRating != null) result.setDifficultyRating(dto.difficultyRating);

        if (dto.notes != null) result.setNotes(dto.notes);
        if (dto.achievements != null) result.setAchievements(dto.achievements);

        // Handle set results - create new AdvancedSetResult entities
        if (dto.setResults != null && !dto.setResults.isEmpty()) {
            // Clear existing set results and add new ones to avoid cascade issues
            if (result.getSetResults() == null) {
                result.setSetResults(new ArrayList<>());
            } else {
                result.getSetResults().clear();
            }

            for (WorkoutResultDTO.SetResultSummary summary : dto.setResults) {
                // Look up exercise by name
                Exercise exercise = null;
                if (summary.exerciseName != null) {
                    exercise = exerciseRepository.findByNameContainingIgnoreCase(summary.exerciseName).stream()
                            .findFirst()
                            .orElseGet(() -> {
                                // Create a simple exercise if not found
                                Exercise newEx = new Exercise();
                                newEx.setName(summary.exerciseName);
                                newEx.setCategory(ExerciseCategory.STRENGTH);
                                newEx.setPrimaryMuscle("General");
                                return exerciseRepository.save(newEx);
                            });
                }

                // Skip if we couldn't get or create an exercise
                if (exercise == null) continue;

                AdvancedSetResult setResult = new AdvancedSetResult();
                setResult.setWorkoutResult(result);
                setResult.setExercise(exercise);
                setResult.setBlockLabel(summary.blockLabel);
                setResult.setBlockItemOrder(summary.blockItemOrder != null ? summary.blockItemOrder : 0);
                setResult.setSetNumber(summary.setNumber != null ? summary.setNumber : 0);
                setResult.setPerformedReps(summary.performedReps);
                setResult.setTargetReps(summary.targetReps);
                setResult.setWeight(summary.weight);
                if (summary.weightUnit != null) {
                    setResult.setWeightUnit(WeightUnit.valueOf(summary.weightUnit));
                }
                if (summary.rpe != null) {
                    setResult.setRpe(summary.rpe.doubleValue());
                }
                setResult.setRestTimeSeconds(summary.restTakenSec);
                setResult.setResultType(AdvancedSetResult.ResultType.STRAIGHT_SET);

                result.getSetResults().add(setResult);
            }
        }
    }
}
