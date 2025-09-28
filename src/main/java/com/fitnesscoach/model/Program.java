package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "programs")
public class Program {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private LocalDate startDate;
    private LocalDate endDate;

    private int totalWeeks;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<WorkoutSessionTemplate> sessions = new ArrayList<>();

    public Program() {}

    public Program(String title, int totalWeeks) {
        this.title = title;
        this.totalWeeks = totalWeeks;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public int getTotalWeeks() {
        return totalWeeks;
    }

    public void setTotalWeeks(int totalWeeks) {
        this.totalWeeks = totalWeeks;
    }

    public List<WorkoutSessionTemplate> getSessions() {
        return sessions;
    }

    public void setSessions(List<WorkoutSessionTemplate> sessions) {
        this.sessions = sessions;
    }
}