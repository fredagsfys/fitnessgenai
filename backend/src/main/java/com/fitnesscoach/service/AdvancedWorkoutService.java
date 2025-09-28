package com.fitnesscoach.service;

import com.fitnesscoach.model.*;
import com.fitnesscoach.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for creating and managing advanced workout types
 * Demonstrates usage of all supported workout methodologies
 */
@Service
@Transactional
public class AdvancedWorkoutService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private WorkoutSessionTemplateRepository sessionRepository;

    @Autowired
    private ExerciseBlockRepository blockRepository;

    @Autowired
    private BlockItemRepository itemRepository;

    /**
     * Create a superset workout example
     */
    public WorkoutSessionTemplate createSupersetWorkout(Program program) {
        WorkoutSessionTemplate session = new WorkoutSessionTemplate("Upper Body Superset", program, 1);
        session = sessionRepository.save(session);

        // Create superset block: Bench Press + Bent-over Row
        ExerciseBlock supersetBlock = ExerciseBlock.createSuperset("A", session, 1);
        supersetBlock.setTotalRounds(4);
        supersetBlock.setRestAfterBlockSeconds(120); // 2 min rest between supersets
        supersetBlock = blockRepository.save(supersetBlock);

        // Bench Press (A1)
        Exercise benchPress = findOrCreateExercise("Bench Press", ExerciseCategory.STRENGTH, MovementPattern.PUSH_HORIZONTAL);
        AdvancedPrescription benchPrescription = AdvancedPrescription.superset(1, 4, 8, 0); // No rest within superset
        benchPrescription.setTargetRPE(8);
        addBlockItem(supersetBlock, 1, benchPress, benchPrescription);

        // Bent-over Row (A2)
        Exercise bentRow = findOrCreateExercise("Bent-over Barbell Row", ExerciseCategory.STRENGTH, MovementPattern.PULL_HORIZONTAL);
        AdvancedPrescription rowPrescription = AdvancedPrescription.superset(2, 4, 8, 120); // 2 min rest after superset
        rowPrescription.setTargetRPE(8);
        addBlockItem(supersetBlock, 2, bentRow, rowPrescription);

        return session;
    }

    /**
     * Create a Tabata workout example
     */
    public WorkoutSessionTemplate createTabataWorkout(Program program) {
        WorkoutSessionTemplate session = new WorkoutSessionTemplate("HIIT Tabata", program, 1);
        session = sessionRepository.save(session);

        // Tabata block: 8 rounds of 20s work / 10s rest
        ExerciseBlock tabataBlock = ExerciseBlock.createTabata("Tabata Round 1", session, 1, 8);
        tabataBlock.setRestAfterBlockSeconds(180); // 3 min rest between Tabata rounds
        tabataBlock = blockRepository.save(tabataBlock);

        // Burpees for Tabata
        Exercise burpees = findOrCreateExercise("Burpees", ExerciseCategory.HIIT, MovementPattern.BURPEE);
        AdvancedPrescription tabataPrescription = AdvancedPrescription.tabata(8);
        tabataPrescription.setSpecialInstructions("Max effort for 20 seconds, rest 10 seconds");
        addBlockItem(tabataBlock, 1, burpees, tabataPrescription);

        return session;
    }

    /**
     * Create an EMOM workout example
     */
    public WorkoutSessionTemplate createEMOMWorkout(Program program) {
        WorkoutSessionTemplate session = new WorkoutSessionTemplate("EMOM Strength", program, 1);
        session = sessionRepository.save(session);

        // EMOM block: Every minute on the minute for 12 minutes
        ExerciseBlock emomBlock = ExerciseBlock.createEMOM("EMOM 12", session, 1, 60, 720); // 12 minutes
        emomBlock = blockRepository.save(emomBlock);

        // Deadlifts EMOM
        Exercise deadlift = findOrCreateExercise("Deadlift", ExerciseCategory.POWERLIFTING, MovementPattern.HINGE);
        AdvancedPrescription emomPrescription = AdvancedPrescription.emom(1, 3, 12);
        emomPrescription.setPercentage1RM(75.0);
        emomPrescription.setSpecialInstructions("3 reps every minute on the minute");
        addBlockItem(emomBlock, 1, deadlift, emomPrescription);

        return session;
    }

    /**
     * Create a circuit training workout
     */
    public WorkoutSessionTemplate createCircuitWorkout(Program program) {
        WorkoutSessionTemplate session = new WorkoutSessionTemplate("Full Body Circuit", program, 1);
        session = sessionRepository.save(session);

        // Circuit block: 4 rounds, 45s work / 15s rest
        ExerciseBlock circuitBlock = ExerciseBlock.createCircuit("Circuit A", session, 1, 4, 15);
        circuitBlock.setWorkPhaseSeconds(45);
        circuitBlock.setRestPhaseSeconds(15);
        circuitBlock.setRestAfterBlockSeconds(180); // 3 min rest between rounds
        circuitBlock = blockRepository.save(circuitBlock);

        // Circuit exercises
        String[] exercises = {"Push-ups", "Mountain Climbers", "Jump Squats", "Plank"};
        ExerciseCategory[] categories = {ExerciseCategory.BODYWEIGHT, ExerciseCategory.CARDIO,
                                       ExerciseCategory.PLYOMETRIC, ExerciseCategory.STRENGTH};
        MovementPattern[] patterns = {MovementPattern.PUSH_HORIZONTAL, MovementPattern.COORDINATION,
                                    MovementPattern.SQUAT, MovementPattern.CORE_STABILITY};

        for (int i = 0; i < exercises.length; i++) {
            Exercise exercise = findOrCreateExercise(exercises[i], categories[i], patterns[i]);
            AdvancedPrescription prescription = new AdvancedPrescription();
            prescription.setSetType(AdvancedPrescription.SetType.CIRCUIT);
            prescription.setWorkTimeSeconds(45);
            prescription.setRestTimeSeconds(15);
            prescription.setCircuitPosition(i + 1);
            prescription.setIsCircuit(true);
            addBlockItem(circuitBlock, i + 1, exercise, prescription);
        }

        return session;
    }

    /**
     * Create a drop set workout example
     */
    public WorkoutSessionTemplate createDropSetWorkout(Program program) {
        WorkoutSessionTemplate session = new WorkoutSessionTemplate("Hypertrophy Drop Sets", program, 1);
        session = sessionRepository.save(session);

        // Drop set block
        ExerciseBlock dropSetBlock = new ExerciseBlock("Drop Set", session, 1);
        dropSetBlock.setBlockType(ExerciseBlock.BlockType.DROP_SET);
        dropSetBlock = blockRepository.save(dropSetBlock);

        // Leg Press Drop Set
        Exercise legPress = findOrCreateExercise("Leg Press", ExerciseCategory.BODYBUILDING, MovementPattern.SQUAT);
        AdvancedPrescription dropSetPrescription = AdvancedPrescription.dropSet(3, 12, 3, "[\"20%\", \"20%\", \"20%\"]");
        dropSetPrescription.setSpecialInstructions("Drop weight by 20% after failure, continue to failure again");
        addBlockItem(dropSetBlock, 1, legPress, dropSetPrescription);

        return session;
    }

    /**
     * Create a CrossFit WOD example
     */
    public WorkoutSessionTemplate createCrossFitWOD(Program program) {
        WorkoutSessionTemplate session = new WorkoutSessionTemplate("CrossFit WOD - Fran", program, 1);
        session = sessionRepository.save(session);

        // WOD block: 21-15-9 for time
        ExerciseBlock wodBlock = new ExerciseBlock("Fran", session, 1);
        wodBlock.setBlockType(ExerciseBlock.BlockType.FOR_TIME);
        wodBlock.setWorkoutType(WorkoutType.FOR_TIME);
        wodBlock.setBlockInstructions("21-15-9 reps for time");
        wodBlock = blockRepository.save(wodBlock);

        // Thrusters
        Exercise thrusters = findOrCreateExercise("Thrusters", ExerciseCategory.CROSSFIT, MovementPattern.COMPOUND);
        AdvancedPrescription thrusterPrescription = new AdvancedPrescription();
        thrusterPrescription.setSetType(AdvancedPrescription.SetType.FOR_TIME);
        thrusterPrescription.setWeight(95.0);
        thrusterPrescription.setWeightUnit("lbs");
        thrusterPrescription.setSpecialInstructions("21-15-9 reps, as fast as possible");
        addBlockItem(wodBlock, 1, thrusters, thrusterPrescription);

        // Pull-ups
        Exercise pullups = findOrCreateExercise("Pull-ups", ExerciseCategory.CROSSFIT, MovementPattern.PULL_VERTICAL);
        AdvancedPrescription pullupPrescription = new AdvancedPrescription();
        pullupPrescription.setSetType(AdvancedPrescription.SetType.FOR_TIME);
        pullupPrescription.setSpecialInstructions("21-15-9 reps, kipping allowed");
        addBlockItem(wodBlock, 2, pullups, pullupPrescription);

        return session;
    }

    /**
     * Create an AMRAP workout
     */
    public WorkoutSessionTemplate createAMRAPWorkout(Program program) {
        WorkoutSessionTemplate session = new WorkoutSessionTemplate("AMRAP 20", program, 1);
        session = sessionRepository.save(session);

        // AMRAP block: 20 minutes
        ExerciseBlock amrapBlock = ExerciseBlock.createAMRAP("AMRAP 20", session, 1, 1200); // 20 minutes
        amrapBlock.setBlockInstructions("As many rounds as possible in 20 minutes");
        amrapBlock = blockRepository.save(amrapBlock);

        // AMRAP exercises: 5 pull-ups, 10 push-ups, 15 air squats
        String[] exercises = {"Pull-ups", "Push-ups", "Air Squats"};
        int[] reps = {5, 10, 15};
        ExerciseCategory[] categories = {ExerciseCategory.CROSSFIT, ExerciseCategory.BODYWEIGHT, ExerciseCategory.BODYWEIGHT};
        MovementPattern[] patterns = {MovementPattern.PULL_VERTICAL, MovementPattern.PUSH_HORIZONTAL, MovementPattern.SQUAT};

        for (int i = 0; i < exercises.length; i++) {
            Exercise exercise = findOrCreateExercise(exercises[i], categories[i], patterns[i]);
            AdvancedPrescription prescription = new AdvancedPrescription();
            prescription.setSetType(AdvancedPrescription.SetType.AMRAP);
            prescription.setTargetReps(reps[i]);
            addBlockItem(amrapBlock, i + 1, exercise, prescription);
        }

        return session;
    }

    // Helper methods
    private Exercise findOrCreateExercise(String name, ExerciseCategory category, MovementPattern pattern) {
        List<Exercise> exercises = exerciseRepository.findByNameContainingIgnoreCase(name);
        if (!exercises.isEmpty()) {
            return exercises.get(0);
        }

        Exercise exercise = new Exercise(name);
        exercise.setCategory(category);
        exercise.setMovementPattern(pattern);
        exercise.setComplexity(ExerciseComplexity.INTERMEDIATE);
        return exerciseRepository.save(exercise);
    }

    private BlockItem addBlockItem(ExerciseBlock block, int orderIndex, Exercise exercise, AdvancedPrescription prescription) {
        BlockItem item = new BlockItem(block, orderIndex, exercise, null);
        item.setAdvancedPrescription(prescription);
        return itemRepository.save(item);
    }
}