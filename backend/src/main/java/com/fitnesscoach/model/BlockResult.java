package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Tracks performance results for individual exercise blocks
 * Supports all block types: supersets, circuits, EMOM, Tabata, etc.
 */
@Entity
@Table(name = "block_results")
public class BlockResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private AdvancedWorkoutResult workoutResult;

    @ManyToOne
    private ExerciseBlock plannedBlock;

    private String blockLabel;
    private int blockOrder;

    @Enumerated(EnumType.STRING)
    private ExerciseBlock.BlockType blockType;

    // Timing
    private Instant startTime;
    private Instant endTime;
    private Integer totalTimeSeconds;
    private Integer workTimeSeconds;
    private Integer restTimeSeconds;

    // Completion tracking
    private Boolean completedAsPlanned;
    private Integer targetRounds;
    private Integer completedRounds;
    private Double completionPercentage;

    // Block-specific metrics
    // EMOM
    private Integer emomMinutesCompleted;
    private Integer emomMinutesTarget;
    private Integer emomFailedMinutes;

    // Tabata
    private Integer tabataRoundsCompleted;
    private Double tabataAverageReps;

    // Circuit
    private Double averageRoundTime;
    private Integer fastestRoundTimeSeconds;
    private Integer slowestRoundTimeSeconds;

    // Superset
    private Integer supersetRounds;
    private Double averageRestBetweenExercises;
    private Double averageRestBetweenSupersets;

    // Drop Set
    private Integer dropStages;
    private Integer totalDropSetReps;

    // Performance metrics
    private Double averageRPE;
    private Integer averageHeartRate;
    private Integer maxHeartRate;
    private Double totalVolumeLoad;

    // Quality indicators
    private Double technicalQuality; // 1-10 rating
    private Double intensity; // 1-10 rating
    private Double consistency; // How consistent was performance

    @Column(length = 2000)
    private String notes;

    @Column(length = 1000)
    private String modifications; // Any changes made to the planned block

    private Instant completedAt;

    public BlockResult() {
        this.completedAt = Instant.now();
    }

    public BlockResult(AdvancedWorkoutResult workoutResult, ExerciseBlock plannedBlock) {
        this();
        this.workoutResult = workoutResult;
        this.plannedBlock = plannedBlock;
        this.blockLabel = plannedBlock.getLabel();
        this.blockOrder = plannedBlock.getOrderIndex();
        this.blockType = plannedBlock.getBlockType();
    }

    // Static factory methods for different block types
    public static BlockResult createEMOMResult(AdvancedWorkoutResult workoutResult, ExerciseBlock block,
                                             int minutesCompleted, int targetMinutes, int failedMinutes) {
        BlockResult result = new BlockResult(workoutResult, block);
        result.setEmomMinutesCompleted(minutesCompleted);
        result.setEmomMinutesTarget(targetMinutes);
        result.setEmomFailedMinutes(failedMinutes);
        result.setCompletedAsPlanned(failedMinutes == 0);
        result.setCompletionPercentage((double) minutesCompleted / targetMinutes * 100);
        return result;
    }

    public static BlockResult createTabataResult(AdvancedWorkoutResult workoutResult, ExerciseBlock block,
                                               int roundsCompleted, double averageReps) {
        BlockResult result = new BlockResult(workoutResult, block);
        result.setTabataRoundsCompleted(roundsCompleted);
        result.setTabataAverageReps(averageReps);
        Integer targetRounds = block.getTotalRounds();
        if (targetRounds != null) {
            result.setCompletionPercentage((double) roundsCompleted / targetRounds * 100);
            result.setCompletedAsPlanned(roundsCompleted == targetRounds);
        }
        return result;
    }

    public static BlockResult createCircuitResult(AdvancedWorkoutResult workoutResult, ExerciseBlock block,
                                                int roundsCompleted, double averageRoundTime,
                                                int fastestTime, int slowestTime) {
        BlockResult result = new BlockResult(workoutResult, block);
        result.setCompletedRounds(roundsCompleted);
        result.setAverageRoundTime(averageRoundTime);
        result.setFastestRoundTimeSeconds(fastestTime);
        result.setSlowestRoundTimeSeconds(slowestTime);
        result.setTargetRounds(block.getTotalRounds());
        if (block.getTotalRounds() != null) {
            result.setCompletionPercentage((double) roundsCompleted / block.getTotalRounds() * 100);
            result.setCompletedAsPlanned(roundsCompleted == block.getTotalRounds());
        }
        return result;
    }

    public static BlockResult createSupersetResult(AdvancedWorkoutResult workoutResult, ExerciseBlock block,
                                                 int rounds, double avgRestBetweenExercises,
                                                 double avgRestBetweenSupersets) {
        BlockResult result = new BlockResult(workoutResult, block);
        result.setSupersetRounds(rounds);
        result.setAverageRestBetweenExercises(avgRestBetweenExercises);
        result.setAverageRestBetweenSupersets(avgRestBetweenSupersets);
        result.setTargetRounds(block.getTotalRounds());
        if (block.getTotalRounds() != null) {
            result.setCompletionPercentage((double) rounds / block.getTotalRounds() * 100);
            result.setCompletedAsPlanned(rounds == block.getTotalRounds());
        }
        return result;
    }

    // Helper methods
    public Integer getDurationSeconds() {
        if (startTime != null && endTime != null) {
            return (int) java.time.Duration.between(startTime, endTime).getSeconds();
        }
        return totalTimeSeconds;
    }

    public Double getWorkDensity() {
        if (totalTimeSeconds != null && totalTimeSeconds > 0 && workTimeSeconds != null) {
            return (workTimeSeconds.doubleValue() / totalTimeSeconds) * 100;
        }
        return null;
    }

    public String getPerformanceRating() {
        if (completionPercentage != null) {
            if (completionPercentage >= 100) return "Excellent";
            if (completionPercentage >= 90) return "Very Good";
            if (completionPercentage >= 80) return "Good";
            if (completionPercentage >= 70) return "Fair";
            if (completionPercentage >= 60) return "Poor";
            return "Very Poor";
        }
        return "Not Rated";
    }

    public Boolean wasSuccessful() {
        return completedAsPlanned != null && completedAsPlanned &&
               completionPercentage != null && completionPercentage >= 90;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public AdvancedWorkoutResult getWorkoutResult() { return workoutResult; }
    public void setWorkoutResult(AdvancedWorkoutResult workoutResult) { this.workoutResult = workoutResult; }

    public ExerciseBlock getPlannedBlock() { return plannedBlock; }
    public void setPlannedBlock(ExerciseBlock plannedBlock) { this.plannedBlock = plannedBlock; }

    public String getBlockLabel() { return blockLabel; }
    public void setBlockLabel(String blockLabel) { this.blockLabel = blockLabel; }

    public int getBlockOrder() { return blockOrder; }
    public void setBlockOrder(int blockOrder) { this.blockOrder = blockOrder; }

    public ExerciseBlock.BlockType getBlockType() { return blockType; }
    public void setBlockType(ExerciseBlock.BlockType blockType) { this.blockType = blockType; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public Integer getTotalTimeSeconds() { return totalTimeSeconds; }
    public void setTotalTimeSeconds(Integer totalTimeSeconds) { this.totalTimeSeconds = totalTimeSeconds; }

    public Integer getWorkTimeSeconds() { return workTimeSeconds; }
    public void setWorkTimeSeconds(Integer workTimeSeconds) { this.workTimeSeconds = workTimeSeconds; }

    public Integer getRestTimeSeconds() { return restTimeSeconds; }
    public void setRestTimeSeconds(Integer restTimeSeconds) { this.restTimeSeconds = restTimeSeconds; }

    public Boolean getCompletedAsPlanned() { return completedAsPlanned; }
    public void setCompletedAsPlanned(Boolean completedAsPlanned) { this.completedAsPlanned = completedAsPlanned; }

    public Integer getTargetRounds() { return targetRounds; }
    public void setTargetRounds(Integer targetRounds) { this.targetRounds = targetRounds; }

    public Integer getCompletedRounds() { return completedRounds; }
    public void setCompletedRounds(Integer completedRounds) { this.completedRounds = completedRounds; }

    public Double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }

    public Integer getEmomMinutesCompleted() { return emomMinutesCompleted; }
    public void setEmomMinutesCompleted(Integer emomMinutesCompleted) { this.emomMinutesCompleted = emomMinutesCompleted; }

    public Integer getEmomMinutesTarget() { return emomMinutesTarget; }
    public void setEmomMinutesTarget(Integer emomMinutesTarget) { this.emomMinutesTarget = emomMinutesTarget; }

    public Integer getEmomFailedMinutes() { return emomFailedMinutes; }
    public void setEmomFailedMinutes(Integer emomFailedMinutes) { this.emomFailedMinutes = emomFailedMinutes; }

    public Integer getTabataRoundsCompleted() { return tabataRoundsCompleted; }
    public void setTabataRoundsCompleted(Integer tabataRoundsCompleted) { this.tabataRoundsCompleted = tabataRoundsCompleted; }

    public Double getTabataAverageReps() { return tabataAverageReps; }
    public void setTabataAverageReps(Double tabataAverageReps) { this.tabataAverageReps = tabataAverageReps; }

    public Double getAverageRoundTime() { return averageRoundTime; }
    public void setAverageRoundTime(Double averageRoundTime) { this.averageRoundTime = averageRoundTime; }

    public Integer getFastestRoundTimeSeconds() { return fastestRoundTimeSeconds; }
    public void setFastestRoundTimeSeconds(Integer fastestRoundTimeSeconds) { this.fastestRoundTimeSeconds = fastestRoundTimeSeconds; }

    public Integer getSlowestRoundTimeSeconds() { return slowestRoundTimeSeconds; }
    public void setSlowestRoundTimeSeconds(Integer slowestRoundTimeSeconds) { this.slowestRoundTimeSeconds = slowestRoundTimeSeconds; }

    public Integer getSupersetRounds() { return supersetRounds; }
    public void setSupersetRounds(Integer supersetRounds) { this.supersetRounds = supersetRounds; }

    public Double getAverageRestBetweenExercises() { return averageRestBetweenExercises; }
    public void setAverageRestBetweenExercises(Double averageRestBetweenExercises) { this.averageRestBetweenExercises = averageRestBetweenExercises; }

    public Double getAverageRestBetweenSupersets() { return averageRestBetweenSupersets; }
    public void setAverageRestBetweenSupersets(Double averageRestBetweenSupersets) { this.averageRestBetweenSupersets = averageRestBetweenSupersets; }

    public Integer getDropStages() { return dropStages; }
    public void setDropStages(Integer dropStages) { this.dropStages = dropStages; }

    public Integer getTotalDropSetReps() { return totalDropSetReps; }
    public void setTotalDropSetReps(Integer totalDropSetReps) { this.totalDropSetReps = totalDropSetReps; }

    public Double getAverageRPE() { return averageRPE; }
    public void setAverageRPE(Double averageRPE) { this.averageRPE = averageRPE; }

    public Integer getAverageHeartRate() { return averageHeartRate; }
    public void setAverageHeartRate(Integer averageHeartRate) { this.averageHeartRate = averageHeartRate; }

    public Integer getMaxHeartRate() { return maxHeartRate; }
    public void setMaxHeartRate(Integer maxHeartRate) { this.maxHeartRate = maxHeartRate; }

    public Double getTotalVolumeLoad() { return totalVolumeLoad; }
    public void setTotalVolumeLoad(Double totalVolumeLoad) { this.totalVolumeLoad = totalVolumeLoad; }

    public Double getTechnicalQuality() { return technicalQuality; }
    public void setTechnicalQuality(Double technicalQuality) { this.technicalQuality = technicalQuality; }

    public Double getIntensity() { return intensity; }
    public void setIntensity(Double intensity) { this.intensity = intensity; }

    public Double getConsistency() { return consistency; }
    public void setConsistency(Double consistency) { this.consistency = consistency; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getModifications() { return modifications; }
    public void setModifications(String modifications) { this.modifications = modifications; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}