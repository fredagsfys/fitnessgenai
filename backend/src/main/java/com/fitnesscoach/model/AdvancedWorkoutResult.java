package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Comprehensive workout session results that track performance across
 * all workout types including time-based workouts, circuits, and complex protocols
 */
@Entity
@Table(name = "advanced_workout_results")
public class AdvancedWorkoutResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private WorkoutSessionTemplate template;

    private LocalDate date;
    private Integer week;
    private Integer programWeek;

    // Session timing
    private Instant startTime;
    private Instant endTime;
    private Integer totalDurationSeconds;
    private Integer workTimeSeconds; // Active work time
    private Integer restTimeSeconds; // Total rest time

    // Overall session metrics
    @Enumerated(EnumType.STRING)
    private SessionCompletionStatus completionStatus;

    private Integer totalReps;
    private Double totalVolumeLoad; // Sum of (reps × weight) for all exercises
    private Double averageRPE;
    private Integer averageHeartRate;
    private Integer maxHeartRate;
    private Integer caloriesBurned;

    // Time-based workout specific metrics
    private Integer totalRounds; // For AMRAP/circuits
    private Integer targetRounds;
    private Boolean completedInTimeLimit; // For time-capped workouts
    private Integer timeRemainingSeconds; // For workouts finished early

    // EMOM specific
    private Integer emomMinutesCompleted;
    private Integer emomMinutesTarget;
    private Integer emomFailedMinutes; // Minutes where target reps weren't completed

    // Tabata specific
    private Integer tabataRoundsCompleted;
    private Integer tabataRoundsTarget;
    private Double tabataAverageReps;

    // Circuit specific
    private Integer circuitRoundsCompleted;
    private Double averageCircuitTime;
    private Integer fastestCircuitTimeSeconds;
    private Integer slowestCircuitTimeSeconds;

    // For Time / AMRAP specific
    private String wodResult; // Final time or rounds+reps
    private Boolean rxCompleted; // Completed as prescribed
    private String scaling; // Any modifications made

    // Strength specific
    private List<Double> personalRecords; // New PRs achieved
    private Double maxWeightLifted;
    private Double estimatedOneRepMax;

    // Performance indicators
    private Double workCapacity; // Total work / time
    private Double powerOutput; // Average power across session
    private Double fatigue; // RPE at end - RPE at start
    private Double consistencyScore; // How consistent performance was

    // Physiological data
    private Integer preWorkoutHeartRate;
    private Integer postWorkoutHeartRate;
    private Integer recoveryHeartRate; // HR after 1 minute rest
    private Double bodyWeight;
    private Integer stepsCount;

    // Environmental factors
    private Double temperature;
    private Integer humidity;
    private String location;
    private String equipment; // Equipment used/available

    // Subjective measures (1-10 scales)
    private Integer energyLevelPre;
    private Integer energyLevelPost;
    private Integer motivation;
    private Integer focus;
    private Integer workoutQuality;
    private Integer workoutEnjoyment;
    private Integer difficultyRating;

    // Sleep and recovery context
    private Double hoursSleptLastNight;
    private Integer sleepQuality; // 1-10
    private Integer stressLevel; // 1-10
    private Integer nutritionQuality; // 1-10
    private Integer hydrationLevel; // 1-10

    // Detailed breakdown by block
    @OneToMany(mappedBy = "workoutResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BlockResult> blockResults = new ArrayList<>();

    // Individual set results
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("blockLabel ASC, blockItemOrder ASC, setNumber ASC")
    private List<AdvancedSetResult> setResults = new ArrayList<>();

    @Column(length = 3000)
    private String notes;

    @Column(length = 1000)
    private String achievements; // What was achieved this session

    @Column(length = 1000)
    private String areasForImprovement;

    @Column(length = 1000)
    private String nextSessionFocus;

    // JSON fields for complex data
    @Column(length = 5000)
    private String detailedMetrics; // JSON for workout-specific detailed data

    @Column(length = 2000)
    private String injuriesOrPain; // Any issues experienced

    public AdvancedWorkoutResult() {
        this.date = LocalDate.now();
        this.startTime = Instant.now();
    }

    public AdvancedWorkoutResult(WorkoutSessionTemplate template) {
        this();
        this.template = template;
    }

    // Session completion status
    public enum SessionCompletionStatus {
        COMPLETED("Completed as planned"),
        PARTIALLY_COMPLETED("Partially completed"),
        MODIFIED("Completed with modifications"),
        TERMINATED_EARLY("Terminated early"),
        SCALED("Scaled down"),
        SCALED_UP("Scaled up"),
        MISSED("Missed session");

        private final String description;

        SessionCompletionStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Static factory methods for different workout types
    public static AdvancedWorkoutResult createForTimeResult(WorkoutSessionTemplate template,
                                                          int totalSeconds, boolean rx) {
        AdvancedWorkoutResult result = new AdvancedWorkoutResult(template);
        result.setCompletionStatus(SessionCompletionStatus.COMPLETED);
        result.setTotalDurationSeconds(totalSeconds);
        result.setWodResult(formatTimeResult(totalSeconds));
        result.setRxCompleted(rx);
        result.setCompletedInTimeLimit(true);
        return result;
    }

    public static AdvancedWorkoutResult createAMRAPResult(WorkoutSessionTemplate template,
                                                        int rounds, int additionalReps,
                                                        int timeCapSeconds) {
        AdvancedWorkoutResult result = new AdvancedWorkoutResult(template);
        result.setCompletionStatus(SessionCompletionStatus.COMPLETED);
        result.setTotalDurationSeconds(timeCapSeconds);
        result.setTotalRounds(rounds);
        result.setWodResult(rounds + "+" + additionalReps);
        result.setCompletedInTimeLimit(true);
        return result;
    }

    public static AdvancedWorkoutResult createEMOMResult(WorkoutSessionTemplate template,
                                                       int minutesCompleted, int targetMinutes,
                                                       int failedMinutes) {
        AdvancedWorkoutResult result = new AdvancedWorkoutResult(template);
        result.setEmomMinutesCompleted(minutesCompleted);
        result.setEmomMinutesTarget(targetMinutes);
        result.setEmomFailedMinutes(failedMinutes);
        result.setCompletionStatus(failedMinutes == 0 ?
            SessionCompletionStatus.COMPLETED : SessionCompletionStatus.PARTIALLY_COMPLETED);
        return result;
    }

    public static AdvancedWorkoutResult createTabataResult(WorkoutSessionTemplate template,
                                                         int roundsCompleted, int targetRounds,
                                                         double averageReps) {
        AdvancedWorkoutResult result = new AdvancedWorkoutResult(template);
        result.setTabataRoundsCompleted(roundsCompleted);
        result.setTabataRoundsTarget(targetRounds);
        result.setTabataAverageReps(averageReps);
        result.setCompletionStatus(roundsCompleted == targetRounds ?
            SessionCompletionStatus.COMPLETED : SessionCompletionStatus.PARTIALLY_COMPLETED);
        return result;
    }

    // Helper methods
    public Duration getSessionDuration() {
        if (startTime != null && endTime != null) {
            return Duration.between(startTime, endTime);
        }
        return Duration.ofSeconds(totalDurationSeconds != null ? totalDurationSeconds : 0);
    }

    public Double getWorkDensity() {
        if (totalDurationSeconds != null && totalDurationSeconds > 0 && workTimeSeconds != null) {
            return (workTimeSeconds.doubleValue() / totalDurationSeconds) * 100;
        }
        return null;
    }

    public Double getAverageRestBetweenSets() {
        if (setResults != null && !setResults.isEmpty() && restTimeSeconds != null) {
            int totalSets = setResults.size();
            return totalSets > 1 ? restTimeSeconds.doubleValue() / (totalSets - 1) : 0.0;
        }
        return null;
    }

    public Double getVolumeLoadPerMinute() {
        if (totalVolumeLoad != null && totalDurationSeconds != null && totalDurationSeconds > 0) {
            return (totalVolumeLoad * 60) / totalDurationSeconds;
        }
        return null;
    }

    public Boolean isPersonalRecord() {
        return personalRecords != null && !personalRecords.isEmpty();
    }

    public String getWorkoutRating() {
        if (workoutQuality != null) {
            if (workoutQuality >= 9) return "Excellent";
            if (workoutQuality >= 7) return "Good";
            if (workoutQuality >= 5) return "Average";
            if (workoutQuality >= 3) return "Poor";
            return "Very Poor";
        }
        return "Not Rated";
    }

    public Double getFatigueScore() {
        if (energyLevelPre != null && energyLevelPost != null) {
            return energyLevelPre - energyLevelPost;
        }
        return null;
    }

    private static String formatTimeResult(int totalSeconds) {
        int minutes = totalSeconds / 60;
        int seconds = totalSeconds % 60;
        return String.format("%d:%02d", minutes, seconds);
    }

    // Calculate metrics from set results
    public void calculateMetricsFromSets() {
        if (setResults != null && !setResults.isEmpty()) {
            // Calculate total reps
            this.totalReps = setResults.stream()
                .mapToInt(set -> set.getPerformedReps() != null ? set.getPerformedReps() : 0)
                .sum();

            // Calculate total volume load
            this.totalVolumeLoad = setResults.stream()
                .mapToDouble(set -> {
                    if (set.getPerformedReps() != null && set.getWeight() != null) {
                        return set.getPerformedReps() * set.getWeight();
                    }
                    return 0.0;
                })
                .sum();

            // Calculate average RPE
            this.averageRPE = setResults.stream()
                .filter(set -> set.getRpe() != null)
                .mapToDouble(AdvancedSetResult::getRpe)
                .average()
                .orElse(0.0);

            // Calculate work time
            this.workTimeSeconds = setResults.stream()
                .mapToInt(set -> set.getWorkTimeSeconds() != null ? set.getWorkTimeSeconds() : 0)
                .sum();
        }
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public WorkoutSessionTemplate getTemplate() { return template; }
    public void setTemplate(WorkoutSessionTemplate template) { this.template = template; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getWeek() { return week; }
    public void setWeek(Integer week) { this.week = week; }

    public Integer getProgramWeek() { return programWeek; }
    public void setProgramWeek(Integer programWeek) { this.programWeek = programWeek; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public Integer getTotalDurationSeconds() { return totalDurationSeconds; }
    public void setTotalDurationSeconds(Integer totalDurationSeconds) { this.totalDurationSeconds = totalDurationSeconds; }

    public Integer getWorkTimeSeconds() { return workTimeSeconds; }
    public void setWorkTimeSeconds(Integer workTimeSeconds) { this.workTimeSeconds = workTimeSeconds; }

    public Integer getRestTimeSeconds() { return restTimeSeconds; }
    public void setRestTimeSeconds(Integer restTimeSeconds) { this.restTimeSeconds = restTimeSeconds; }

    public SessionCompletionStatus getCompletionStatus() { return completionStatus; }
    public void setCompletionStatus(SessionCompletionStatus completionStatus) { this.completionStatus = completionStatus; }

    public Integer getTotalReps() { return totalReps; }
    public void setTotalReps(Integer totalReps) { this.totalReps = totalReps; }

    public Double getTotalVolumeLoad() { return totalVolumeLoad; }
    public void setTotalVolumeLoad(Double totalVolumeLoad) { this.totalVolumeLoad = totalVolumeLoad; }

    public Double getAverageRPE() { return averageRPE; }
    public void setAverageRPE(Double averageRPE) { this.averageRPE = averageRPE; }

    public Integer getAverageHeartRate() { return averageHeartRate; }
    public void setAverageHeartRate(Integer averageHeartRate) { this.averageHeartRate = averageHeartRate; }

    public Integer getMaxHeartRate() { return maxHeartRate; }
    public void setMaxHeartRate(Integer maxHeartRate) { this.maxHeartRate = maxHeartRate; }

    public Integer getCaloriesBurned() { return caloriesBurned; }
    public void setCaloriesBurned(Integer caloriesBurned) { this.caloriesBurned = caloriesBurned; }

    public Integer getTotalRounds() { return totalRounds; }
    public void setTotalRounds(Integer totalRounds) { this.totalRounds = totalRounds; }

    public Integer getTargetRounds() { return targetRounds; }
    public void setTargetRounds(Integer targetRounds) { this.targetRounds = targetRounds; }

    public Boolean getCompletedInTimeLimit() { return completedInTimeLimit; }
    public void setCompletedInTimeLimit(Boolean completedInTimeLimit) { this.completedInTimeLimit = completedInTimeLimit; }

    public Integer getTimeRemainingSeconds() { return timeRemainingSeconds; }
    public void setTimeRemainingSeconds(Integer timeRemainingSeconds) { this.timeRemainingSeconds = timeRemainingSeconds; }

    public Integer getEmomMinutesCompleted() { return emomMinutesCompleted; }
    public void setEmomMinutesCompleted(Integer emomMinutesCompleted) { this.emomMinutesCompleted = emomMinutesCompleted; }

    public Integer getEmomMinutesTarget() { return emomMinutesTarget; }
    public void setEmomMinutesTarget(Integer emomMinutesTarget) { this.emomMinutesTarget = emomMinutesTarget; }

    public Integer getEmomFailedMinutes() { return emomFailedMinutes; }
    public void setEmomFailedMinutes(Integer emomFailedMinutes) { this.emomFailedMinutes = emomFailedMinutes; }

    public Integer getTabataRoundsCompleted() { return tabataRoundsCompleted; }
    public void setTabataRoundsCompleted(Integer tabataRoundsCompleted) { this.tabataRoundsCompleted = tabataRoundsCompleted; }

    public Integer getTabataRoundsTarget() { return tabataRoundsTarget; }
    public void setTabataRoundsTarget(Integer tabataRoundsTarget) { this.tabataRoundsTarget = tabataRoundsTarget; }

    public Double getTabataAverageReps() { return tabataAverageReps; }
    public void setTabataAverageReps(Double tabataAverageReps) { this.tabataAverageReps = tabataAverageReps; }

    public Integer getCircuitRoundsCompleted() { return circuitRoundsCompleted; }
    public void setCircuitRoundsCompleted(Integer circuitRoundsCompleted) { this.circuitRoundsCompleted = circuitRoundsCompleted; }

    public Double getAverageCircuitTime() { return averageCircuitTime; }
    public void setAverageCircuitTime(Double averageCircuitTime) { this.averageCircuitTime = averageCircuitTime; }

    public Integer getFastestCircuitTimeSeconds() { return fastestCircuitTimeSeconds; }
    public void setFastestCircuitTimeSeconds(Integer fastestCircuitTimeSeconds) { this.fastestCircuitTimeSeconds = fastestCircuitTimeSeconds; }

    public Integer getSlowestCircuitTimeSeconds() { return slowestCircuitTimeSeconds; }
    public void setSlowestCircuitTimeSeconds(Integer slowestCircuitTimeSeconds) { this.slowestCircuitTimeSeconds = slowestCircuitTimeSeconds; }

    public String getWodResult() { return wodResult; }
    public void setWodResult(String wodResult) { this.wodResult = wodResult; }

    public Boolean getRxCompleted() { return rxCompleted; }
    public void setRxCompleted(Boolean rxCompleted) { this.rxCompleted = rxCompleted; }

    public String getScaling() { return scaling; }
    public void setScaling(String scaling) { this.scaling = scaling; }

    public List<Double> getPersonalRecords() { return personalRecords; }
    public void setPersonalRecords(List<Double> personalRecords) { this.personalRecords = personalRecords; }

    public Double getMaxWeightLifted() { return maxWeightLifted; }
    public void setMaxWeightLifted(Double maxWeightLifted) { this.maxWeightLifted = maxWeightLifted; }

    public Double getEstimatedOneRepMax() { return estimatedOneRepMax; }
    public void setEstimatedOneRepMax(Double estimatedOneRepMax) { this.estimatedOneRepMax = estimatedOneRepMax; }

    public Double getWorkCapacity() { return workCapacity; }
    public void setWorkCapacity(Double workCapacity) { this.workCapacity = workCapacity; }

    public Double getPowerOutput() { return powerOutput; }
    public void setPowerOutput(Double powerOutput) { this.powerOutput = powerOutput; }

    public Double getFatigue() { return fatigue; }
    public void setFatigue(Double fatigue) { this.fatigue = fatigue; }

    public Double getConsistencyScore() { return consistencyScore; }
    public void setConsistencyScore(Double consistencyScore) { this.consistencyScore = consistencyScore; }

    public Integer getPreWorkoutHeartRate() { return preWorkoutHeartRate; }
    public void setPreWorkoutHeartRate(Integer preWorkoutHeartRate) { this.preWorkoutHeartRate = preWorkoutHeartRate; }

    public Integer getPostWorkoutHeartRate() { return postWorkoutHeartRate; }
    public void setPostWorkoutHeartRate(Integer postWorkoutHeartRate) { this.postWorkoutHeartRate = postWorkoutHeartRate; }

    public Integer getRecoveryHeartRate() { return recoveryHeartRate; }
    public void setRecoveryHeartRate(Integer recoveryHeartRate) { this.recoveryHeartRate = recoveryHeartRate; }

    public Double getBodyWeight() { return bodyWeight; }
    public void setBodyWeight(Double bodyWeight) { this.bodyWeight = bodyWeight; }

    public Integer getStepsCount() { return stepsCount; }
    public void setStepsCount(Integer stepsCount) { this.stepsCount = stepsCount; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Integer getHumidity() { return humidity; }
    public void setHumidity(Integer humidity) { this.humidity = humidity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }

    public Integer getEnergyLevelPre() { return energyLevelPre; }
    public void setEnergyLevelPre(Integer energyLevelPre) { this.energyLevelPre = energyLevelPre; }

    public Integer getEnergyLevelPost() { return energyLevelPost; }
    public void setEnergyLevelPost(Integer energyLevelPost) { this.energyLevelPost = energyLevelPost; }

    public Integer getMotivation() { return motivation; }
    public void setMotivation(Integer motivation) { this.motivation = motivation; }

    public Integer getFocus() { return focus; }
    public void setFocus(Integer focus) { this.focus = focus; }

    public Integer getWorkoutQuality() { return workoutQuality; }
    public void setWorkoutQuality(Integer workoutQuality) { this.workoutQuality = workoutQuality; }

    public Integer getWorkoutEnjoyment() { return workoutEnjoyment; }
    public void setWorkoutEnjoyment(Integer workoutEnjoyment) { this.workoutEnjoyment = workoutEnjoyment; }

    public Integer getDifficultyRating() { return difficultyRating; }
    public void setDifficultyRating(Integer difficultyRating) { this.difficultyRating = difficultyRating; }

    public Double getHoursSleptLastNight() { return hoursSleptLastNight; }
    public void setHoursSleptLastNight(Double hoursSleptLastNight) { this.hoursSleptLastNight = hoursSleptLastNight; }

    public Integer getSleepQuality() { return sleepQuality; }
    public void setSleepQuality(Integer sleepQuality) { this.sleepQuality = sleepQuality; }

    public Integer getStressLevel() { return stressLevel; }
    public void setStressLevel(Integer stressLevel) { this.stressLevel = stressLevel; }

    public Integer getNutritionQuality() { return nutritionQuality; }
    public void setNutritionQuality(Integer nutritionQuality) { this.nutritionQuality = nutritionQuality; }

    public Integer getHydrationLevel() { return hydrationLevel; }
    public void setHydrationLevel(Integer hydrationLevel) { this.hydrationLevel = hydrationLevel; }

    public List<BlockResult> getBlockResults() { return blockResults; }
    public void setBlockResults(List<BlockResult> blockResults) { this.blockResults = blockResults; }

    public List<AdvancedSetResult> getSetResults() { return setResults; }
    public void setSetResults(List<AdvancedSetResult> setResults) { this.setResults = setResults; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAchievements() { return achievements; }
    public void setAchievements(String achievements) { this.achievements = achievements; }

    public String getAreasForImprovement() { return areasForImprovement; }
    public void setAreasForImprovement(String areasForImprovement) { this.areasForImprovement = areasForImprovement; }

    public String getNextSessionFocus() { return nextSessionFocus; }
    public void setNextSessionFocus(String nextSessionFocus) { this.nextSessionFocus = nextSessionFocus; }

    public String getDetailedMetrics() { return detailedMetrics; }
    public void setDetailedMetrics(String detailedMetrics) { this.detailedMetrics = detailedMetrics; }

    public String getInjuriesOrPain() { return injuriesOrPain; }
    public void setInjuriesOrPain(String injuriesOrPain) { this.injuriesOrPain = injuriesOrPain; }
}