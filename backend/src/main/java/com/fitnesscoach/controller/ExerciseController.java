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
        List<Exercise> exercises = exerciseService.findAll();
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable String id) {
        try {
            java.util.UUID uuid = java.util.UUID.fromString(id);
            Optional<Exercise> exercise = exerciseService.findById(uuid);
            return exercise.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Exercise>> searchExercises(@RequestParam String name) {
        List<Exercise> exercises = exerciseService.searchByName(name);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/muscle/{primaryMuscle}")
    public ResponseEntity<List<Exercise>> getExercisesByMuscle(@PathVariable String primaryMuscle) {
        List<Exercise> exercises = exerciseService.findByPrimaryMuscle(primaryMuscle);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/equipment/{equipment}")
    public ResponseEntity<List<Exercise>> getExercisesByEquipment(@PathVariable String equipment) {
        List<Exercise> exercises = exerciseService.findByEquipment(equipment);
        return ResponseEntity.ok(exercises);
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
    public ResponseEntity<Exercise> updateExercise(@PathVariable String id, @Valid @RequestBody Exercise exerciseDetails) {
        try {
            java.util.UUID uuid = java.util.UUID.fromString(id);
            Exercise updatedExercise = exerciseService.updateExercise(uuid, exerciseDetails);
            return ResponseEntity.ok(updatedExercise);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable String id) {
        try {
            java.util.UUID uuid = java.util.UUID.fromString(id);
            exerciseService.deleteExercise(uuid);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}