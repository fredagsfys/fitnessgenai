package com.fitnesscoach.controller;

import com.fitnesscoach.dto.ProgramDTO;
import com.fitnesscoach.dto.SessionDTO;
import com.fitnesscoach.dto.DTOMapper;
import com.fitnesscoach.model.Program;
import com.fitnesscoach.model.WorkoutSessionTemplate;
import com.fitnesscoach.model.ExerciseBlock;
import com.fitnesscoach.model.BlockItem;
import com.fitnesscoach.model.Exercise;
import com.fitnesscoach.service.ProgramService;
import com.fitnesscoach.repository.ExerciseRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/programs")
@CrossOrigin(origins = "*")
public class ProgramController {

    private final ProgramService programService;
    private final ExerciseRepository exerciseRepository;

    @Autowired
    public ProgramController(ProgramService programService, ExerciseRepository exerciseRepository) {
        this.programService = programService;
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProgramDTO>> getAllPrograms() {
        List<Program> programs = programService.findAll();
        List<ProgramDTO> dtos = programs.stream()
                .map(DTOMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramDTO> getProgramById(@PathVariable UUID id) {
        return programService.findById(id)
                .map(DTOMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProgramDTO>> searchPrograms(@RequestParam String title) {
        List<Program> programs = programService.searchByTitle(title);
        List<ProgramDTO> dtos = programs.stream()
                .map(DTOMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProgramDTO>> getActivePrograms() {
        List<Program> programs = programService.findActivePrograms();
        List<ProgramDTO> dtos = programs.stream()
                .map(DTOMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<ProgramDTO> createProgram(@Valid @RequestBody ProgramDTO programDTO) {
        try {
            Program program = new Program(programDTO.title, programDTO.totalWeeks);

            if (programDTO.startDate != null) {
                program.setStartDate(LocalDate.parse(programDTO.startDate));
            }
            if (programDTO.endDate != null) {
                program.setEndDate(LocalDate.parse(programDTO.endDate));
            }

            // Add sessions with their blocks
            if (programDTO.sessions != null && !programDTO.sessions.isEmpty()) {
                for (SessionDTO sessionDTO : programDTO.sessions) {
                    WorkoutSessionTemplate session = new WorkoutSessionTemplate(
                        sessionDTO.title,
                        program,
                        sessionDTO.orderIndex
                    );

                    // Add blocks to session
                    if (sessionDTO.blocks != null) {
                        for (var blockDTO : sessionDTO.blocks) {
                            ExerciseBlock block = new ExerciseBlock(
                                blockDTO.label,
                                session,
                                blockDTO.orderIndex
                            );

                            // Map block configuration
                            if (blockDTO.blockType != null) {
                                block.setBlockType(ExerciseBlock.BlockType.valueOf(blockDTO.blockType));
                            }
                            if (blockDTO.workoutType != null) {
                                block.setWorkoutType(com.fitnesscoach.model.WorkoutType.valueOf(blockDTO.workoutType));
                            }
                            if (blockDTO.restBetweenItemsSeconds != null) {
                                block.setRestBetweenItemsSeconds(blockDTO.restBetweenItemsSeconds);
                            }
                            if (blockDTO.restAfterBlockSeconds != null) {
                                block.setRestAfterBlockSeconds(blockDTO.restAfterBlockSeconds);
                            }
                            if (blockDTO.amrapDurationSeconds != null) {
                                block.setAmrapDurationSeconds(blockDTO.amrapDurationSeconds);
                                block.setIsAMRAP(true);
                            }
                            if (blockDTO.totalRounds != null) {
                                block.setTotalRounds(blockDTO.totalRounds);
                            }
                            if (blockDTO.intervalSeconds != null) {
                                block.setIntervalSeconds(blockDTO.intervalSeconds);
                            }

                            // Add exercises to block
                            if (blockDTO.items != null) {
                                for (var itemDTO : blockDTO.items) {
                                    Exercise exercise = exerciseRepository.findById(UUID.fromString(itemDTO.exerciseId))
                                        .orElseThrow(() -> new RuntimeException("Exercise not found: " + itemDTO.exerciseId));

                                    BlockItem item = new BlockItem();
                                    item.setBlock(block);
                                    item.setExercise(exercise);
                                    item.setOrderIndex(itemDTO.orderIndex);

                                    // Map prescription to AdvancedPrescription
                                    if (itemDTO.prescription != null) {
                                        var prescDTO = itemDTO.prescription;
                                        com.fitnesscoach.model.AdvancedPrescription advPresc = new com.fitnesscoach.model.AdvancedPrescription();

                                        if (prescDTO.sets != null) advPresc.setSets(prescDTO.sets);
                                        if (prescDTO.minReps != null) advPresc.setRepRangeMin(prescDTO.minReps);
                                        if (prescDTO.maxReps != null) advPresc.setRepRangeMax(prescDTO.maxReps);
                                        if (prescDTO.targetReps != null) advPresc.setTargetReps(prescDTO.targetReps);
                                        if (prescDTO.weight != null) advPresc.setWeight(prescDTO.weight);
                                        if (prescDTO.weightUnit != null) advPresc.setWeightUnit(prescDTO.weightUnit);
                                        if (prescDTO.tempo != null) advPresc.setTempo(prescDTO.tempo);
                                        if (prescDTO.restSeconds != null) advPresc.setRestTimeSeconds(prescDTO.restSeconds);
                                        if (prescDTO.rpe != null) advPresc.setTargetRPE(prescDTO.rpe);
                                        if (prescDTO.rir != null) advPresc.setRepsInReserve(prescDTO.rir);
                                        if (prescDTO.percentage1RM != null) advPresc.setPercentage1RM(prescDTO.percentage1RM);
                                        if (prescDTO.notes != null) advPresc.setCoachNotes(prescDTO.notes);

                                        item.setAdvancedPrescription(advPresc);
                                    }

                                    block.getItems().add(item);
                                }
                            }

                            session.getBlocks().add(block);
                        }
                    }

                    program.getSessions().add(session);
                }
            }

            Program createdProgram = programService.createProgram(program);
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toDTO(createdProgram));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramDTO> updateProgram(
            @PathVariable UUID id,
            @Valid @RequestBody ProgramDTO programDTO) {
        try {
            Program programDetails = new Program(programDTO.title, programDTO.totalWeeks);
            if (programDTO.startDate != null) {
                programDetails.setStartDate(LocalDate.parse(programDTO.startDate));
            }
            if (programDTO.endDate != null) {
                programDetails.setEndDate(LocalDate.parse(programDTO.endDate));
            }

            Program updatedProgram = programService.updateProgram(id, programDetails);
            return ResponseEntity.ok(DTOMapper.toDTO(updatedProgram));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable UUID id) {
        try {
            programService.deleteProgram(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ProgramDTO> startProgram(
            @PathVariable UUID id,
            @RequestParam(required = false) String startDate) {
        try {
            LocalDate date = startDate != null ? LocalDate.parse(startDate) : LocalDate.now();
            Program program = programService.startProgram(id, date);
            return ResponseEntity.ok(DTOMapper.toDTO(program));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/sessions")
    public ResponseEntity<List<SessionDTO>> getSessionTemplates(@PathVariable UUID id) {
        List<WorkoutSessionTemplate> sessions = programService.getSessionTemplates(id);
        List<SessionDTO> dtos = sessions.stream()
                .map(DTOMapper::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }
}
