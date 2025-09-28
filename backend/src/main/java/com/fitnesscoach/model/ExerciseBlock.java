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

    @Column(nullable = false)
    private String label;

    private int orderIndex;

    // Block type and structure
    @Enumerated(EnumType.STRING)
    private BlockType blockType;

    @Enumerated(EnumType.STRING)
    private WorkoutType workoutType;

    // Time-based block configuration
    private Integer blockDurationSeconds;
    private Integer restBetweenItemsSeconds;
    private Integer restAfterBlockSeconds;
    private Integer totalRounds;

    // Circuit/superset configuration
    private boolean isSuperset;
    private boolean isCircuit;
    private boolean isGiantSet;

    // EMOM/Tabata specific
    private Integer intervalSeconds; // For EMOM intervals
    private Integer workPhaseSeconds; // For Tabata work phase
    private Integer restPhaseSeconds; // For Tabata rest phase

    // AMRAP configuration
    private boolean isAMRAP;
    private Integer amrapDurationSeconds;

    // Complex training
    private boolean isComplex;

    // Block-level instructions
    @Column(length = 2000)
    private String blockInstructions;

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "block", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<BlockItem> items = new ArrayList<>();

    public ExerciseBlock() {}

    public ExerciseBlock(String label, WorkoutSessionTemplate session, int orderIndex) {
        this.label = label;
        this.session = session;
        this.orderIndex = orderIndex;
        this.blockType = BlockType.STRAIGHT_SETS; // Default
    }

    // Block type enumeration
    public enum BlockType {
        STRAIGHT_SETS("Straight Sets"),
        SUPERSET("Superset"),
        TRISET("Triset"),
        GIANT_SET("Giant Set"),
        CIRCUIT("Circuit"),
        EMOM("EMOM"),
        TABATA("Tabata"),
        AMRAP("AMRAP"),
        FOR_TIME("For Time"),
        COMPLEX("Complex Training"),
        LADDER("Ladder"),
        PYRAMID("Pyramid"),
        WAVE("Wave Loading"),
        CLUSTER("Cluster Sets"),
        REST_PAUSE("Rest-Pause"),
        DROP_SET("Drop Set"),
        MECHANICAL_DROP_SET("Mechanical Drop Set"),
        DEATH_BY("Death By"),
        CUSTOM("Custom");

        private final String displayName;

        BlockType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Static factory methods for common block types
    public static ExerciseBlock createSuperset(String label, WorkoutSessionTemplate session, int orderIndex) {
        ExerciseBlock block = new ExerciseBlock(label, session, orderIndex);
        block.setBlockType(BlockType.SUPERSET);
        block.setIsSuperset(true);
        return block;
    }

    public static ExerciseBlock createCircuit(String label, WorkoutSessionTemplate session, int orderIndex,
                                            int rounds, int restBetweenSeconds) {
        ExerciseBlock block = new ExerciseBlock(label, session, orderIndex);
        block.setBlockType(BlockType.CIRCUIT);
        block.setIsCircuit(true);
        block.setTotalRounds(rounds);
        block.setRestBetweenItemsSeconds(restBetweenSeconds);
        return block;
    }

    public static ExerciseBlock createEMOM(String label, WorkoutSessionTemplate session, int orderIndex,
                                         int intervalSeconds, int totalDurationSeconds) {
        ExerciseBlock block = new ExerciseBlock(label, session, orderIndex);
        block.setBlockType(BlockType.EMOM);
        block.setIntervalSeconds(intervalSeconds);
        block.setBlockDurationSeconds(totalDurationSeconds);
        return block;
    }

    public static ExerciseBlock createTabata(String label, WorkoutSessionTemplate session, int orderIndex,
                                           int rounds) {
        ExerciseBlock block = new ExerciseBlock(label, session, orderIndex);
        block.setBlockType(BlockType.TABATA);
        block.setTotalRounds(rounds);
        block.setWorkPhaseSeconds(20);
        block.setRestPhaseSeconds(10);
        block.setBlockDurationSeconds(rounds * 30); // 20s work + 10s rest per round
        return block;
    }

    public static ExerciseBlock createAMRAP(String label, WorkoutSessionTemplate session, int orderIndex,
                                          int durationSeconds) {
        ExerciseBlock block = new ExerciseBlock(label, session, orderIndex);
        block.setBlockType(BlockType.AMRAP);
        block.setIsAMRAP(true);
        block.setAmrapDurationSeconds(durationSeconds);
        block.setBlockDurationSeconds(durationSeconds);
        return block;
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

    // Additional getters and setters for enhanced fields
    public BlockType getBlockType() { return blockType; }
    public void setBlockType(BlockType blockType) { this.blockType = blockType; }

    public WorkoutType getWorkoutType() { return workoutType; }
    public void setWorkoutType(WorkoutType workoutType) { this.workoutType = workoutType; }

    public Integer getBlockDurationSeconds() { return blockDurationSeconds; }
    public void setBlockDurationSeconds(Integer blockDurationSeconds) { this.blockDurationSeconds = blockDurationSeconds; }

    public Integer getRestBetweenItemsSeconds() { return restBetweenItemsSeconds; }
    public void setRestBetweenItemsSeconds(Integer restBetweenItemsSeconds) { this.restBetweenItemsSeconds = restBetweenItemsSeconds; }

    public Integer getRestAfterBlockSeconds() { return restAfterBlockSeconds; }
    public void setRestAfterBlockSeconds(Integer restAfterBlockSeconds) { this.restAfterBlockSeconds = restAfterBlockSeconds; }

    public Integer getTotalRounds() { return totalRounds; }
    public void setTotalRounds(Integer totalRounds) { this.totalRounds = totalRounds; }

    public boolean isSuperset() { return isSuperset; }
    public void setIsSuperset(boolean isSuperset) { this.isSuperset = isSuperset; }

    public boolean isCircuit() { return isCircuit; }
    public void setIsCircuit(boolean isCircuit) { this.isCircuit = isCircuit; }

    public boolean isGiantSet() { return isGiantSet; }
    public void setIsGiantSet(boolean isGiantSet) { this.isGiantSet = isGiantSet; }

    public Integer getIntervalSeconds() { return intervalSeconds; }
    public void setIntervalSeconds(Integer intervalSeconds) { this.intervalSeconds = intervalSeconds; }

    public Integer getWorkPhaseSeconds() { return workPhaseSeconds; }
    public void setWorkPhaseSeconds(Integer workPhaseSeconds) { this.workPhaseSeconds = workPhaseSeconds; }

    public Integer getRestPhaseSeconds() { return restPhaseSeconds; }
    public void setRestPhaseSeconds(Integer restPhaseSeconds) { this.restPhaseSeconds = restPhaseSeconds; }

    public boolean isAMRAP() { return isAMRAP; }
    public void setIsAMRAP(boolean isAMRAP) { this.isAMRAP = isAMRAP; }

    public Integer getAmrapDurationSeconds() { return amrapDurationSeconds; }
    public void setAmrapDurationSeconds(Integer amrapDurationSeconds) { this.amrapDurationSeconds = amrapDurationSeconds; }

    public boolean isComplex() { return isComplex; }
    public void setIsComplex(boolean isComplex) { this.isComplex = isComplex; }

    public String getBlockInstructions() { return blockInstructions; }
    public void setBlockInstructions(String blockInstructions) { this.blockInstructions = blockInstructions; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}