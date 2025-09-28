package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Enhanced prescription that supports all advanced workout types
 * including supersets, circuits, EMOM, Tabata, etc.
 */
@Embeddable
public class AdvancedPrescription {
    // Basic prescription fields
    private int weekStart;
    private int weekEnd;

    // Traditional sets/reps
    private Integer sets;
    private Integer targetReps;
    private Integer repRangeMin;
    private Integer repRangeMax;

    // Load prescription
    private Double weight;
    private String weightUnit; // kg, lbs, %1RM, bodyweight
    private Double percentage1RM;

    // Time-based prescription
    private Integer workTimeSeconds;
    private Integer restTimeSeconds;
    private Integer totalDurationSeconds;
    private Integer rounds;

    // Advanced set structures
    @Enumerated(EnumType.STRING)
    private SetType setType;

    // Drop set configuration
    private Integer dropSetStages;
    private String dropSetReductions; // JSON array of weight reductions

    // Cluster set configuration
    private Integer clusterReps;
    private Integer clusterRestSeconds;

    // Rest-pause configuration
    private Integer restPauseReps;
    private Integer restPauseSeconds;

    // Superset/circuit configuration
    private Integer supersetPosition; // Position in superset (1, 2, 3, etc.)
    private Integer circuitPosition;
    private boolean isSuperset;
    private boolean isCircuit;

    // EMOM configuration
    private Integer emomIntervalMinutes;
    private Integer emomTargetReps;

    // Tabata configuration
    private Integer tabataRounds;
    private Integer tabataWorkSeconds; // Usually 20
    private Integer tabataRestSeconds; // Usually 10

    // Tempo and speed
    private String tempo; // e.g., "3-1-X-1"
    @Embedded
    private TempoComponents tempoComponents;

    // RPE and intensity
    private Integer targetRPE; // 1-10 scale
    private Integer repsInReserve; // RIR

    // Distance-based
    private Double distance;
    private String distanceUnit; // meters, km, miles, etc.

    // Complex training
    private boolean isComplex;
    private Integer complexPosition;

    // Pyramid sets
    private boolean isPyramid;
    private String pyramidStructure; // e.g., "5-4-3-2-1"

    // Loading schemes
    @Enumerated(EnumType.STRING)
    private LoadingScheme loadingScheme;

    // Progression
    private String progressionNotes;
    private String regressionNotes;

    // Special instructions
    @Column(length = 2000)
    private String specialInstructions;

    @Column(length = 1000)
    private String coachNotes;

    // Technical cues
    @ElementCollection
    @CollectionTable(name = "prescription_cues")
    private List<String> technicalCues = new ArrayList<>();

    public AdvancedPrescription() {}

    // Enums for advanced prescription features
    public enum SetType {
        STRAIGHT_SETS,
        SUPERSET,
        TRISET,
        GIANT_SET,
        DROP_SET,
        REST_PAUSE,
        CLUSTER_SET,
        PYRAMID,
        REVERSE_PYRAMID,
        CIRCUIT,
        EMOM,
        TABATA,
        AMRAP,
        FOR_TIME,
        ISOMETRIC,
        COMPLEX,
        MECHANICAL_DROP_SET
    }

    public enum LoadingScheme {
        LINEAR,
        REVERSE_LINEAR,
        UNDULATING,
        BLOCK,
        CONJUGATE,
        PERCENTAGE_BASED,
        RPE_BASED,
        AUTOREGULATED
    }

    // Static factory methods for common prescriptions
    public static AdvancedPrescription straightSets(int sets, int reps, int restSeconds) {
        AdvancedPrescription prescription = new AdvancedPrescription();
        prescription.setSetType(SetType.STRAIGHT_SETS);
        prescription.setSets(sets);
        prescription.setTargetReps(reps);
        prescription.setRestTimeSeconds(restSeconds);
        return prescription;
    }

    public static AdvancedPrescription emom(int intervalMinutes, int targetReps, int totalMinutes) {
        AdvancedPrescription prescription = new AdvancedPrescription();
        prescription.setSetType(SetType.EMOM);
        prescription.setEmomIntervalMinutes(intervalMinutes);
        prescription.setEmomTargetReps(targetReps);
        prescription.setTotalDurationSeconds(totalMinutes * 60);
        return prescription;
    }

