package com.fitnesscoach.model.legacy;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workout_results")
public class WorkoutResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id", nullable = false, unique = true)
    private Workout workout;

    @NotNull(message = "Completion date is required")
    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @PositiveOrZero(message = "Actual duration must be positive or zero")
    @Column(name = "actual_duration_minutes")
    private Integer actualDurationMinutes;

    @PositiveOrZero(message = "Calories burned must be positive or zero")
    @Column(name = "actual_calories_burned")
    private Integer actualCaloriesBurned;

    @PositiveOrZero(message = "Average heart rate must be positive or zero")
    @Column(name = "average_heart_rate")
    private Integer averageHeartRate;

    @PositiveOrZero(message = "Max heart rate must be positive or zero")
    @Column(name = "max_heart_rate")
    private Integer maxHeartRate;

    @Column(name = "perceived_exertion")
    private Integer perceivedExertion; // RPE scale 1-10

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_rating")
    private DifficultyRating difficultyRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "mood_after")
    private MoodRating moodAfter;

    @Column(name = "total_volume")
    private Double totalVolume; // Weight x Reps for strength workouts

    @Column(name = "personal_records")
    private Integer personalRecords; // Number of PRs achieved

    private String notes;

    @Column(name = "weather_conditions")
    private String weatherConditions;

    @Column(name = "workout_location")
    private String workoutLocation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public WorkoutResult() {}

    public WorkoutResult(Workout workout, LocalDateTime completedAt) {
        this.workout = workout;
        this.completedAt = completedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Workout getWorkout() {
        return workout;
    }

    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Integer getActualDurationMinutes() {
        return actualDurationMinutes;
    }

    public void setActualDurationMinutes(Integer actualDurationMinutes) {
        this.actualDurationMinutes = actualDurationMinutes;
    }

    public Integer getActualCaloriesBurned() {
        return actualCaloriesBurned;
    }

    public void setActualCaloriesBurned(Integer actualCaloriesBurned) {
        this.actualCaloriesBurned = actualCaloriesBurned;
    }

    public Integer getAverageHeartRate() {
        return averageHeartRate;
    }

    public void setAverageHeartRate(Integer averageHeartRate) {
        this.averageHeartRate = averageHeartRate;
    }

    public Integer getMaxHeartRate() {
        return maxHeartRate;
    }

    public void setMaxHeartRate(Integer maxHeartRate) {
        this.maxHeartRate = maxHeartRate;
    }

    public Integer getPerceivedExertion() {
        return perceivedExertion;
    }

    public void setPerceivedExertion(Integer perceivedExertion) {
        this.perceivedExertion = perceivedExertion;
    }

    public DifficultyRating getDifficultyRating() {
        return difficultyRating;
    }

    public void setDifficultyRating(DifficultyRating difficultyRating) {
        this.difficultyRating = difficultyRating;
    }

    public MoodRating getMoodAfter() {
        return moodAfter;
    }

    public void setMoodAfter(MoodRating moodAfter) {
        this.moodAfter = moodAfter;
    }

    public Double getTotalVolume() {
        return totalVolume;
    }

    public void setTotalVolume(Double totalVolume) {
        this.totalVolume = totalVolume;
    }

    public Integer getPersonalRecords() {
        return personalRecords;
    }

    public void setPersonalRecords(Integer personalRecords) {
        this.personalRecords = personalRecords;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getWeatherConditions() {
        return weatherConditions;
    }

    public void setWeatherConditions(String weatherConditions) {
        this.weatherConditions = weatherConditions;
    }

    public String getWorkoutLocation() {
        return workoutLocation;
    }

    public void setWorkoutLocation(String workoutLocation) {
        this.workoutLocation = workoutLocation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public enum DifficultyRating {
        VERY_EASY, EASY, MODERATE, HARD, VERY_HARD
    }

    public enum MoodRating {
        TERRIBLE, POOR, NEUTRAL, GOOD, EXCELLENT
    }
}