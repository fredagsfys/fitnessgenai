package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "block_items")
public class BlockItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private ExerciseBlock block;

    private int orderIndex;

    @ManyToOne(optional = false)
    private Exercise exercise;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "weekStart", column = @Column(name = "prescription_week_start")),
        @AttributeOverride(name = "weekEnd", column = @Column(name = "prescription_week_end")),
        @AttributeOverride(name = "sets", column = @Column(name = "prescription_sets")),
        @AttributeOverride(name = "targetReps", column = @Column(name = "prescription_target_reps")),
        @AttributeOverride(name = "tempo", column = @Column(name = "prescription_tempo")),
        @AttributeOverride(name = "restSeconds", column = @Column(name = "prescription_rest_seconds")),
        @AttributeOverride(name = "coachNotes", column = @Column(name = "prescription_coach_notes"))
    })
    private Prescription prescription;

    // Enhanced prescription for advanced workout types
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "weekStart", column = @Column(name = "advanced_week_start")),
        @AttributeOverride(name = "weekEnd", column = @Column(name = "advanced_week_end")),
        @AttributeOverride(name = "sets", column = @Column(name = "advanced_sets")),
        @AttributeOverride(name = "targetReps", column = @Column(name = "advanced_target_reps")),
        @AttributeOverride(name = "tempo", column = @Column(name = "advanced_tempo")),
        @AttributeOverride(name = "restTimeSeconds", column = @Column(name = "advanced_rest_seconds")),
        @AttributeOverride(name = "coachNotes", column = @Column(name = "advanced_coach_notes"))
    })
    private AdvancedPrescription advancedPrescription;

    public BlockItem() {}

    public BlockItem(ExerciseBlock block, int orderIndex, Exercise exercise, Prescription prescription) {
        this.block = block;
        this.orderIndex = orderIndex;
        this.exercise = exercise;
        this.prescription = prescription;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ExerciseBlock getBlock() {
        return block;
    }

    public void setBlock(ExerciseBlock block) {
        this.block = block;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public AdvancedPrescription getAdvancedPrescription() {
        return advancedPrescription;
    }

    public void setAdvancedPrescription(AdvancedPrescription advancedPrescription) {
        this.advancedPrescription = advancedPrescription;
    }
}