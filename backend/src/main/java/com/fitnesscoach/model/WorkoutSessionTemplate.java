package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workout_session_templates")
public class WorkoutSessionTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private Program program;

    @Column(nullable = false)
    private String title;

    private int orderIndex;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<ExerciseBlock> blocks = new ArrayList<>();

    public WorkoutSessionTemplate() {}

    public WorkoutSessionTemplate(String title, Program program, int orderIndex) {
        this.title = title;
        this.program = program;
        this.orderIndex = orderIndex;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public List<ExerciseBlock> getBlocks() {
        return blocks;
    }

    public void setBlocks(List<ExerciseBlock> blocks) {
        this.blocks = blocks;
    }
}