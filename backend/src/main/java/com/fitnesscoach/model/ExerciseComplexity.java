package com.fitnesscoach.model;

/**
 * Exercise complexity levels for programming and progression
 */
public enum ExerciseComplexity {
    BEGINNER("Beginner", "Simple, safe movements for new trainees"),
    INTERMEDIATE("Intermediate", "Moderate complexity requiring some experience"),
    ADVANCED("Advanced", "Complex movements requiring significant experience"),
    EXPERT("Expert", "Highly technical movements for experienced athletes");

    private final String displayName;
    private final String description;

    ExerciseComplexity(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}