    public static AdvancedPrescription tabata(int rounds) {
        AdvancedPrescription prescription = new AdvancedPrescription();
        prescription.setSetType(SetType.TABATA);
        prescription.setTabataRounds(rounds);
        prescription.setTabataWorkSeconds(20);
        prescription.setTabataRestSeconds(10);
        prescription.setTotalDurationSeconds(rounds * 30); // 20s work + 10s rest
        return prescription;
    }

    public static AdvancedPrescription superset(int position, int sets, int reps, int restSeconds) {
        AdvancedPrescription prescription = new AdvancedPrescription();
        prescription.setSetType(SetType.SUPERSET);
        prescription.setSupersetPosition(position);
        prescription.setIsSuperset(true);
        prescription.setSets(sets);
        prescription.setTargetReps(reps);
        prescription.setRestTimeSeconds(restSeconds);
        return prescription;
    }

    public static AdvancedPrescription dropSet(int sets, int reps, int stages, String reductions) {
        AdvancedPrescription prescription = new AdvancedPrescription();
        prescription.setSetType(SetType.DROP_SET);
        prescription.setSets(sets);
        prescription.setTargetReps(reps);
        prescription.setDropSetStages(stages);
        prescription.setDropSetReductions(reductions);
        return prescription;
    }

    // Getters and setters
    public int getWeekStart() { return weekStart; }
    public void setWeekStart(int weekStart) { this.weekStart = weekStart; }

    public int getWeekEnd() { return weekEnd; }
    public void setWeekEnd(int weekEnd) { this.weekEnd = weekEnd; }

    public Integer getSets() { return sets; }
    public void setSets(Integer sets) { this.sets = sets; }

    public Integer getTargetReps() { return targetReps; }
    public void setTargetReps(Integer targetReps) { this.targetReps = targetReps; }

    public Integer getRepRangeMin() { return repRangeMin; }
    public void setRepRangeMin(Integer repRangeMin) { this.repRangeMin = repRangeMin; }

    public Integer getRepRangeMax() { return repRangeMax; }
    public void setRepRangeMax(Integer repRangeMax) { this.repRangeMax = repRangeMax; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getWeightUnit() { return weightUnit; }
    public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }

    public Double getPercentage1RM() { return percentage1RM; }
    public void setPercentage1RM(Double percentage1RM) { this.percentage1RM = percentage1RM; }

    public Integer getWorkTimeSeconds() { return workTimeSeconds; }
    public void setWorkTimeSeconds(Integer workTimeSeconds) { this.workTimeSeconds = workTimeSeconds; }

    public Integer getRestTimeSeconds() { return restTimeSeconds; }
    public void setRestTimeSeconds(Integer restTimeSeconds) { this.restTimeSeconds = restTimeSeconds; }

    public Integer getTotalDurationSeconds() { return totalDurationSeconds; }
    public void setTotalDurationSeconds(Integer totalDurationSeconds) { this.totalDurationSeconds = totalDurationSeconds; }

    public Integer getRounds() { return rounds; }
    public void setRounds(Integer rounds) { this.rounds = rounds; }

    public SetType getSetType() { return setType; }
    public void setSetType(SetType setType) { this.setType = setType; }

    public Integer getDropSetStages() { return dropSetStages; }
    public void setDropSetStages(Integer dropSetStages) { this.dropSetStages = dropSetStages; }

    public String getDropSetReductions() { return dropSetReductions; }
    public void setDropSetReductions(String dropSetReductions) { this.dropSetReductions = dropSetReductions; }

    public Integer getClusterReps() { return clusterReps; }
    public void setClusterReps(Integer clusterReps) { this.clusterReps = clusterReps; }

    public Integer getClusterRestSeconds() { return clusterRestSeconds; }
    public void setClusterRestSeconds(Integer clusterRestSeconds) { this.clusterRestSeconds = clusterRestSeconds; }

