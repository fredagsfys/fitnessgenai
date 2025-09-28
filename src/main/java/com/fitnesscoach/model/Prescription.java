package com.fitnesscoach.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class Prescription {
    private int weekStart;
    private int weekEnd;
    private int sets;
    private int targetReps;
    private String tempo;
    private int restSeconds;

    @Column(length = 1000)
    private String coachNotes;

    public Prescription() {}

    public Prescription(int weekStart, int weekEnd, int sets, int targetReps, String tempo, int restSeconds) {
        this.weekStart = weekStart;
        this.weekEnd = weekEnd;
        this.sets = sets;
        this.targetReps = targetReps;
        this.tempo = tempo;
        this.restSeconds = restSeconds;
    }

    public int getWeekStart() {
        return weekStart;
    }

    public void setWeekStart(int weekStart) {
        this.weekStart = weekStart;
    }

    public int getWeekEnd() {
        return weekEnd;
    }

    public void setWeekEnd(int weekEnd) {
        this.weekEnd = weekEnd;
    }

    public int getSets() {
        return sets;
    }

    public void setSets(int sets) {
        this.sets = sets;
    }

    public int getTargetReps() {
        return targetReps;
    }

    public void setTargetReps(int targetReps) {
        this.targetReps = targetReps;
    }

    public String getTempo() {
        return tempo;
    }

    public void setTempo(String tempo) {
        this.tempo = tempo;
    }

    public int getRestSeconds() {
        return restSeconds;
    }

    public void setRestSeconds(int restSeconds) {
        this.restSeconds = restSeconds;
    }

    public String getCoachNotes() {
        return coachNotes;
    }

    public void setCoachNotes(String coachNotes) {
        this.coachNotes = coachNotes;
    }
}