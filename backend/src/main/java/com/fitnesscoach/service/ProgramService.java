package com.fitnesscoach.service;

import com.fitnesscoach.model.Program;
import com.fitnesscoach.model.WorkoutSessionTemplate;
import com.fitnesscoach.repository.ProgramRepository;
import com.fitnesscoach.repository.WorkoutSessionTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProgramService {

    private final ProgramRepository programRepository;
    private final WorkoutSessionTemplateRepository sessionTemplateRepository;

    @Autowired
    public ProgramService(ProgramRepository programRepository,
                         WorkoutSessionTemplateRepository sessionTemplateRepository) {
        this.programRepository = programRepository;
        this.sessionTemplateRepository = sessionTemplateRepository;
    }

    public Program createProgram(Program program) {
        return programRepository.save(program);
    }

    public Program createProgram(String title, int totalWeeks) {
        Program program = new Program(title, totalWeeks);
        return programRepository.save(program);
    }

    @Transactional(readOnly = true)
    public Optional<Program> findById(UUID id) {
        return programRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Program> findAll() {
        return programRepository.findAllOrderByStartDateDesc();
    }

    @Transactional(readOnly = true)
    public List<Program> searchByTitle(String title) {
        return programRepository.findByTitleContainingIgnoreCase(title);
    }

    @Transactional(readOnly = true)
    public List<Program> findActivePrograms() {
        return programRepository.findActivePrograms(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<Program> findActiveProgramsAt(LocalDate date) {
        return programRepository.findActivePrograms(date);
    }

    public Program updateProgram(UUID id, Program programDetails) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));

        program.setTitle(programDetails.getTitle());
        program.setStartDate(programDetails.getStartDate());
        program.setEndDate(programDetails.getEndDate());
        program.setTotalWeeks(programDetails.getTotalWeeks());

        return programRepository.save(program);
    }

    public void deleteProgram(UUID id) {
        if (!programRepository.existsById(id)) {
            throw new RuntimeException("Program not found with id: " + id);
        }
        programRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSessionTemplate> getSessionTemplates(UUID programId) {
        return sessionTemplateRepository.findByProgramIdOrderByOrderIndex(programId);
    }

    public Program addSessionTemplate(UUID programId, WorkoutSessionTemplate sessionTemplate) {
        Program program = findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + programId));

        sessionTemplate.setProgram(program);
        sessionTemplate.setOrderIndex(program.getSessions().size());
        program.getSessions().add(sessionTemplate);

        return programRepository.save(program);
    }

    public Program startProgram(UUID id, LocalDate startDate) {
        Program program = findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));

        program.setStartDate(startDate);
        if (program.getTotalWeeks() > 0) {
            program.setEndDate(startDate.plusWeeks(program.getTotalWeeks()));
        }

        return programRepository.save(program);
    }
}