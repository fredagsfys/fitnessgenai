package com.fitnesscoach.model;

/**
 * Fundamental human movement patterns
 * Based on functional movement screen and biomechanical principles
 */
public enum MovementPattern {
    // Primary Movement Patterns
    SQUAT("Squat", "Hip and knee dominant bilateral movement"),
    HINGE("Hip Hinge", "Hip dominant movement (deadlift pattern)"),
    LUNGE("Lunge", "Unilateral lower body movement"),
    PUSH_VERTICAL("Vertical Push", "Overhead pressing movements"),
    PUSH_HORIZONTAL("Horizontal Push", "Chest pressing movements"),
    PULL_VERTICAL("Vertical Pull", "Pulling from overhead"),
    PULL_HORIZONTAL("Horizontal Pull", "Rowing movements"),

    // Core and Stability
    CORE_STABILITY("Core Stability", "Anti-movement core training"),
    ANTI_EXTENSION("Anti-Extension", "Resisting lumbar extension"),
    ANTI_FLEXION("Anti-Flexion", "Resisting lumbar flexion"),
    ANTI_LATERAL_FLEXION("Anti-Lateral Flexion", "Resisting side bending"),
    ANTI_ROTATION("Anti-Rotation", "Resisting rotational forces"),

    // Locomotion
    GAIT("Gait", "Walking and running patterns"),
    CRAWLING("Crawling", "Quadrupedal movements"),
    JUMPING("Jumping", "Vertical and horizontal jumping"),
    LANDING("Landing", "Deceleration and impact absorption"),

    // Rotational
    ROTATION("Rotation", "Rotational power movements"),
    SPIRAL("Spiral", "Multi-planar spiral movements"),

    // Carry
    CARRY("Carry", "Loaded carries and farmer's walks"),

    // Throwing
    THROWING("Throwing", "Overhead throwing pattern"),

    // Complex
    TURKISH_GET_UP("Turkish Get-up", "Complex ground-to-standing movement"),
    BURPEE("Burpee", "Complex multi-movement pattern"),

    // Isometric
    HOLD("Hold/Isometric", "Static hold positions"),

    // Flexibility
    STRETCH("Stretch", "Lengthening movements"),

    // Coordination
    COORDINATION("Coordination", "Complex coordination challenges"),

    // Power
    BALLISTIC("Ballistic", "Explosive ballistic movements"),
    PLYOMETRIC("Plyometric", "Stretch-shortening cycle"),

    // Other
    ISOLATION("Isolation", "Single-joint movements"),
    COMPOUND("Compound", "Multi-joint movements"),
    UNILATERAL("Unilateral", "Single-limb movements"),
    BILATERAL("Bilateral", "Double-limb movements");

    private final String displayName;
    private final String description;

    MovementPattern(String displayName, String description) {
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