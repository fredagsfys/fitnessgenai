package com.fitnesscoach.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class WorkoutResultDTO {
    public UUID id;
    public UUID userId;
    public UUID sessionTemplateId;
    public String sessionTitle;
    public LocalDate date;
    public Integer week;
    public Integer programWeek;

    // Timing
    public Instant startTime;
    public Instant endTime;
    public Integer totalDurationSeconds;
    public Integer workTimeSeconds;
    public Integer restTimeSeconds;

    // Status and metrics
    public String completionStatus;
    public Integer totalReps;
    public Double totalVolumeLoad;
    public Double averageRPE;
    public Integer caloriesBurned;

    // Workout type specific
    public Integer totalRounds;
    public Integer targetRounds;
    public Boolean completedInTimeLimit;
    public String wodResult; // For time/AMRAP results
    public Boolean rxCompleted;

    // EMOM
    public Integer emomMinutesCompleted;
    public Integer emomMinutesTarget;
    public Integer emomFailedMinutes;

    // Tabata
    public Integer tabataRoundsCompleted;
    public Integer tabataRoundsTarget;
    public Double tabataAverageReps;

    // Circuit
    public Integer circuitRoundsCompleted;
    public Double averageCircuitTime;

    // Quality ratings
    public Integer workoutQuality;
    public Integer workoutEnjoyment;
    public Integer difficultyRating;

    // Notes
    public String notes;
    public String achievements;

    // Set results summary
    public List<SetResultSummary> setResults;

    public WorkoutResultDTO() {}

    public static class SetResultSummary {
        public String id; // Optional - can be null or temporary ID for new sets
        public String blockLabel;
        public Integer blockItemOrder;
        public Integer setNumber;
        public String exerciseName;
        public Integer targetReps;
        public Integer performedReps;
        public Double weight;
        public String weightUnit;
        public Integer rpe;
        public Integer restTakenSec;

        public SetResultSummary() {}
    }
}
