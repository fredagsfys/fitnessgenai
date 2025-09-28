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
    private Prescription prescription;

    // Enhanced prescription for advanced workout types
    @Embedded
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