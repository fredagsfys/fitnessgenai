package com.fitnesscoach.service;

import com.fitnesscoach.model.User;
import com.fitnesscoach.model.Workout;
import com.fitnesscoach.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserService userService;

    @Autowired
    public WorkoutService(WorkoutRepository workoutRepository, UserService userService) {
        this.workoutRepository = workoutRepository;
        this.userService = userService;
    }

    public List<Workout> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    public Optional<Workout> getWorkoutById(Long id) {
        return workoutRepository.findById(id);
    }

    public List<Workout> getWorkoutsByUserId(Long userId) {
        return workoutRepository.findByUserIdOrderByWorkoutDateDesc(userId);
    }

    public List<Workout> getWorkoutsByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return workoutRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    public List<Workout> getWorkoutsByUserIdAndStatus(Long userId, Workout.WorkoutStatus status) {
        return workoutRepository.findByUserIdAndStatus(userId, status);
    }

    public Workout createWorkout(Workout workout) {
        User user = userService.getUserById(workout.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + workout.getUser().getId()));

        workout.setUser(user);
        if (workout.getStatus() == null) {
            workout.setStatus(Workout.WorkoutStatus.PLANNED);
        }

        return workoutRepository.save(workout);
    }

    public Workout updateWorkout(Long id, Workout workoutDetails) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found with id: " + id));

        workout.setName(workoutDetails.getName());
        workout.setDescription(workoutDetails.getDescription());
        workout.setWorkoutDate(workoutDetails.getWorkoutDate());
        workout.setDurationMinutes(workoutDetails.getDurationMinutes());
        workout.setCaloriesBurned(workoutDetails.getCaloriesBurned());
        workout.setType(workoutDetails.getType());
        workout.setStatus(workoutDetails.getStatus());
        workout.setNotes(workoutDetails.getNotes());

        return workoutRepository.save(workout);
    }

    public Workout startWorkout(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found with id: " + id));

        workout.setStatus(Workout.WorkoutStatus.IN_PROGRESS);
        return workoutRepository.save(workout);
    }

    public Workout completeWorkout(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found with id: " + id));

        workout.setStatus(Workout.WorkoutStatus.COMPLETED);
        return workoutRepository.save(workout);
    }

    public void deleteWorkout(Long id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found with id: " + id));
        workoutRepository.delete(workout);
    }

    public long getCompletedWorkoutsCount(Long userId) {
        return workoutRepository.countCompletedWorkoutsByUserId(userId);
    }

    public Integer getTotalCaloriesBurned(Long userId) {
        Integer calories = workoutRepository.getTotalCaloriesBurnedByUserId(userId);
        return calories != null ? calories : 0;
    }
}