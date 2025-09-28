package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "exercise_blocks")
public class ExerciseBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private WorkoutSessionTemplate session;

    @Column(nullable = false, length = 1)
    private String label;

    private int orderIndex;

    @OneToMany(mappedBy = "block", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<BlockItem> items = new ArrayList<>();

    public ExerciseBlock() {}

    public ExerciseBlock(String label, WorkoutSessionTemplate session, int orderIndex) {
        this.label = label;
        this.session = session;
        this.orderIndex = orderIndex;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public WorkoutSessionTemplate getSession() {
        return session;
    }

    public void setSession(WorkoutSessionTemplate session) {
        this.session = session;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public List<BlockItem> getItems() {
        return items;
    }

    public void setItems(List<BlockItem> items) {
        this.items = items;
    }
}