package com.fitnesscoach.service;

import com.fitnesscoach.model.Exercise;
import com.fitnesscoach.model.Workout;
import com.fitnesscoach.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutService workoutService;

    @Autowired
    public ExerciseService(ExerciseRepository exerciseRepository, WorkoutService workoutService) {
        this.exerciseRepository = exerciseRepository;
        this.workoutService = workoutService;
    }

    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    public Optional<Exercise> getExerciseById(Long id) {
        return exerciseRepository.findById(id);
    }

    public List<Exercise> getExercisesByWorkoutId(Long workoutId) {
        return exerciseRepository.findByWorkoutIdOrderByCreatedAt(workoutId);
    }

    public List<Exercise> getExercisesByUserId(Long userId) {
        return exerciseRepository.findByUserId(userId);
    }

    public List<Exercise> getExercisesByCategory(Exercise.ExerciseCategory category) {
        return exerciseRepository.findByCategory(category);
    }

    public List<Exercise> getExercisesByMuscleGroup(String muscleGroup) {
        return exerciseRepository.findByMuscleGroup(muscleGroup);
    }

    public List<String> getDistinctMuscleGroups() {
        return exerciseRepository.findDistinctMuscleGroups();
    }

    public Exercise createExercise(Exercise exercise) {
        Workout workout = workoutService.getWorkoutById(exercise.getWorkout().getId())
                .orElseThrow(() -> new RuntimeException("Workout not found with id: " + exercise.getWorkout().getId()));

        exercise.setWorkout(workout);
        return exerciseRepository.save(exercise);
    }

    public Exercise updateExercise(Long id, Exercise exerciseDetails) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found with id: " + id));

        exercise.setName(exerciseDetails.getName());
        exercise.setDescription(exerciseDetails.getDescription());
        exercise.setCategory(exerciseDetails.getCategory());
        exercise.setMuscleGroup(exerciseDetails.getMuscleGroup());
        exercise.setInstructions(exerciseDetails.getInstructions());
        exercise.setRestTimeSeconds(exerciseDetails.getRestTimeSeconds());

        return exerciseRepository.save(exercise);
    }

    public void deleteExercise(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found with id: " + id));
        exerciseRepository.delete(exercise);
    }
}