    public Integer getRestPauseReps() { return restPauseReps; }
    public void setRestPauseReps(Integer restPauseReps) { this.restPauseReps = restPauseReps; }

    public Integer getRestPauseSeconds() { return restPauseSeconds; }
    public void setRestPauseSeconds(Integer restPauseSeconds) { this.restPauseSeconds = restPauseSeconds; }

    public Integer getSupersetPosition() { return supersetPosition; }
    public void setSupersetPosition(Integer supersetPosition) { this.supersetPosition = supersetPosition; }

    public Integer getCircuitPosition() { return circuitPosition; }
    public void setCircuitPosition(Integer circuitPosition) { this.circuitPosition = circuitPosition; }

    public boolean isSuperset() { return isSuperset; }
    public void setIsSuperset(boolean isSuperset) { this.isSuperset = isSuperset; }

    public boolean isCircuit() { return isCircuit; }
    public void setIsCircuit(boolean isCircuit) { this.isCircuit = isCircuit; }

    public Integer getEmomIntervalMinutes() { return emomIntervalMinutes; }
    public void setEmomIntervalMinutes(Integer emomIntervalMinutes) { this.emomIntervalMinutes = emomIntervalMinutes; }

    public Integer getEmomTargetReps() { return emomTargetReps; }
    public void setEmomTargetReps(Integer emomTargetReps) { this.emomTargetReps = emomTargetReps; }

    public Integer getTabataRounds() { return tabataRounds; }
    public void setTabataRounds(Integer tabataRounds) { this.tabataRounds = tabataRounds; }

    public Integer getTabataWorkSeconds() { return tabataWorkSeconds; }
    public void setTabataWorkSeconds(Integer tabataWorkSeconds) { this.tabataWorkSeconds = tabataWorkSeconds; }

    public Integer getTabataRestSeconds() { return tabataRestSeconds; }
    public void setTabataRestSeconds(Integer tabataRestSeconds) { this.tabataRestSeconds = tabataRestSeconds; }

    public String getTempo() { return tempo; }
    public void setTempo(String tempo) { this.tempo = tempo; }

    public TempoComponents getTempoComponents() { return tempoComponents; }
    public void setTempoComponents(TempoComponents tempoComponents) { this.tempoComponents = tempoComponents; }

    public Integer getTargetRPE() { return targetRPE; }
    public void setTargetRPE(Integer targetRPE) { this.targetRPE = targetRPE; }

    public Integer getRepsInReserve() { return repsInReserve; }
    public void setRepsInReserve(Integer repsInReserve) { this.repsInReserve = repsInReserve; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getDistanceUnit() { return distanceUnit; }
    public void setDistanceUnit(String distanceUnit) { this.distanceUnit = distanceUnit; }

    public boolean isComplex() { return isComplex; }
    public void setIsComplex(boolean isComplex) { this.isComplex = isComplex; }

    public Integer getComplexPosition() { return complexPosition; }
    public void setComplexPosition(Integer complexPosition) { this.complexPosition = complexPosition; }

    public boolean isPyramid() { return isPyramid; }
    public void setIsPyramid(boolean isPyramid) { this.isPyramid = isPyramid; }

    public String getPyramidStructure() { return pyramidStructure; }
    public void setPyramidStructure(String pyramidStructure) { this.pyramidStructure = pyramidStructure; }

    public LoadingScheme getLoadingScheme() { return loadingScheme; }
    public void setLoadingScheme(LoadingScheme loadingScheme) { this.loadingScheme = loadingScheme; }

    public String getProgressionNotes() { return progressionNotes; }
    public void setProgressionNotes(String progressionNotes) { this.progressionNotes = progressionNotes; }

    public String getRegressionNotes() { return regressionNotes; }
    public void setRegressionNotes(String regressionNotes) { this.regressionNotes = regressionNotes; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public String getCoachNotes() { return coachNotes; }
    public void setCoachNotes(String coachNotes) { this.coachNotes = coachNotes; }

    public List<String> getTechnicalCues() { return technicalCues; }
    public void setTechnicalCues(List<String> technicalCues) { this.technicalCues = technicalCues; }
}