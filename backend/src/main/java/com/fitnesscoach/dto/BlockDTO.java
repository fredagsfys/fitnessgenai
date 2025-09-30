package com.fitnesscoach.dto;

import java.util.List;

public class BlockDTO {
    public String label;
    public int orderIndex;
    public String blockType;
    public String workoutType;
    public Integer restBetweenItemsSeconds;
    public Integer restAfterBlockSeconds;
    public Integer totalRounds;
    public Integer amrapDurationSeconds;
    public Integer intervalSeconds;
    public Integer workPhaseSeconds;
    public Integer restPhaseSeconds;
    public String blockInstructions;
    public String notes;
    public List<BlockItemDTO> items;

    public BlockDTO() {}

    public BlockDTO(String label, int orderIndex, List<BlockItemDTO> items) {
        this.label = label;
        this.orderIndex = orderIndex;
        this.items = items;
    }
}