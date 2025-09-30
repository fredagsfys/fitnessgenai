package com.fitnesscoach.dto;

public class PrescriptionDTO {
    public int weekStart;
    public int weekEnd;
    public Integer sets;
    public Integer minReps;
    public Integer maxReps;
    public Integer targetReps;
    public Double weight;
    public String weightUnit;
    public String tempo;
    public Integer restSeconds;
    public Integer rpe;
    public Integer rir;
    public Double percentage1RM;
    public String coachNotes;
    public String notes;

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
        this.notes = coachNotes;
    }
}