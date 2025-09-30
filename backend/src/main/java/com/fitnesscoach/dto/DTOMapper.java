package com.fitnesscoach.dto;

import com.fitnesscoach.model.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class DTOMapper {

    // Static method for easy use in controllers
    public static ProgramDTO toDTO(Program program) {
        if (program == null) return null;

        ProgramDTO dto = new ProgramDTO();
        dto.id = program.getId();
        dto.title = program.getTitle();
        dto.startDate = program.getStartDate() != null ? program.getStartDate().toString() : null;
        dto.endDate = program.getEndDate() != null ? program.getEndDate().toString() : null;
        dto.totalWeeks = program.getTotalWeeks();
        dto.sessions = program.getSessions().stream()
                .map(DTOMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
        return dto;
    }

    public static SessionDTO toDTO(WorkoutSessionTemplate session) {
        if (session == null) return null;

        SessionDTO dto = new SessionDTO();
        dto.id = session.getId();
        dto.title = session.getTitle();
        dto.orderIndex = session.getOrderIndex();
        dto.blocks = session.getBlocks().stream()
                .map(DTOMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
        return dto;
    }

    public static BlockDTO toDTO(ExerciseBlock block) {
        if (block == null) return null;

        BlockDTO dto = new BlockDTO();
        dto.label = block.getLabel();
        dto.orderIndex = block.getOrderIndex();
        dto.blockType = block.getBlockType() != null ? block.getBlockType().name() : null;
        dto.workoutType = block.getWorkoutType() != null ? block.getWorkoutType().name() : null;
        dto.restBetweenItemsSeconds = block.getRestBetweenItemsSeconds();
        dto.restAfterBlockSeconds = block.getRestAfterBlockSeconds();
        dto.totalRounds = block.getTotalRounds();
        dto.amrapDurationSeconds = block.getAmrapDurationSeconds();
        dto.intervalSeconds = block.getIntervalSeconds();
        dto.workPhaseSeconds = block.getWorkPhaseSeconds();
        dto.restPhaseSeconds = block.getRestPhaseSeconds();
        dto.blockInstructions = block.getBlockInstructions();
        dto.notes = block.getNotes();
        dto.items = block.getItems().stream()
                .map(DTOMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
        return dto;
    }

    public static BlockItemDTO toDTO(BlockItem item) {
        if (item == null) return null;

        BlockItemDTO dto = new BlockItemDTO();
        dto.id = item.getId();
        dto.orderIndex = item.getOrderIndex();
        dto.exerciseName = item.getExercise().getName();
        dto.exerciseId = item.getExercise().getId().toString();

        // Use advanced prescription if available
        if (item.getAdvancedPrescription() != null) {
            dto.prescription = toDTO(item.getAdvancedPrescription());
        } else if (item.getPrescription() != null) {
            dto.prescription = toDTO(item.getPrescription());
        }

        return dto;
    }

    public static PrescriptionDTO toDTO(AdvancedPrescription advPresc) {
        if (advPresc == null) return null;

        PrescriptionDTO dto = new PrescriptionDTO();
        dto.sets = advPresc.getSets();
        dto.minReps = advPresc.getRepRangeMin();
        dto.maxReps = advPresc.getRepRangeMax();
        dto.targetReps = advPresc.getTargetReps();
        dto.weight = advPresc.getWeight();
        dto.weightUnit = advPresc.getWeightUnit();
        dto.tempo = advPresc.getTempo();
        dto.restSeconds = advPresc.getRestTimeSeconds();
        dto.rpe = advPresc.getTargetRPE();
        dto.rir = advPresc.getRepsInReserve();
        dto.percentage1RM = advPresc.getPercentage1RM();
        dto.notes = advPresc.getCoachNotes();
        return dto;
    }

    public static PrescriptionDTO toDTO(Prescription prescription) {
        if (prescription == null) return null;

        PrescriptionDTO dto = new PrescriptionDTO();
        dto.weekStart = prescription.getWeekStart();
        dto.weekEnd = prescription.getWeekEnd();
        dto.sets = prescription.getSets();
        dto.targetReps = prescription.getTargetReps();
        dto.tempo = prescription.getTempo();
        dto.restSeconds = prescription.getRestSeconds();
        dto.notes = prescription.getCoachNotes();
        return dto;
    }

    // Instance methods for backward compatibility
    public ProgramDTO toProgramDTO(Program program) {
        if (program == null) return null;

        return new ProgramDTO(
                program.getId(),
                program.getTitle(),
                program.getTotalWeeks(),
                program.getSessions().stream()
                        .map(this::toSessionDTO)
                        .collect(Collectors.toList())
        );
    }

    public SessionDTO toSessionDTO(WorkoutSessionTemplate session) {
        if (session == null) return null;

        return new SessionDTO(
                session.getId(),
                session.getTitle(),
                session.getOrderIndex(),
                session.getBlocks().stream()
                        .map(this::toBlockDTO)
                        .collect(Collectors.toList())
        );
    }

    public BlockDTO toBlockDTO(ExerciseBlock block) {
        if (block == null) return null;

        return new BlockDTO(
                block.getLabel(),
                block.getOrderIndex(),
                block.getItems().stream()
                        .map(this::toBlockItemDTO)
                        .collect(Collectors.toList())
        );
    }

    public BlockItemDTO toBlockItemDTO(BlockItem item) {
        if (item == null) return null;

        return new BlockItemDTO(
                item.getId(),
                item.getOrderIndex(),
                item.getExercise().getName(),
                toPrescriptionDTO(item.getPrescription())
        );
    }

    public PrescriptionDTO toPrescriptionDTO(Prescription prescription) {
        if (prescription == null) return null;

        return new PrescriptionDTO(
                prescription.getWeekStart(),
                prescription.getWeekEnd(),
                prescription.getSets(),
                prescription.getTargetReps(),
                prescription.getTempo(),
                prescription.getRestSeconds(),
                prescription.getCoachNotes()
        );
    }

    public SetResultDTO toSetResultDTO(SetResult setResult) {
        if (setResult == null) return null;

        return new SetResultDTO(
                setResult.getId(),
                setResult.getSession().getTemplate() != null ? setResult.getSession().getTemplate().getTitle() : null,
                setResult.getSession().getDate(),
                setResult.getBlockLabel(),
                setResult.getBlockItemOrder(),
                setResult.getSetNumber(),
                setResult.getExercise().getName(),
                setResult.getTargetReps(),
                setResult.getTargetTempo(),
                setResult.getTargetRestSec(),
                setResult.getPerformedReps(),
                setResult.getWeight(),
                setResult.getWeightUnit().name(),
                setResult.getRpe(),
                setResult.getRestTakenSec(),
                setResult.getComments(),
                setResult.getCompletedAt()
        );
    }

    public Prescription fromPrescriptionDTO(PrescriptionDTO dto) {
        if (dto == null) return null;

        Prescription prescription = new Prescription();
        prescription.setWeekStart(dto.weekStart);
        prescription.setWeekEnd(dto.weekEnd);
        prescription.setSets(dto.sets);
        prescription.setTargetReps(dto.targetReps);
        prescription.setTempo(dto.tempo);
        prescription.setRestSeconds(dto.restSeconds);
        prescription.setCoachNotes(dto.coachNotes);

        return prescription;
    }
}