package com.fitnesscoach.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "exercises")
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    // Muscle groups
    private String primaryMuscle;
    private String secondaryMuscles; // Comma-separated

    // Equipment and setup
    private String equipment;
    @Column(length = 1000)
    private String setupInstructions;

    // Exercise categorization
    @Enumerated(EnumType.STRING)
    private ExerciseCategory category;

    @Enumerated(EnumType.STRING)
    private MovementPattern movementPattern;

    @Enumerated(EnumType.STRING)
    private ExerciseComplexity complexity;

    // Measurement types
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<MeasurementType> measurementTypes = new HashSet<>();

    // Media and instructions
    private String videoUrl;
    private String imageUrl;
    @Column(length = 3000)
    private String instructions;

    // Safety and modifications
    @Column(length = 1000)
    private String contraindications;
    @Column(length = 1000)
    private String modifications;
    @Column(length = 1000)
    private String progressions;

    // Tags for search and filtering
    private String tags; // Comma-separated

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

    // Additional getters and setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSecondaryMuscles() {
        return secondaryMuscles;
    }

    public void setSecondaryMuscles(String secondaryMuscles) {
        this.secondaryMuscles = secondaryMuscles;
    }

    public String getSetupInstructions() {
        return setupInstructions;
    }

    public void setSetupInstructions(String setupInstructions) {
        this.setupInstructions = setupInstructions;
    }

    public ExerciseCategory getCategory() {
        return category;
    }

    public void setCategory(ExerciseCategory category) {
        this.category = category;
    }

    public MovementPattern getMovementPattern() {
        return movementPattern;
    }

    public void setMovementPattern(MovementPattern movementPattern) {
        this.movementPattern = movementPattern;
    }

    public ExerciseComplexity getComplexity() {
        return complexity;
    }

    public void setComplexity(ExerciseComplexity complexity) {
        this.complexity = complexity;
    }

    public Set<MeasurementType> getMeasurementTypes() {
        return measurementTypes;
    }

    public void setMeasurementTypes(Set<MeasurementType> measurementTypes) {
        this.measurementTypes = measurementTypes;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getContraindications() {
        return contraindications;
    }

    public void setContraindications(String contraindications) {
        this.contraindications = contraindications;
    }

    public String getModifications() {
        return modifications;
    }

    public void setModifications(String modifications) {
        this.modifications = modifications;
    }

    public String getProgressions() {
        return progressions;
    }

    public void setProgressions(String progressions) {
        this.progressions = progressions;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }
}