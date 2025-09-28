package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "exercises")
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String primaryMuscle;
    private String equipment;

    @Column(length = 2000)
    private String notes;

    public Exercise() {}

    public Exercise(String name) {
        this.name = name;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrimaryMuscle() {
        return primaryMuscle;
    }

    public void setPrimaryMuscle(String primaryMuscle) {
        this.primaryMuscle = primaryMuscle;
    }

    public String getEquipment() {
        return equipment;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}