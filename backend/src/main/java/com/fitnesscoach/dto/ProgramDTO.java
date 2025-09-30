package com.fitnesscoach.dto;

import java.util.List;
import java.util.UUID;

public class ProgramDTO {
    public UUID id;
    public String title;
    public String startDate;
    public String endDate;
    public int totalWeeks;
    public List<SessionDTO> sessions;

    public ProgramDTO() {}

    public ProgramDTO(UUID id, String title, int totalWeeks, List<SessionDTO> sessions) {
        this.id = id;
        this.title = title;
        this.totalWeeks = totalWeeks;
        this.sessions = sessions;
    }
}