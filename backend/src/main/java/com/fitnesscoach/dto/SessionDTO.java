package com.fitnesscoach.dto;

import java.util.List;
import java.util.UUID;

public class SessionDTO {
    public UUID id;
    public String title;
    public int orderIndex;
    public List<BlockDTO> blocks;

    public SessionDTO() {}

    public SessionDTO(UUID id, String title, int orderIndex, List<BlockDTO> blocks) {
        this.id = id;
        this.title = title;
        this.orderIndex = orderIndex;
        this.blocks = blocks;
    }
}