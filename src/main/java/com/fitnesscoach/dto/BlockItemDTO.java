package com.fitnesscoach.dto;

import java.util.UUID;

public class BlockItemDTO {
    public UUID id;
    public int orderIndex;
    public String exerciseName;
    public PrescriptionDTO rx;

    public BlockItemDTO() {}

    public BlockItemDTO(UUID id, int orderIndex, String exerciseName, PrescriptionDTO rx) {
        this.id = id;
        this.orderIndex = orderIndex;
        this.exerciseName = exerciseName;
        this.rx = rx;
    }
}