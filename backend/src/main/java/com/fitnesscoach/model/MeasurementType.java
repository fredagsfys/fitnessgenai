package com.fitnesscoach.model;

/**
 * Types of measurements that can be tracked for exercises
 * Supports all forms of exercise quantification
 */
public enum MeasurementType {
    // Weight-based
    WEIGHT("Weight", "Load/resistance in kg or lbs"),
    BODYWEIGHT("Bodyweight", "Using body weight as resistance"),
    PERCENTAGE_1RM("Percentage 1RM", "Percentage of one-rep maximum"),

    // Repetition-based
    REPS("Repetitions", "Number of repetitions"),
    MAX_REPS("Max Reps", "Maximum repetitions possible"),
    REP_RANGES("Rep Ranges", "Range of repetitions (e.g., 8-12)"),

    // Time-based
    DURATION("Duration", "Total time in seconds/minutes"),
    WORK_TIME("Work Time", "Active work duration"),
    REST_TIME("Rest Time", "Rest/recovery duration"),
    INTERVALS("Intervals", "Work/rest interval structure"),
    PACE("Pace", "Pace per distance unit"),

    // Distance-based
    DISTANCE("Distance", "Distance covered"),
    HEIGHT("Height", "Jump or reach height"),
    DEPTH("Depth", "Squat depth or range of motion"),

    // Rounds and circuits
    ROUNDS("Rounds", "Number of complete rounds"),
    SETS("Sets", "Number of sets"),

    // Rate and frequency
    RPM("RPM", "Revolutions per minute"),
    HEART_RATE("Heart Rate", "Beats per minute"),
    CADENCE("Cadence", "Steps or cycles per minute"),

    // Resistance types
    RESISTANCE_LEVEL("Resistance Level", "Machine or band resistance level"),
    INCLINE("Incline", "Treadmill or surface incline"),
    SPEED("Speed", "Movement or treadmill speed"),

    // Power and force
    POWER("Power", "Power output in watts"),
    FORCE("Force", "Force production"),
    VELOCITY("Velocity", "Movement velocity"),

    // Flexibility and range
    RANGE_OF_MOTION("Range of Motion", "Joint range of motion"),
    HOLD_TIME("Hold Time", "Static hold duration"),

    // Plyometric and explosive
    CONTACT_TIME("Contact Time", "Ground contact time"),
    FLIGHT_TIME("Flight Time", "Time in air"),

    // Technical scoring
    FORM_SCORE("Form Score", "Technique quality rating"),
    DIFFICULTY_SCORE("Difficulty Score", "Movement difficulty rating"),

    // Physiological
    RPE("RPE", "Rate of Perceived Exertion (1-10)"),
    RIR("RIR", "Reps in Reserve"),

    // Environmental
    TEMPERATURE("Temperature", "Environmental temperature"),
    ALTITUDE("Altitude", "Training altitude"),

    // Equipment-specific
    BAND_RESISTANCE("Band Resistance", "Resistance band tension"),
    WATER_DEPTH("Water Depth", "Pool depth for aquatic exercises"),

    // Skill-based
    ACCURACY("Accuracy", "Accuracy percentage for skill-based movements"),
    CONSISTENCY("Consistency", "Movement consistency rating"),

    // Custom
    CUSTOM_METRIC("Custom Metric", "User-defined measurement");

    private final String displayName;
    private final String description;

    MeasurementType(String displayName, String description) {
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
     * Check if this measurement type is time-based
     */
    public boolean isTimeBased() {
        return this == DURATION || this == WORK_TIME || this == REST_TIME ||
               this == INTERVALS || this == PACE || this == HOLD_TIME ||
               this == CONTACT_TIME || this == FLIGHT_TIME;
    }

    /**
     * Check if this measurement type is weight-based
     */
    public boolean isWeightBased() {
        return this == WEIGHT || this == BODYWEIGHT || this == PERCENTAGE_1RM;
    }

    /**
     * Check if this measurement type is distance-based
     */
    public boolean isDistanceBased() {
        return this == DISTANCE || this == HEIGHT || this == DEPTH;
    }
}