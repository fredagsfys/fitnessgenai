package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Enhanced result tracking that supports all advanced workout types
 * including time-based workouts, circuits, supersets, and complex protocols
 */
@Entity
@Table(name = "advanced_set_results")
public class AdvancedSetResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private WorkoutSession session;

    @ManyToOne
    private BlockItem plannedItem;

    // Basic identification
    private String blockLabel;
    private int blockItemOrder;
    private int setNumber;
    private int roundNumber; // For circuits/AMRAP

    @ManyToOne(optional = false)
    private Exercise exercise;

    // Result type
    @Enumerated(EnumType.STRING)
    private ResultType resultType;

    // Traditional strength metrics
    private Integer performedReps;
    private Integer targetReps;
    private Double weight;
    @Enumerated(EnumType.STRING)
    private WeightUnit weightUnit = WeightUnit.KG;

    // Time-based metrics
    private Integer workTimeSeconds;
    private Integer restTimeSeconds;
    private Integer totalTimeSeconds;
    private Instant startTime;
    private Instant endTime;

    // Performance metrics
    private Double rpe; // Rate of Perceived Exertion (1-10)
    private Integer repsInReserve; // RIR
    private Double distance;
    private String distanceUnit;
    private Integer heartRateAvg;
    private Integer heartRateMax;

    // Time-based workout specific
    private Integer completedRounds; // For AMRAP/circuits
    private Integer targetRounds;
    private Boolean completedInTime; // For EMOM/Tabata
    private Integer secondsRemaining; // For EMOM
    private Integer intervalNumber; // For Tabata/EMOM

    // Drop set tracking
    private Integer dropStage; // Which drop set stage (1, 2, 3, etc.)
    private List<Integer> dropSetReps; // Reps in each drop stage
    private List<Double> dropSetWeights; // Weights in each drop stage

    // Superset/circuit tracking
    private Integer supersetPosition;
    private Integer circuitPosition;
    private Integer restBetweenExercisesSeconds;

    // Complex set tracking
    private Boolean isClusterSet;
    private Integer clusterNumber;
    private Integer restPauseNumber;

    // Technical performance
    private Double velocity; // Bar velocity (m/s)
    private Double power; // Power output (watts)
    private Double rangeOfMotion; // ROM percentage
    private Double formScore; // 1-10 technique rating

    // Failure and completion tracking
    private Boolean reachedFailure;
    private String failureReason; // "muscular", "cardiovascular", "technique", etc.
    private Boolean completedAsPlanned;
    private Integer missedReps;

    // Environmental factors
    private Double temperature;
    private Integer humidity;
    private String equipment; // Actual equipment used
    private String modifications; // Any modifications made

    // Subjective measures
    private Integer energyLevel; // 1-10 pre-exercise energy
    private Integer motivation; // 1-10 motivation level
    private Integer focus; // 1-10 focus/concentration

    @Column(length = 2000)
    private String comments;

    @Column(length = 1000)
    private String technicalNotes; // Form cues, technique notes

    private Instant completedAt;

    // JSON field for complex data
    @Column(length = 4000)
    private String additionalData; // JSON for workout-specific data

    public AdvancedSetResult() {
        this.completedAt = Instant.now();
    }

    public AdvancedSetResult(WorkoutSession session, Exercise exercise, String blockLabel,
                           int blockItemOrder, int setNumber, ResultType resultType) {
        this.session = session;
        this.exercise = exercise;
        this.blockLabel = blockLabel;
        this.blockItemOrder = blockItemOrder;
        this.setNumber = setNumber;
        this.resultType = resultType;
        this.completedAt = Instant.now();
    }

    // Result type enumeration
    public enum ResultType {
        STRAIGHT_SET("Traditional Set"),
        SUPERSET("Superset"),
        CIRCUIT("Circuit"),
        TABATA("Tabata Round"),
        EMOM("EMOM Round"),
        AMRAP("AMRAP Round"),
        FOR_TIME("For Time"),
        DROP_SET("Drop Set"),
        CLUSTER_SET("Cluster Set"),
        REST_PAUSE("Rest-Pause"),
        PYRAMID("Pyramid Set"),
        COMPLEX("Complex Set"),
        ISOMETRIC("Isometric Hold"),
        PLYOMETRIC("Plyometric"),
        CARDIO("Cardio"),
        TIME_TRIAL("Time Trial"),
        MAX_EFFORT("Max Effort"),
        DYNAMIC_EFFORT("Dynamic Effort"),
        SKILL_PRACTICE("Skill Practice"),
        CUSTOM("Custom");

        private final String displayName;

        ResultType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Static factory methods for different result types
    public static AdvancedSetResult createTraditionalSet(WorkoutSession session, Exercise exercise,
                                                       String blockLabel, int order, int setNumber,
                                                       int reps, double weight) {
        AdvancedSetResult result = new AdvancedSetResult(session, exercise, blockLabel, order, setNumber, ResultType.STRAIGHT_SET);
        result.setPerformedReps(reps);
        result.setWeight(weight);
        return result;
    }

    public static AdvancedSetResult createTabataRound(WorkoutSession session, Exercise exercise,
                                                    String blockLabel, int order, int round,
                                                    int reps, int workTime, int restTime) {
        AdvancedSetResult result = new AdvancedSetResult(session, exercise, blockLabel, order, round, ResultType.TABATA);
        result.setPerformedReps(reps);
        result.setWorkTimeSeconds(workTime);
        result.setRestTimeSeconds(restTime);
        result.setIntervalNumber(round);
        return result;
    }

    public static AdvancedSetResult createEMOMRound(WorkoutSession session, Exercise exercise,
                                                  String blockLabel, int order, int minute,
                                                  int reps, int secondsRemaining) {
        AdvancedSetResult result = new AdvancedSetResult(session, exercise, blockLabel, order, minute, ResultType.EMOM);
        result.setPerformedReps(reps);
        result.setSecondsRemaining(secondsRemaining);
        result.setIntervalNumber(minute);
        result.setCompletedInTime(secondsRemaining >= 0);
        return result;
    }

    public static AdvancedSetResult createAMRAPRound(WorkoutSession session, Exercise exercise,
                                                   String blockLabel, int order, int round,
                                                   int totalRounds, int totalTime) {
        AdvancedSetResult result = new AdvancedSetResult(session, exercise, blockLabel, order, round, ResultType.AMRAP);
        result.setCompletedRounds(totalRounds);
        result.setTotalTimeSeconds(totalTime);
        result.setRoundNumber(round);
        return result;
    }

    public static AdvancedSetResult createDropSet(WorkoutSession session, Exercise exercise,
                                                String blockLabel, int order, int setNumber,
                                                List<Integer> repsPerDrop, List<Double> weightsPerDrop) {
        AdvancedSetResult result = new AdvancedSetResult(session, exercise, blockLabel, order, setNumber, ResultType.DROP_SET);
        result.setDropSetReps(repsPerDrop);
        result.setDropSetWeights(weightsPerDrop);
        result.setPerformedReps(repsPerDrop.stream().mapToInt(Integer::intValue).sum());
        return result;
    }

    public static AdvancedSetResult createCircuitExercise(WorkoutSession session, Exercise exercise,
                                                        String blockLabel, int order, int position,
                                                        int reps, int workTime) {
        AdvancedSetResult result = new AdvancedSetResult(session, exercise, blockLabel, order, position, ResultType.CIRCUIT);
        result.setPerformedReps(reps);
        result.setWorkTimeSeconds(workTime);
        result.setCircuitPosition(position);
        return result;
    }

    // Helper methods
    public Duration getWorkDuration() {
        if (startTime != null && endTime != null) {
            return Duration.between(startTime, endTime);
        }
        return Duration.ofSeconds(workTimeSeconds != null ? workTimeSeconds : 0);
    }

    public Double getAverageRepsPerMinute() {
        if (totalTimeSeconds != null && totalTimeSeconds > 0 && performedReps != null) {
            return (performedReps * 60.0) / totalTimeSeconds;
        }
        return null;
    }

    public boolean isPersonalRecord() {
        // This would need to be calculated by comparing with historical data
        // Implementation would query database for previous best performance
        return false; // Placeholder
    }

    public Double getVolumeLoad() {
        if (performedReps != null && weight != null) {
            return performedReps * weight;
        }
        return null;
    }

    public Integer getTotalRepsAllDrops() {
        if (dropSetReps != null && !dropSetReps.isEmpty()) {
            return dropSetReps.stream().mapToInt(Integer::intValue).sum();
        }
        return performedReps;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public WorkoutSession getSession() { return session; }
    public void setSession(WorkoutSession session) { this.session = session; }

    public BlockItem getPlannedItem() { return plannedItem; }
    public void setPlannedItem(BlockItem plannedItem) { this.plannedItem = plannedItem; }

    public String getBlockLabel() { return blockLabel; }
    public void setBlockLabel(String blockLabel) { this.blockLabel = blockLabel; }

    public int getBlockItemOrder() { return blockItemOrder; }
    public void setBlockItemOrder(int blockItemOrder) { this.blockItemOrder = blockItemOrder; }

    public int getSetNumber() { return setNumber; }
    public void setSetNumber(int setNumber) { this.setNumber = setNumber; }

    public int getRoundNumber() { return roundNumber; }
    public void setRoundNumber(int roundNumber) { this.roundNumber = roundNumber; }

    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    public ResultType getResultType() { return resultType; }
    public void setResultType(ResultType resultType) { this.resultType = resultType; }

    public Integer getPerformedReps() { return performedReps; }
    public void setPerformedReps(Integer performedReps) { this.performedReps = performedReps; }

    public Integer getTargetReps() { return targetReps; }
    public void setTargetReps(Integer targetReps) { this.targetReps = targetReps; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public WeightUnit getWeightUnit() { return weightUnit; }
    public void setWeightUnit(WeightUnit weightUnit) { this.weightUnit = weightUnit; }

    public Integer getWorkTimeSeconds() { return workTimeSeconds; }
    public void setWorkTimeSeconds(Integer workTimeSeconds) { this.workTimeSeconds = workTimeSeconds; }

    public Integer getRestTimeSeconds() { return restTimeSeconds; }
    public void setRestTimeSeconds(Integer restTimeSeconds) { this.restTimeSeconds = restTimeSeconds; }

    public Integer getTotalTimeSeconds() { return totalTimeSeconds; }
    public void setTotalTimeSeconds(Integer totalTimeSeconds) { this.totalTimeSeconds = totalTimeSeconds; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public Double getRpe() { return rpe; }
    public void setRpe(Double rpe) { this.rpe = rpe; }

    public Integer getRepsInReserve() { return repsInReserve; }
    public void setRepsInReserve(Integer repsInReserve) { this.repsInReserve = repsInReserve; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getDistanceUnit() { return distanceUnit; }
    public void setDistanceUnit(String distanceUnit) { this.distanceUnit = distanceUnit; }

    public Integer getHeartRateAvg() { return heartRateAvg; }
    public void setHeartRateAvg(Integer heartRateAvg) { this.heartRateAvg = heartRateAvg; }

    public Integer getHeartRateMax() { return heartRateMax; }
    public void setHeartRateMax(Integer heartRateMax) { this.heartRateMax = heartRateMax; }

    public Integer getCompletedRounds() { return completedRounds; }
    public void setCompletedRounds(Integer completedRounds) { this.completedRounds = completedRounds; }

    public Integer getTargetRounds() { return targetRounds; }
    public void setTargetRounds(Integer targetRounds) { this.targetRounds = targetRounds; }

    public Boolean getCompletedInTime() { return completedInTime; }
    public void setCompletedInTime(Boolean completedInTime) { this.completedInTime = completedInTime; }

    public Integer getSecondsRemaining() { return secondsRemaining; }
    public void setSecondsRemaining(Integer secondsRemaining) { this.secondsRemaining = secondsRemaining; }

    public Integer getIntervalNumber() { return intervalNumber; }
    public void setIntervalNumber(Integer intervalNumber) { this.intervalNumber = intervalNumber; }

    public Integer getDropStage() { return dropStage; }
    public void setDropStage(Integer dropStage) { this.dropStage = dropStage; }

    public List<Integer> getDropSetReps() { return dropSetReps; }
    public void setDropSetReps(List<Integer> dropSetReps) { this.dropSetReps = dropSetReps; }

    public List<Double> getDropSetWeights() { return dropSetWeights; }
    public void setDropSetWeights(List<Double> dropSetWeights) { this.dropSetWeights = dropSetWeights; }

    public Integer getSupersetPosition() { return supersetPosition; }
    public void setSupersetPosition(Integer supersetPosition) { this.supersetPosition = supersetPosition; }

    public Integer getCircuitPosition() { return circuitPosition; }
    public void setCircuitPosition(Integer circuitPosition) { this.circuitPosition = circuitPosition; }

    public Integer getRestBetweenExercisesSeconds() { return restBetweenExercisesSeconds; }
    public void setRestBetweenExercisesSeconds(Integer restBetweenExercisesSeconds) { this.restBetweenExercisesSeconds = restBetweenExercisesSeconds; }

    public Boolean getIsClusterSet() { return isClusterSet; }
    public void setIsClusterSet(Boolean isClusterSet) { this.isClusterSet = isClusterSet; }

    public Integer getClusterNumber() { return clusterNumber; }
    public void setClusterNumber(Integer clusterNumber) { this.clusterNumber = clusterNumber; }

    public Integer getRestPauseNumber() { return restPauseNumber; }
    public void setRestPauseNumber(Integer restPauseNumber) { this.restPauseNumber = restPauseNumber; }

    public Double getVelocity() { return velocity; }
    public void setVelocity(Double velocity) { this.velocity = velocity; }

    public Double getPower() { return power; }
    public void setPower(Double power) { this.power = power; }

    public Double getRangeOfMotion() { return rangeOfMotion; }
    public void setRangeOfMotion(Double rangeOfMotion) { this.rangeOfMotion = rangeOfMotion; }

    public Double getFormScore() { return formScore; }
    public void setFormScore(Double formScore) { this.formScore = formScore; }

    public Boolean getReachedFailure() { return reachedFailure; }
    public void setReachedFailure(Boolean reachedFailure) { this.reachedFailure = reachedFailure; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public Boolean getCompletedAsPlanned() { return completedAsPlanned; }
    public void setCompletedAsPlanned(Boolean completedAsPlanned) { this.completedAsPlanned = completedAsPlanned; }

    public Integer getMissedReps() { return missedReps; }
    public void setMissedReps(Integer missedReps) { this.missedReps = missedReps; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Integer getHumidity() { return humidity; }
    public void setHumidity(Integer humidity) { this.humidity = humidity; }

    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }

    public String getModifications() { return modifications; }
    public void setModifications(String modifications) { this.modifications = modifications; }

    public Integer getEnergyLevel() { return energyLevel; }
    public void setEnergyLevel(Integer energyLevel) { this.energyLevel = energyLevel; }

    public Integer getMotivation() { return motivation; }
    public void setMotivation(Integer motivation) { this.motivation = motivation; }

    public Integer getFocus() { return focus; }
    public void setFocus(Integer focus) { this.focus = focus; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getTechnicalNotes() { return technicalNotes; }
    public void setTechnicalNotes(String technicalNotes) { this.technicalNotes = technicalNotes; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public String getAdditionalData() { return additionalData; }
    public void setAdditionalData(String additionalData) { this.additionalData = additionalData; }
}