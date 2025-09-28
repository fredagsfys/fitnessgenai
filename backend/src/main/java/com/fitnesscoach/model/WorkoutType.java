package com.fitnesscoach.model;

/**
 * Enumeration of all supported workout types and methodologies
 * Supports traditional strength training, CrossFit, bodybuilding, powerlifting,
 * Olympic lifting, functional fitness, and specialized protocols
 */
public enum WorkoutType {
    // Traditional Strength Training
    STRAIGHT_SETS("Straight Sets", "Traditional sets with rest between"),
    SUPERSETS("Supersets", "Two exercises performed back-to-back without rest"),
    TRISETS("Trisets", "Three exercises performed consecutively"),
    GIANT_SETS("Giant Sets", "Four or more exercises performed consecutively"),
    DROP_SETS("Drop Sets", "Reduce weight and continue without rest"),
    REST_PAUSE("Rest-Pause", "Brief rest periods within a set"),
    CLUSTER_SETS("Cluster Sets", "Mini-rest periods within sets"),

    // Circuit Training
    CIRCUIT("Circuit Training", "Stations of exercises with timed intervals"),
    CIRCUIT_REPS("Circuit (Rep-Based)", "Circuit based on repetitions"),
    CIRCUIT_TIME("Circuit (Time-Based)", "Circuit based on time intervals"),

    // CrossFit / Functional Fitness
    WOD("Workout of the Day", "CrossFit-style workout"),
    AMRAP("AMRAP", "As Many Rounds/Reps As Possible"),
    FOR_TIME("For Time", "Complete workout as fast as possible"),
    EMOM("EMOM", "Every Minute on the Minute"),
    EMOM_2("E2MOM", "Every 2 Minutes on the Minute"),
    EMOM_3("E3MOM", "Every 3 Minutes on the Minute"),
    TABATA("Tabata", "20 seconds work, 10 seconds rest"),

    // High-Intensity Interval Training
    HIIT("HIIT", "High-Intensity Interval Training"),
    INTERVAL_TRAINING("Interval Training", "Work/rest intervals"),
    FARTLEK("Fartlek", "Speed play with varying intensities"),

    // Powerlifting / Strength
    PYRAMID("Pyramid Sets", "Increasing then decreasing weight/reps"),
    REVERSE_PYRAMID("Reverse Pyramid", "Decreasing weight, increasing reps"),
    WAVE_LOADING("Wave Loading", "Undulating loads within session"),
    MAX_EFFORT("Max Effort", "Working up to 1-3RM"),
    DYNAMIC_EFFORT("Dynamic Effort", "Speed/explosive work"),

    // Bodybuilding
    MECHANICAL_DROP_SET("Mechanical Drop Set", "Change exercise angle/leverage"),
    PRE_EXHAUSTION("Pre-Exhaustion", "Isolation then compound"),
    POST_EXHAUSTION("Post-Exhaustion", "Compound then isolation"),

    // Endurance / Cardio
    STEADY_STATE("Steady State", "Consistent pace/intensity"),
    LISS("LISS", "Low-Intensity Steady State"),
    TEMPO_RUNS("Tempo Runs", "Comfortably hard pace"),

    // Olympic Lifting / Power
    COMPLEX_TRAINING("Complex Training", "Heavy lift + explosive movement"),
    CONTRAST_TRAINING("Contrast Training", "Heavy + light + explosive"),

    // Specialized Protocols
    DENSITY_TRAINING("Density Training", "More work in same time"),
    VOLUME_TRAINING("Volume Training", "High volume accumulation"),
    LADDER_SETS("Ladder Sets", "Ascending/descending rep schemes"),

    // Time-Based Challenges
    DEATH_BY("Death By", "Add one rep each minute until failure"),
    LADDER_CLIMB("Ladder Climb", "1, 2, 3, 4... reps"),

    // Recovery / Active
    ACTIVE_RECOVERY("Active Recovery", "Low-intensity movement"),
    MOBILITY_SESSION("Mobility Session", "Stretching and mobility work"),

    // Custom
    CUSTOM("Custom", "User-defined workout structure");

    private final String displayName;
    private final String description;

    WorkoutType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Check if this workout type is time-based
     */
    public boolean isTimeBased() {
        return this == TABATA || this == EMOM || this == EMOM_2 || this == EMOM_3 ||
               this == FOR_TIME || this == AMRAP || this == CIRCUIT_TIME ||
               this == HIIT || this == INTERVAL_TRAINING || this == DEATH_BY;
    }

    /**
     * Check if this workout type uses supersets/circuits
     */
    public boolean isSuperset() {
        return this == SUPERSETS || this == TRISETS || this == GIANT_SETS ||
               this == CIRCUIT || this == CIRCUIT_REPS || this == CIRCUIT_TIME;
    }

    /**
     * Check if this workout type modifies sets mid-exercise
     */
    public boolean isDropSet() {
        return this == DROP_SETS || this == MECHANICAL_DROP_SET ||
               this == REST_PAUSE || this == CLUSTER_SETS;
    }
}