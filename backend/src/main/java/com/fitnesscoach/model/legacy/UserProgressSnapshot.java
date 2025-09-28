package com.fitnesscoach.model.legacy;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress_snapshots")
public class UserProgressSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Snapshot date is required")
    @Column(name = "snapshot_date", nullable = false)
    private LocalDateTime snapshotDate;

    @PositiveOrZero(message = "Weight must be positive or zero")
    private Double weight;

    @PositiveOrZero(message = "Body fat percentage must be positive or zero")
    @Column(name = "body_fat_percentage")
    private Double bodyFatPercentage;

    @PositiveOrZero(message = "Muscle mass must be positive or zero")
    @Column(name = "muscle_mass")
    private Double muscleMass;

    @PositiveOrZero(message = "Chest measurement must be positive or zero")
    @Column(name = "chest_measurement")
    private Double chestMeasurement;

    @PositiveOrZero(message = "Waist measurement must be positive or zero")
    @Column(name = "waist_measurement")
    private Double waistMeasurement;

    @PositiveOrZero(message = "Hip measurement must be positive or zero")
    @Column(name = "hip_measurement")
    private Double hipMeasurement;

    @PositiveOrZero(message = "Arm measurement must be positive or zero")
    @Column(name = "arm_measurement")
    private Double armMeasurement;

    @PositiveOrZero(message = "Thigh measurement must be positive or zero")
    @Column(name = "thigh_measurement")
    private Double thighMeasurement;

    @PositiveOrZero(message = "Resting heart rate must be positive or zero")
    @Column(name = "resting_heart_rate")
    private Integer restingHeartRate;

    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Enumerated(EnumType.STRING)
    @Column(name = "fitness_level")
    private User.FitnessLevel fitnessLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "energy_level")
    private EnergyLevel energyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "sleep_quality")
    private SleepQuality sleepQuality;

    @PositiveOrZero(message = "Average sleep hours must be positive or zero")
    @Column(name = "average_sleep_hours")
    private Double averageSleepHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "stress_level")
    private StressLevel stressLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_wellness")
    private WellnessRating overallWellness;

    @Column(name = "weekly_workout_frequency")
    private Integer weeklyWorkoutFrequency;

    @Column(name = "total_workouts_completed")
    private Integer totalWorkoutsCompleted;

    @Column(name = "average_workout_duration")
    private Double averageWorkoutDuration;

    @Column(name = "total_calories_burned")
    private Integer totalCaloriesBurned;

    @Column(name = "strength_improvement_percentage")
    private Double strengthImprovementPercentage;

    @Column(name = "endurance_improvement_percentage")
    private Double enduranceImprovementPercentage;

    private String goals;
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserProgressSnapshot() {}

    public UserProgressSnapshot(User user, LocalDateTime snapshotDate) {
        this.user = user;
        this.snapshotDate = snapshotDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getSnapshotDate() {
        return snapshotDate;
    }

    public void setSnapshotDate(LocalDateTime snapshotDate) {
        this.snapshotDate = snapshotDate;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getBodyFatPercentage() {
        return bodyFatPercentage;
    }

    public void setBodyFatPercentage(Double bodyFatPercentage) {
        this.bodyFatPercentage = bodyFatPercentage;
    }

    public Double getMuscleMass() {
        return muscleMass;
    }

    public void setMuscleMass(Double muscleMass) {
        this.muscleMass = muscleMass;
    }

    public Double getChestMeasurement() {
        return chestMeasurement;
    }

    public void setChestMeasurement(Double chestMeasurement) {
        this.chestMeasurement = chestMeasurement;
    }

    public Double getWaistMeasurement() {
        return waistMeasurement;
    }

    public void setWaistMeasurement(Double waistMeasurement) {
        this.waistMeasurement = waistMeasurement;
    }

    public Double getHipMeasurement() {
        return hipMeasurement;
    }

    public void setHipMeasurement(Double hipMeasurement) {
        this.hipMeasurement = hipMeasurement;
    }

    public Double getArmMeasurement() {
        return armMeasurement;
    }

    public void setArmMeasurement(Double armMeasurement) {
        this.armMeasurement = armMeasurement;
    }

    public Double getThighMeasurement() {
        return thighMeasurement;
    }

    public void setThighMeasurement(Double thighMeasurement) {
        this.thighMeasurement = thighMeasurement;
    }

    public Integer getRestingHeartRate() {
        return restingHeartRate;
    }

    public void setRestingHeartRate(Integer restingHeartRate) {
        this.restingHeartRate = restingHeartRate;
    }

    public Integer getBloodPressureSystolic() {
        return bloodPressureSystolic;
    }

    public void setBloodPressureSystolic(Integer bloodPressureSystolic) {
        this.bloodPressureSystolic = bloodPressureSystolic;
    }

    public Integer getBloodPressureDiastolic() {
        return bloodPressureDiastolic;
    }

    public void setBloodPressureDiastolic(Integer bloodPressureDiastolic) {
        this.bloodPressureDiastolic = bloodPressureDiastolic;
    }

    public User.FitnessLevel getFitnessLevel() {
        return fitnessLevel;
    }

    public void setFitnessLevel(User.FitnessLevel fitnessLevel) {
        this.fitnessLevel = fitnessLevel;
    }

    public EnergyLevel getEnergyLevel() {
        return energyLevel;
    }

    public void setEnergyLevel(EnergyLevel energyLevel) {
        this.energyLevel = energyLevel;
    }

    public SleepQuality getSleepQuality() {
        return sleepQuality;
    }

    public void setSleepQuality(SleepQuality sleepQuality) {
        this.sleepQuality = sleepQuality;
    }

    public Double getAverageSleepHours() {
        return averageSleepHours;
    }

    public void setAverageSleepHours(Double averageSleepHours) {
        this.averageSleepHours = averageSleepHours;
    }

    public StressLevel getStressLevel() {
        return stressLevel;
    }

    public void setStressLevel(StressLevel stressLevel) {
        this.stressLevel = stressLevel;
    }

    public WellnessRating getOverallWellness() {
        return overallWellness;
    }

    public void setOverallWellness(WellnessRating overallWellness) {
        this.overallWellness = overallWellness;
    }

    public Integer getWeeklyWorkoutFrequency() {
        return weeklyWorkoutFrequency;
    }

    public void setWeeklyWorkoutFrequency(Integer weeklyWorkoutFrequency) {
        this.weeklyWorkoutFrequency = weeklyWorkoutFrequency;
    }

    public Integer getTotalWorkoutsCompleted() {
        return totalWorkoutsCompleted;
    }

    public void setTotalWorkoutsCompleted(Integer totalWorkoutsCompleted) {
        this.totalWorkoutsCompleted = totalWorkoutsCompleted;
    }

    public Double getAverageWorkoutDuration() {
        return averageWorkoutDuration;
    }

    public void setAverageWorkoutDuration(Double averageWorkoutDuration) {
        this.averageWorkoutDuration = averageWorkoutDuration;
    }

    public Integer getTotalCaloriesBurned() {
        return totalCaloriesBurned;
    }

    public void setTotalCaloriesBurned(Integer totalCaloriesBurned) {
        this.totalCaloriesBurned = totalCaloriesBurned;
    }

    public Double getStrengthImprovementPercentage() {
        return strengthImprovementPercentage;
    }

    public void setStrengthImprovementPercentage(Double strengthImprovementPercentage) {
        this.strengthImprovementPercentage = strengthImprovementPercentage;
    }

    public Double getEnduranceImprovementPercentage() {
        return enduranceImprovementPercentage;
    }

    public void setEnduranceImprovementPercentage(Double enduranceImprovementPercentage) {
        this.enduranceImprovementPercentage = enduranceImprovementPercentage;
    }

    public String getGoals() {
        return goals;
    }

    public void setGoals(String goals) {
        this.goals = goals;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public enum EnergyLevel {
        VERY_LOW, LOW, MODERATE, HIGH, VERY_HIGH
    }

    public enum SleepQuality {
        VERY_POOR, POOR, FAIR, GOOD, EXCELLENT
    }

    public enum StressLevel {
        VERY_LOW, LOW, MODERATE, HIGH, VERY_HIGH
    }

    public enum WellnessRating {
        VERY_POOR, POOR, FAIR, GOOD, EXCELLENT
    }
}