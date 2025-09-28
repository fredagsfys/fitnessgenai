package com.example.fitness.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

/**
 * Data model for representing templated workout programs (with supersets like A1/A2, week ranges,
 * sets/reps/tempo/rest prescriptions) and logging execution results per set.
 */
public class ModelMarker { /* package marker - no code */ }

// ---------------------------
// Core catalog + program plan
// ---------------------------

@Entity
@Table(name = "exercises")
public class Exercise {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Display name, e.g., "Bulg. Split Squats Smith" */
    @Column(nullable = false)
    private String name;

    /** Optional: categorization, equipment, or other metadata */
    private String primaryMuscle;
    private String equipment;    // e.g., "Smith machine", "barbell"

    @Column(length = 2000)
    private String notes;

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPrimaryMuscle() { return primaryMuscle; }
    public void setPrimaryMuscle(String primaryMuscle) { this.primaryMuscle = primaryMuscle; }
    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

@Entity
@Table(name = "programs")
public class Program {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title; // e.g., "Haris 2025-09-17"

    private LocalDate startDate; // optional
    private LocalDate endDate;   // optional

    /** How many distinct calendar weeks this template spans, e.g., 4 */
    private int totalWeeks;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<WorkoutSessionTemplate> sessions = new ArrayList<>();

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public int getTotalWeeks() { return totalWeeks; }
    public void setTotalWeeks(int totalWeeks) { this.totalWeeks = totalWeeks; }
    public List<WorkoutSessionTemplate> getSessions() { return sessions; }
}

/**
 * A planned "Pass" (e.g., Pass 1 or Pass 2) containing alphabetic blocks (A, B, C, D).
 */
@Entity
@Table(name = "workout_session_templates")
public class WorkoutSessionTemplate {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private Program program;

    @Column(nullable = false)
    private String title; // e.g., "Pass 1"

    private int orderIndex; // display order within a program

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<ExerciseBlock> blocks = new ArrayList<>();

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Program getProgram() { return program; }
    public void setProgram(Program program) { this.program = program; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public List<ExerciseBlock> getBlocks() { return blocks; }
}

/**
 * A, B, C, D blocks, optionally containing a superset like A1 + A2, B1 + B2.
 */
@Entity
@Table(name = "exercise_blocks")
public class ExerciseBlock {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private WorkoutSessionTemplate session;

    /** Alphabetic label: A, B, C, D */
    @Column(nullable = false, length = 1)
    private String label;

    private int orderIndex;

    @OneToMany(mappedBy = "block", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<BlockItem> items = new ArrayList<>();

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WorkoutSessionTemplate getSession() { return session; }
    public void setSession(WorkoutSessionTemplate session) { this.session = session; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public List<BlockItem> getItems() { return items; }
}

/**
 * A concrete exercise within a block (e.g., A1: Bulgarian Split Squat; A2: RDL), with a prescription
 * that can span a range of weeks (e.g., weeks 1-4: 5 sets x 6 reps, tempo 30x0, rest 105s).
 */
@Entity
@Table(name = "block_items")
public class BlockItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private ExerciseBlock block;

    private int orderIndex; // e.g., 1 for "A1", 2 for "A2"

    @ManyToOne(optional = false)
    private Exercise exercise;

    @Embedded
    private Prescription prescription;

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ExerciseBlock getBlock() { return block; }
    public void setBlock(ExerciseBlock block) { this.block = block; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }
    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }
}

@Embeddable
public class Prescription {
    /** Inclusive week range the prescription applies to, e.g., 1..4 */
    private int weekStart;
    private int weekEnd;

    private int sets;
    private int targetReps; // if variable, store the upper target and add notes

    /** Unparsed tempo string like "30x0" or "3010(paus ¼)" */
    private String tempo;

    /** Prescribed rest between working sets, in seconds */
    private int restSeconds;

    @Column(length = 1000)
    private String coachNotes; // e.g., "(¼ i topp)", pauses, etc.

    // getters/setters
    public int getWeekStart() { return weekStart; }
    public void setWeekStart(int weekStart) { this.weekStart = weekStart; }
    public int getWeekEnd() { return weekEnd; }
    public void setWeekEnd(int weekEnd) { this.weekEnd = weekEnd; }
    public int getSets() { return sets; }
    public void setSets(int sets) { this.sets = sets; }
    public int getTargetReps() { return targetReps; }
    public void setTargetReps(int targetReps) { this.targetReps = targetReps; }
    public String getTempo() { return tempo; }
    public void setTempo(String tempo) { this.tempo = tempo; }
    public int getRestSeconds() { return restSeconds; }
    public void setRestSeconds(int restSeconds) { this.restSeconds = restSeconds; }
    public String getCoachNotes() { return coachNotes; }
    public void setCoachNotes(String coachNotes) { this.coachNotes = coachNotes; }
}

// ---------------------------
// Executed workouts + results
// ---------------------------

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The template this instance came from (optional if ad-hoc) */
    @ManyToOne
    private WorkoutSessionTemplate template;

    private LocalDate date;   // when the athlete performed it
    private Integer week;     // which program week (1..N), optional

