package com.fitnesscoach.config;

import com.fitnesscoach.model.*;
import com.fitnesscoach.repository.ExerciseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;

    public DataSeeder(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        if (exerciseRepository.count() > 0) {
            System.out.println("Database already contains exercises. Skipping seed data.");
            return;
        }

        System.out.println("Seeding exercise database...");

        // Chest exercises
        createExercise(
            "Barbell Bench Press",
            "Classic chest exercise performed lying on a flat bench, pressing a barbell from chest to full arm extension.",
            "Chest",
            "Barbell",
            ExerciseCategory.STRENGTH,
            MovementPattern.PUSH_HORIZONTAL,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Push-ups",
            "Bodyweight exercise performed in a prone position, raising and lowering the body using the arms.",
            "Chest",
            "Bodyweight",
            ExerciseCategory.BODYWEIGHT,
            MovementPattern.PUSH_HORIZONTAL,
            ExerciseComplexity.BEGINNER,
            Set.of(MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Dumbbell Chest Fly",
            "Isolation exercise for chest performed lying on a bench with dumbbells, moving arms in an arc motion.",
            "Chest",
            "Dumbbells",
            ExerciseCategory.BODYBUILDING,
            MovementPattern.PUSH_HORIZONTAL,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        // Back exercises
        createExercise(
            "Pull-ups",
            "Upper body exercise where you hang from a bar and pull yourself up until your chin is over the bar.",
            "Back",
            "Pull-up Bar",
            ExerciseCategory.BODYWEIGHT,
            MovementPattern.PULL_VERTICAL,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.REPS, MeasurementType.SETS, MeasurementType.BODYWEIGHT)
        );

        createExercise(
            "Barbell Deadlift",
            "Compound exercise lifting a barbell from the ground to hip level, then lowering it back down.",
            "Back",
            "Barbell",
            ExerciseCategory.POWERLIFTING,
            MovementPattern.HINGE,
            ExerciseComplexity.ADVANCED,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Bent-over Barbell Row",
            "Rowing movement performed while bent over, pulling barbell to lower chest/upper abdomen.",
            "Back",
            "Barbell",
            ExerciseCategory.STRENGTH,
            MovementPattern.PULL_HORIZONTAL,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        // Leg exercises
        createExercise(
            "Barbell Back Squat",
            "Fundamental lower body exercise performed with barbell on upper back, squatting down and standing up.",
            "Legs",
            "Barbell",
            ExerciseCategory.POWERLIFTING,
            MovementPattern.SQUAT,
            ExerciseComplexity.ADVANCED,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Leg Press",
            "Machine-based exercise pressing weight away from body using legs.",
            "Legs",
            "Machine",
            ExerciseCategory.MACHINES,
            MovementPattern.SQUAT,
            ExerciseComplexity.BEGINNER,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Walking Lunges",
            "Dynamic single-leg exercise stepping forward into a lunge position, alternating legs.",
            "Legs",
            "Bodyweight",
            ExerciseCategory.FUNCTIONAL,
            MovementPattern.LUNGE,
            ExerciseComplexity.BEGINNER,
            Set.of(MeasurementType.REPS, MeasurementType.DISTANCE, MeasurementType.SETS)
        );

        // Shoulder exercises
        createExercise(
            "Overhead Press",
            "Pressing movement pushing barbell or dumbbells from shoulder height to overhead.",
            "Shoulders",
            "Barbell",
            ExerciseCategory.STRENGTH,
            MovementPattern.PUSH_VERTICAL,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Lateral Raises",
            "Isolation exercise raising dumbbells to the side to shoulder height.",
            "Shoulders",
            "Dumbbells",
            ExerciseCategory.BODYBUILDING,
            MovementPattern.ISOLATION,
            ExerciseComplexity.BEGINNER,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        // Arms exercises
        createExercise(
            "Barbell Curl",
            "Isolation exercise for biceps, curling barbell from hip to shoulder level.",
            "Arms",
            "Barbell",
            ExerciseCategory.BODYBUILDING,
            MovementPattern.ISOLATION,
            ExerciseComplexity.BEGINNER,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Tricep Dips",
            "Compound bodyweight exercise for triceps performed on parallel bars or bench.",
            "Arms",
            "Bodyweight",
            ExerciseCategory.BODYWEIGHT,
            MovementPattern.PUSH_VERTICAL,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.REPS, MeasurementType.SETS, MeasurementType.BODYWEIGHT)
        );

        // Core exercises
        createExercise(
            "Plank",
            "Isometric core exercise holding body in a straight line supported by forearms and toes.",
            "Core",
            "Bodyweight",
            ExerciseCategory.BODYWEIGHT,
            MovementPattern.CORE_STABILITY,
            ExerciseComplexity.BEGINNER,
            Set.of(MeasurementType.DURATION, MeasurementType.SETS)
        );

        createExercise(
            "Russian Twists",
            "Rotational core exercise performed seated, twisting torso side to side.",
            "Core",
            "Bodyweight",
            ExerciseCategory.FUNCTIONAL,
            MovementPattern.ROTATION,
            ExerciseComplexity.BEGINNER,
            Set.of(MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Hanging Leg Raises",
            "Advanced core exercise hanging from a bar and raising legs to horizontal position.",
            "Core",
            "Pull-up Bar",
            ExerciseCategory.BODYWEIGHT,
            MovementPattern.ANTI_EXTENSION,
            ExerciseComplexity.ADVANCED,
            Set.of(MeasurementType.REPS, MeasurementType.SETS)
        );

        // Full body / Functional
        createExercise(
            "Burpees",
            "Full body exercise combining a squat, plank, push-up, and jump in sequence.",
            "Full Body",
            "Bodyweight",
            ExerciseCategory.HIIT,
            MovementPattern.BURPEE,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.REPS, MeasurementType.DURATION, MeasurementType.SETS)
        );

        createExercise(
            "Kettlebell Swings",
            "Ballistic exercise swinging kettlebell from between legs to chest/eye level using hip drive.",
            "Full Body",
            "Kettlebell",
            ExerciseCategory.KETTLEBELL,
            MovementPattern.HINGE,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.WEIGHT, MeasurementType.REPS, MeasurementType.SETS)
        );

        createExercise(
            "Box Jumps",
            "Plyometric exercise jumping from ground onto an elevated platform.",
            "Legs",
            "Plyo Box",
            ExerciseCategory.PLYOMETRIC,
            MovementPattern.JUMPING,
            ExerciseComplexity.INTERMEDIATE,
            Set.of(MeasurementType.REPS, MeasurementType.HEIGHT, MeasurementType.SETS)
        );

        createExercise(
            "Farmer's Walk",
            "Loaded carry exercise walking while holding heavy weights at sides.",
            "Full Body",
            "Dumbbells",
            ExerciseCategory.FUNCTIONAL,
            MovementPattern.CARRY,
            ExerciseComplexity.BEGINNER,
            Set.of(MeasurementType.WEIGHT, MeasurementType.DISTANCE, MeasurementType.DURATION)
        );

        System.out.println("Database seeding completed! Added " + exerciseRepository.count() + " exercises.");
    }

    private void createExercise(String name, String description, String primaryMuscle,
                                String equipment, ExerciseCategory category,
                                MovementPattern movementPattern, ExerciseComplexity complexity,
                                Set<MeasurementType> measurementTypes) {
        Exercise exercise = new Exercise();
        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setPrimaryMuscle(primaryMuscle);
        exercise.setEquipment(equipment);
        exercise.setCategory(category);
        exercise.setMovementPattern(movementPattern);
        exercise.setComplexity(complexity);
        exercise.setMeasurementTypes(measurementTypes);

        exerciseRepository.save(exercise);
    }
}