package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "set_results")
public class SetResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private WorkoutSession session;

    @ManyToOne
    private BlockItem plannedItem;

    private String blockLabel;
    private int blockItemOrder;
    private int setNumber;

    @ManyToOne(optional = false)
    private Exercise exercise;

    private Integer targetReps;
    private String targetTempo;
    private Integer targetRestSec;

    private Integer performedReps;
    private Double weight;

    @Enumerated(EnumType.STRING)
    private WeightUnit weightUnit = WeightUnit.KG;

    private Double rpe;
    private Integer restTakenSec;

    @Column(length = 1000)
    private String comments;

    private Instant completedAt;

    public SetResult() {}

    public SetResult(WorkoutSession session, Exercise exercise, String blockLabel, int blockItemOrder, int setNumber) {
        this.session = session;
        this.exercise = exercise;
        this.blockLabel = blockLabel;
        this.blockItemOrder = blockItemOrder;
        this.setNumber = setNumber;
        this.completedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public WorkoutSession getSession() {
        return session;
    }

    public void setSession(WorkoutSession session) {
        this.session = session;
    }

    public BlockItem getPlannedItem() {
        return plannedItem;
    }

    public void setPlannedItem(BlockItem plannedItem) {
        this.plannedItem = plannedItem;
    }

    public String getBlockLabel() {
        return blockLabel;
    }

    public void setBlockLabel(String blockLabel) {
        this.blockLabel = blockLabel;
    }

    public int getBlockItemOrder() {
        return blockItemOrder;
    }

    public void setBlockItemOrder(int blockItemOrder) {
        this.blockItemOrder = blockItemOrder;
    }

    public int getSetNumber() {
        return setNumber;
    }

    public void setSetNumber(int setNumber) {
        this.setNumber = setNumber;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public Integer getTargetReps() {
        return targetReps;
    }

    public void setTargetReps(Integer targetReps) {
        this.targetReps = targetReps;
    }

    public String getTargetTempo() {
        return targetTempo;
    }

    public void setTargetTempo(String targetTempo) {
        this.targetTempo = targetTempo;
    }

    public Integer getTargetRestSec() {
        return targetRestSec;
    }

    public void setTargetRestSec(Integer targetRestSec) {
        this.targetRestSec = targetRestSec;
    }

    public Integer getPerformedReps() {
        return performedReps;
    }

    public void setPerformedReps(Integer performedReps) {
        this.performedReps = performedReps;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public WeightUnit getWeightUnit() {
        return weightUnit;
    }

    public void setWeightUnit(WeightUnit weightUnit) {
        this.weightUnit = weightUnit;
    }

    public Double getRpe() {
        return rpe;
    }

    public void setRpe(Double rpe) {
        this.rpe = rpe;
    }

    public Integer getRestTakenSec() {
        return restTakenSec;
    }

    public void setRestTakenSec(Integer restTakenSec) {
        this.restTakenSec = restTakenSec;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}