    @Column(length = 2000)
    private String notes;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("blockLabel ASC, blockItemOrder ASC, setNumber ASC")
    private List<SetResult> sets = new ArrayList<>();

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WorkoutSessionTemplate getTemplate() { return template; }
    public void setTemplate(WorkoutSessionTemplate template) { this.template = template; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Integer getWeek() { return week; }
    public void setWeek(Integer week) { this.week = week; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<SetResult> getSets() { return sets; }
}

@Entity
@Table(name = "set_results")
public class SetResult {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private WorkoutSession session;

    /** Optional references to the plan */
    @ManyToOne
    private BlockItem plannedItem;

    /** Denormalized for easier queries and reporting */
    private String blockLabel;       // e.g., "A"
    private int blockItemOrder;      // 1 for A1, 2 for A2
    private int setNumber;           // 1..N within that exercise

    @ManyToOne(optional = false)
    private Exercise exercise;

    // Targets at time of execution (copied from template for history)
    private Integer targetReps;      // nullable if AMRAP
    private String targetTempo;      // e.g., "30x0"
    private Integer targetRestSec;   // seconds

    // Actual performance
    private Integer performedReps;
    private Double weight;           // numeric load

    @Enumerated(EnumType.STRING)
    private WeightUnit weightUnit = WeightUnit.KG;

    private Double rpe;              // e.g., 8.5; optional
    private Integer restTakenSec;    // actual rest taken

    @Column(length = 1000)
    private String comments;         // e.g., technique, pain, etc.

    private Instant completedAt;     // timestamp for the set

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public WorkoutSession getSession() { return session; }
    public void setSession(WorkoutSession session) { this.session = session; }
    public BlockItem getPlannedItem() { return plannedItem; }
    public void setPlannedItem(BlockItem plannedItem) { this.plannedItem = plannedItem; }
    public String getBlockLabel() { return blockLabel; }
    public void setBlockLabel(String blockLabel) { this.blockLabel = blockLabel; }
    public int getBlockItemOrder() { return blockItemOrder; }
    public void setBlockItemOrder(int blockItemOrder) { this.blockItemOrder = blockItemOrder; }
    public int getSetNumber() { return setNumber; }
    public void setSetNumber(int setNumber) { this.setNumber = setNumber; }
    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }
    public Integer getTargetReps() { return targetReps; }
    public void setTargetReps(Integer targetReps) { this.targetReps = targetReps; }
    public String getTargetTempo() { return targetTempo; }
    public void setTargetTempo(String targetTempo) { this.targetTempo = targetTempo; }
    public Integer getTargetRestSec() { return targetRestSec; }
    public void setTargetRestSec(Integer targetRestSec) { this.targetRestSec = targetRestSec; }
    public Integer getPerformedReps() { return performedReps; }
    public void setPerformedReps(Integer performedReps) { this.performedReps = performedReps; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    public WeightUnit getWeightUnit() { return weightUnit; }
    public void setWeightUnit(WeightUnit weightUnit) { this.weightUnit = weightUnit; }
    public Double getRpe() { return rpe; }
    public void setRpe(Double rpe) { this.rpe = rpe; }
    public Integer getRestTakenSec() { return restTakenSec; }
    public void setRestTakenSec(Integer restTakenSec) { this.restTakenSec = restTakenSec; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}

public enum WeightUnit { KG, LB }

// ---------------------------
// Helpful value objects
// ---------------------------

/** Optional parsing helper for tempo strings such as "30x0" or "3110" with notes. */
@Embeddable
public class TempoComponents {
    /** Seconds for eccentric, bottom pause, concentric, top pause. Use null when not provided. */
    private Integer eccentric;
    private Integer bottomPause;
    private Integer concentric;
    private Integer topPause;

    private String raw; // original unparsed tempo string

    // getters/setters
    public Integer getEccentric() { return eccentric; }
    public void setEccentric(Integer eccentric) { this.eccentric = eccentric; }
    public Integer getBottomPause() { return bottomPause; }
    public void setBottomPause(Integer bottomPause) { this.bottomPause = bottomPause; }
    public Integer getConcentric() { return concentric; }
    public void setConcentric(Integer concentric) { this.concentric = concentric; }
    public Integer getTopPause() { return topPause; }
    public void setTopPause(Integer topPause) { this.topPause = topPause; }
    public String getRaw() { return raw; }
    public void setRaw(String raw) { this.raw = raw; }
}

// ---------------------------
// DTOs for API payloads
// ---------------------------

/** Lightweight DTOs to expose via REST without leaking JPA entities. */
class ProgramDTO {
    public UUID id;
    public String title;
    public int totalWeeks;
    public List<SessionDTO> sessions;
}
class SessionDTO {
    public UUID id; public String title; public int orderIndex; public List<BlockDTO> blocks;
}
class BlockDTO {
    public String label; public int orderIndex; public List<BlockItemDTO> items;
}
class BlockItemDTO {
    public UUID id; public int orderIndex; public String exerciseName; public PrescriptionDTO rx;
}
class PrescriptionDTO {
    public int weekStart, weekEnd, sets, targetReps; public String tempo; public int restSeconds; public String coachNotes;
}
class SetResultDTO {
    public UUID id; public String sessionTitle; public LocalDate date; public String blockLabel; public int blockItemOrder; public int setNumber;
    public String exerciseName; public Integer targetReps; public String targetTempo; public Integer targetRestSec;
    public Integer performedReps; public Double weight; public String weightUnit; public Double rpe; public Integer restTakenSec; public String comments; public Instant completedAt;
}
