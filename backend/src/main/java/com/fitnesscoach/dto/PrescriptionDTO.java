package com.fitnesscoach.dto;

public class PrescriptionDTO {
    public int weekStart;
    public int weekEnd;
    public int sets;
    public int targetReps;
    public String tempo;
    public int restSeconds;
    public String coachNotes;

    public PrescriptionDTO() {}

    public PrescriptionDTO(int weekStart, int weekEnd, int sets, int targetReps,
                          String tempo, int restSeconds, String coachNotes) {
        this.weekStart = weekStart;
        this.weekEnd = weekEnd;
        this.sets = sets;
        this.targetReps = targetReps;
        this.tempo = tempo;
        this.restSeconds = restSeconds;
        this.coachNotes = coachNotes;
    }
}