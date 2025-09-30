package com.fitnesscoach.service.legacy;

import com.fitnesscoach.exception.ResourceNotFoundException;
import com.fitnesscoach.model.legacy.Workout;
import com.fitnesscoach.repository.legacy.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WorkoutService {

    @Autowired
    private WorkoutRepository workoutRepository;

    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    public Optional<Workout> getWorkoutById(Long id) {
        return workoutRepository.findById(id);
    }

    public List<Workout> getWorkoutsByUserId(Long userId) {
        return workoutRepository.findByUserId(userId);
    }

    public List<Workout> getWorkoutsByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return workoutRepository.findByUserIdAndScheduledDateBetween(userId, startDate, endDate);
    }

    public List<Workout> getWorkoutsByUserIdAndStatus(Long userId, Workout.WorkoutStatus status) {
        return workoutRepository.findByUserIdAndStatus(userId, status);
    }

    public Workout createWorkout(Workout workout) {
        return workoutRepository.save(workout);
    }

    public Workout updateWorkout(Long id, Workout workoutDetails) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id: " + id));

        if (workoutDetails.getName() != null) {
            workout.setName(workoutDetails.getName());
        }
        if (workoutDetails.getDescription() != null) {
            workout.setDescription(workoutDetails.getDescription());
        }
        if (workoutDetails.getScheduledDate() != null) {
            workout.setScheduledDate(workoutDetails.getScheduledDate());
        }
        if (workoutDetails.getStatus() != null) {
            workout.setStatus(workoutDetails.getStatus());
        }
        if (workoutDetails.getEstimatedDurationMinutes() != null) {
            workout.setEstimatedDurationMinutes(workoutDetails.getEstimatedDurationMinutes());
        }
        if (workoutDetails.getActualDurationMinutes() != null) {
            workout.setActualDurationMinutes(workoutDetails.getActualDurationMinutes());
        }
        if (workoutDetails.getCaloriesBurned() != null) {
            workout.setCaloriesBurned(workoutDetails.getCaloriesBurned());
        }
        if (workoutDetails.getNotes() != null) {
            workout.setNotes(workoutDetails.getNotes());
        }

        return workoutRepository.save(workout);
    }

    public Workout startWorkout(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id: " + id));

        workout.setStatus(Workout.WorkoutStatus.IN_PROGRESS);
        workout.setStartedAt(LocalDateTime.now());

        return workoutRepository.save(workout);
    }

    public Workout completeWorkout(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id: " + id));

        workout.setStatus(Workout.WorkoutStatus.COMPLETED);
        workout.setCompletedAt(LocalDateTime.now());

        if (workout.getStartedAt() != null) {
            long durationMinutes = java.time.Duration.between(workout.getStartedAt(), workout.getCompletedAt()).toMinutes();
            workout.setActualDurationMinutes((int) durationMinutes);
        }

        return workoutRepository.save(workout);
    }

    public void deleteWorkout(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id: " + id));
        workoutRepository.delete(workout);
    }

    public long getCompletedWorkoutsCount(Long userId) {
        return workoutRepository.countByUserIdAndStatus(userId, Workout.WorkoutStatus.COMPLETED);
    }

    public Integer getTotalCaloriesBurned(Long userId) {
        Integer total = workoutRepository.sumCaloriesBurnedByUserId(userId);
        return total != null ? total : 0;
    }
}