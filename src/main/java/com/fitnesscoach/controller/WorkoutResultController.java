package com.fitnesscoach.controller;

import com.fitnesscoach.model.User;
import com.fitnesscoach.model.WorkoutResult;
import com.fitnesscoach.service.UserService;
import com.fitnesscoach.service.WorkoutResultService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
public class WorkoutResultController {

    @Autowired
    private WorkoutResultService workoutResultService;

    @Autowired
    private UserService userService;

    @PostMapping("/workouts/{workoutId}")
    public ResponseEntity<WorkoutResult> createWorkoutResult(
            @PathVariable Long workoutId,
            @Valid @RequestBody WorkoutResult workoutResult,
            Principal principal) {
        WorkoutResult createdResult = workoutResultService.createWorkoutResult(workoutId, workoutResult);
        return new ResponseEntity<>(createdResult, HttpStatus.CREATED);
    }

    @PutMapping("/{resultId}")
    public ResponseEntity<WorkoutResult> updateWorkoutResult(
            @PathVariable Long resultId,
            @Valid @RequestBody WorkoutResult workoutResult,
            Principal principal) {
        WorkoutResult updatedResult = workoutResultService.updateWorkoutResult(resultId, workoutResult);
        return ResponseEntity.ok(updatedResult);
    }

    @GetMapping("/{resultId}")
    public ResponseEntity<WorkoutResult> getWorkoutResult(@PathVariable Long resultId, Principal principal) {
        WorkoutResult result = workoutResultService.getWorkoutResult(resultId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/workouts/{workoutId}")
    public ResponseEntity<WorkoutResult> getWorkoutResultByWorkoutId(@PathVariable Long workoutId, Principal principal) {
        WorkoutResult result = workoutResultService.getWorkoutResultByWorkoutId(workoutId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my-results")
    public ResponseEntity<List<WorkoutResult>> getMyWorkoutResults(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<WorkoutResult> results = workoutResultService.getWorkoutResultsByUser(user);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/my-results/date-range")
    public ResponseEntity<List<WorkoutResult>> getMyWorkoutResultsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<WorkoutResult> results = workoutResultService.getWorkoutResultsByUserAndDateRange(user, startDate, endDate);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/my-results/recent")
    public ResponseEntity<List<WorkoutResult>> getMyRecentWorkoutResults(
            @RequestParam(defaultValue = "10") int limit,
            Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<WorkoutResult> results = workoutResultService.getRecentWorkoutResults(user, limit);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Object>> getMyWorkoutStatistics(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        Map<String, Object> stats = workoutResultService.getUserWorkoutStatistics(user);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/my-stats/period")
    public ResponseEntity<Map<String, Object>> getMyWorkoutStatisticsForPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Principal principal) {
        User user = userService.findByUsername(principal.getName());
        Map<String, Object> stats = workoutResultService.getUserWorkoutStatisticsForPeriod(user, startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/my-results/personal-records")
    public ResponseEntity<List<WorkoutResult>> getMyWorkoutResultsWithPersonalRecords(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<WorkoutResult> results = workoutResultService.getWorkoutResultsWithPersonalRecords(user);
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/{resultId}")
    public ResponseEntity<Void> deleteWorkoutResult(@PathVariable Long resultId, Principal principal) {
        workoutResultService.deleteWorkoutResult(resultId);
        return ResponseEntity.noContent().build();
    }
}