package com.fitnesscoach.controller;

import com.fitnesscoach.model.legacy.Workout;
import com.fitnesscoach.model.legacy.WorkoutResult;
import com.fitnesscoach.service.legacy.WorkoutService;
import com.fitnesscoach.service.legacy.WorkoutResultService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;
    private final WorkoutResultService workoutResultService;

    @Autowired
    public WorkoutController(WorkoutService workoutService, WorkoutResultService workoutResultService) {
        this.workoutService = workoutService;
        this.workoutResultService = workoutResultService;
    }

    @GetMapping
    public ResponseEntity<List<Workout>> getAllWorkouts() {
        List<Workout> workouts = workoutService.getAllWorkouts();
        return ResponseEntity.ok(workouts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkoutById(@PathVariable Long id) {
        Optional<Workout> workout = workoutService.getWorkoutById(id);
        return workout.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Workout>> getWorkoutsByUserId(@PathVariable Long userId) {
        List<Workout> workouts = workoutService.getWorkoutsByUserId(userId);
        return ResponseEntity.ok(workouts);
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<Workout>> getWorkoutsByUserIdAndDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Workout> workouts = workoutService.getWorkoutsByUserIdAndDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(workouts);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<Workout>> getWorkoutsByUserIdAndStatus(
            @PathVariable Long userId,
            @PathVariable Workout.WorkoutStatus status) {
        List<Workout> workouts = workoutService.getWorkoutsByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(workouts);
    }

    @PostMapping
    public ResponseEntity<Workout> createWorkout(@Valid @RequestBody Workout workout) {
        try {
            Workout createdWorkout = workoutService.createWorkout(workout);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdWorkout);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(@PathVariable Long id, @Valid @RequestBody Workout workoutDetails) {
        try {
            Workout updatedWorkout = workoutService.updateWorkout(id, workoutDetails);
            return ResponseEntity.ok(updatedWorkout);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<Workout> startWorkout(@PathVariable Long id) {
        try {
            Workout startedWorkout = workoutService.startWorkout(id);
            return ResponseEntity.ok(startedWorkout);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Workout> completeWorkout(@PathVariable Long id) {
        try {
            Workout completedWorkout = workoutService.completeWorkout(id);
            return ResponseEntity.ok(completedWorkout);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/complete-with-results")
    public ResponseEntity<WorkoutResult> completeWorkoutWithResults(
            @PathVariable Long id,
            @Valid @RequestBody WorkoutResult workoutResult) {
        try {
            WorkoutResult result = workoutResultService.createWorkoutResult(id, workoutResult);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long id) {
        try {
            workoutService.deleteWorkout(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}/stats/completed-count")
    public ResponseEntity<Long> getCompletedWorkoutsCount(@PathVariable Long userId) {
        long count = workoutService.getCompletedWorkoutsCount(userId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/user/{userId}/stats/total-calories")
    public ResponseEntity<Integer> getTotalCaloriesBurned(@PathVariable Long userId) {
        Integer calories = workoutService.getTotalCaloriesBurned(userId);
        return ResponseEntity.ok(calories);
    }
}