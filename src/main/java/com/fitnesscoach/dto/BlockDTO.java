package com.fitnesscoach.dto;

import java.util.List;

public class BlockDTO {
    public String label;
    public int orderIndex;
    public List<BlockItemDTO> items;

    public BlockDTO() {}

    public BlockDTO(String label, int orderIndex, List<BlockItemDTO> items) {
        this.label = label;
        this.orderIndex = orderIndex;
        this.items = items;
    }
}