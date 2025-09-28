package com.fitnesscoach.dto;

import com.fitnesscoach.model.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class DTOMapper {

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