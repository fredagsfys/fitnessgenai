package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private WorkoutSessionTemplate template;

    private LocalDate date;
    private Integer week;

    @Column(length = 2000)
    private String notes;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("blockLabel ASC, blockItemOrder ASC, setNumber ASC")
    private List<SetResult> sets = new ArrayList<>();

    public WorkoutSession() {}

    public WorkoutSession(LocalDate date, WorkoutSessionTemplate template) {
        this.date = date;
        this.template = template;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public WorkoutSessionTemplate getTemplate() {
        return template;
    }

    public void setTemplate(WorkoutSessionTemplate template) {
        this.template = template;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getWeek() {
        return week;
    }

    public void setWeek(Integer week) {
        this.week = week;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<SetResult> getSets() {
        return sets;
    }

    public void setSets(List<SetResult> sets) {
        this.sets = sets;
    }
}