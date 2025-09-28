package com.fitnesscoach.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class SetResultDTO {
    public UUID id;
    public String sessionTitle;
    public LocalDate date;
    public String blockLabel;
    public int blockItemOrder;
    public int setNumber;
    public String exerciseName;
    public Integer targetReps;
    public String targetTempo;
    public Integer targetRestSec;
    public Integer performedReps;
    public Double weight;
    public String weightUnit;
    public Double rpe;
    public Integer restTakenSec;
    public String comments;
    public Instant completedAt;

    public SetResultDTO() {}

    public SetResultDTO(UUID id, String sessionTitle, LocalDate date, String blockLabel,
                       int blockItemOrder, int setNumber, String exerciseName,
                       Integer targetReps, String targetTempo, Integer targetRestSec,
                       Integer performedReps, Double weight, String weightUnit,
                       Double rpe, Integer restTakenSec, String comments, Instant completedAt) {
        this.id = id;
        this.sessionTitle = sessionTitle;
        this.date = date;
        this.blockLabel = blockLabel;
        this.blockItemOrder = blockItemOrder;
        this.setNumber = setNumber;
        this.exerciseName = exerciseName;
        this.targetReps = targetReps;
        this.targetTempo = targetTempo;
        this.targetRestSec = targetRestSec;
        this.performedReps = performedReps;
        this.weight = weight;
        this.weightUnit = weightUnit;
        this.rpe = rpe;
        this.restTakenSec = restTakenSec;
        this.comments = comments;
        this.completedAt = completedAt;
    }
}