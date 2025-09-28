package com.fitnesscoach.controller;

import com.fitnesscoach.model.Exercise;
import com.fitnesscoach.service.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    @Autowired
    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises() {
        List<Exercise> exercises = exerciseService.getAllExercises();
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable Long id) {
        Optional<Exercise> exercise = exerciseService.getExerciseById(id);
        return exercise.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/workout/{workoutId}")
    public ResponseEntity<List<Exercise>> getExercisesByWorkoutId(@PathVariable Long workoutId) {
        List<Exercise> exercises = exerciseService.getExercisesByWorkoutId(workoutId);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Exercise>> getExercisesByUserId(@PathVariable Long userId) {
        List<Exercise> exercises = exerciseService.getExercisesByUserId(userId);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Exercise>> getExercisesByCategory(@PathVariable Exercise.ExerciseCategory category) {
        List<Exercise> exercises = exerciseService.getExercisesByCategory(category);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/muscle-group/{muscleGroup}")
    public ResponseEntity<List<Exercise>> getExercisesByMuscleGroup(@PathVariable String muscleGroup) {
        List<Exercise> exercises = exerciseService.getExercisesByMuscleGroup(muscleGroup);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/muscle-groups")
    public ResponseEntity<List<String>> getDistinctMuscleGroups() {
        List<String> muscleGroups = exerciseService.getDistinctMuscleGroups();
        return ResponseEntity.ok(muscleGroups);
    }

    @PostMapping
    public ResponseEntity<Exercise> createExercise(@Valid @RequestBody Exercise exercise) {
        try {
            Exercise createdExercise = exerciseService.createExercise(exercise);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdExercise);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercise> updateExercise(@PathVariable Long id, @Valid @RequestBody Exercise exerciseDetails) {
        try {
            Exercise updatedExercise = exerciseService.updateExercise(id, exerciseDetails);
            return ResponseEntity.ok(updatedExercise);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        try {
            exerciseService.deleteExercise(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}