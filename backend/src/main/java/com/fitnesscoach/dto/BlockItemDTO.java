package com.fitnesscoach.dto;

import java.util.UUID;

public class BlockItemDTO {
    public UUID id;
    public int orderIndex;
    public String exerciseName;
    public String exerciseId; // For creation from mobile
    public PrescriptionDTO rx;
    public PrescriptionDTO prescription; // Alias for mobile compatibility

    public BlockItemDTO() {}

    public BlockItemDTO(UUID id, int orderIndex, String exerciseName, PrescriptionDTO rx) {
        this.id = id;
        this.orderIndex = orderIndex;
        this.exerciseName = exerciseName;
        this.rx = rx;
        this.prescription = rx;
    }
}