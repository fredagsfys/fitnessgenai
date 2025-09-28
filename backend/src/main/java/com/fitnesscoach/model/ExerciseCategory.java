package com.fitnesscoach.model;

/**
 * Comprehensive categorization of exercise types
 * Covers all major fitness disciplines and exercise methodologies
 */
public enum ExerciseCategory {
    // Strength Training
    STRENGTH("Strength", "Traditional resistance training"),
    POWERLIFTING("Powerlifting", "Squat, bench, deadlift focus"),
    OLYMPIC_LIFTING("Olympic Lifting", "Snatch, clean & jerk, and variations"),
    BODYBUILDING("Bodybuilding", "Muscle isolation and hypertrophy"),

    // Functional Fitness
    FUNCTIONAL("Functional", "Multi-joint, real-world movements"),
    CROSSFIT("CrossFit", "Varied functional movements at high intensity"),
    KETTLEBELL("Kettlebell", "Ballistic and grind movements"),
    SANDBAG("Sandbag", "Unstable load training"),

    // Cardiovascular
    CARDIO("Cardio", "Cardiovascular endurance"),
    HIIT("HIIT", "High-intensity interval training"),
    STEADY_STATE("Steady State", "Continuous moderate intensity"),

    // Flexibility & Mobility
    STRETCHING("Stretching", "Static and dynamic stretching"),
    MOBILITY("Mobility", "Joint mobility and movement prep"),
    YOGA("Yoga", "Yoga poses and flows"),
    PILATES("Pilates", "Core-focused movement"),

    // Sports-Specific
    SPORT_SPECIFIC("Sport-Specific", "Training for specific sports"),
    AGILITY("Agility", "Speed, agility, and quickness"),
    PLYOMETRIC("Plyometric", "Explosive jump training"),
    BALANCE("Balance", "Stability and proprioception"),

    // Rehabilitation
    CORRECTIVE("Corrective", "Corrective exercise and rehab"),
    PREHAB("Prehab", "Injury prevention"),
    PHYSICAL_THERAPY("Physical Therapy", "Therapeutic exercises"),

    // Specialized
    ISOMETRIC("Isometric", "Static muscle contractions"),
    ECCENTRIC("Eccentric", "Negative/lowering phase emphasis"),
    UNILATERAL("Unilateral", "Single-limb training"),
    COMPOUND("Compound", "Multi-joint movements"),
    ISOLATION("Isolation", "Single-joint movements"),

    // Combat Sports
    MARTIAL_ARTS("Martial Arts", "Fighting techniques and conditioning"),
    BOXING("Boxing", "Boxing techniques and training"),

    // Water-Based
    AQUATIC("Aquatic", "Water-based exercises"),

    // Equipment-Specific
    BODYWEIGHT("Bodyweight", "No equipment required"),
    FREE_WEIGHTS("Free Weights", "Dumbbells, barbells, plates"),
    MACHINES("Machines", "Weight machines and cable systems"),
    RESISTANCE_BANDS("Resistance Bands", "Band-based training"),
    SUSPENSION("Suspension", "TRX and suspension trainers"),

    // Recovery
    RECOVERY("Recovery", "Active recovery and regeneration"),
    WARM_UP("Warm-up", "Preparation for main workout"),
    COOL_DOWN("Cool-down", "Post-workout recovery");

    private final String displayName;
    private final String description;

    ExerciseCategory(String displayName, String description) {
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