package com.fitnesscoach.service;

import com.fitnesscoach.model.Exercise;
import com.fitnesscoach.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    @Autowired
    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public Exercise createExercise(Exercise exercise) {
        return exerciseRepository.save(exercise);
    }

    public Exercise createExercise(String name, String primaryMuscle, String equipment) {
        Exercise exercise = new Exercise(name);
        exercise.setPrimaryMuscle(primaryMuscle);
        exercise.setEquipment(equipment);
        return exerciseRepository.save(exercise);
    }

    @Transactional(readOnly = true)
    public Optional<Exercise> findById(UUID id) {
        return exerciseRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Exercise> findByName(String name) {
        return exerciseRepository.findByName(name);
    }

    @Transactional(readOnly = true)
    public List<Exercise> findAll() {
        return exerciseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Exercise> findByPrimaryMuscle(String primaryMuscle) {
        return exerciseRepository.findByPrimaryMuscle(primaryMuscle);
    }

    @Transactional(readOnly = true)
    public List<Exercise> findByEquipment(String equipment) {
        return exerciseRepository.findByEquipment(equipment);
    }

    @Transactional(readOnly = true)
    public List<Exercise> searchByName(String searchTerm) {
        return exerciseRepository.findByNameContainingIgnoreCase(searchTerm);
    }

    public Exercise updateExercise(UUID id, Exercise exerciseDetails) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found with id: " + id));

        exercise.setName(exerciseDetails.getName());
        exercise.setPrimaryMuscle(exerciseDetails.getPrimaryMuscle());
        exercise.setEquipment(exerciseDetails.getEquipment());
        exercise.setNotes(exerciseDetails.getNotes());

        return exerciseRepository.save(exercise);
    }

    public void deleteExercise(UUID id) {
        if (!exerciseRepository.existsById(id)) {
            throw new RuntimeException("Exercise not found with id: " + id);
        }
        exerciseRepository.deleteById(id);
    }

    public Exercise getOrCreateExercise(String name, String primaryMuscle, String equipment) {
        return findByName(name)
                .orElseGet(() -> createExercise(name, primaryMuscle, equipment));
    }
}