package com.fitnesscoach.service;

import com.fitnesscoach.model.*;
import com.fitnesscoach.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class WorkoutSessionService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutSessionTemplateRepository sessionTemplateRepository;
    private final SetResultRepository setResultRepository;
    private final BlockItemRepository blockItemRepository;

    @Autowired
    public WorkoutSessionService(WorkoutSessionRepository workoutSessionRepository,
                               WorkoutSessionTemplateRepository sessionTemplateRepository,
                               SetResultRepository setResultRepository,
                               BlockItemRepository blockItemRepository) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.sessionTemplateRepository = sessionTemplateRepository;
        this.setResultRepository = setResultRepository;
        this.blockItemRepository = blockItemRepository;
    }

    public WorkoutSession createWorkoutSession(LocalDate date, UUID templateId) {
        WorkoutSessionTemplate template = sessionTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + templateId));

        WorkoutSession session = new WorkoutSession(date, template);
        return workoutSessionRepository.save(session);
    }

    public WorkoutSession createAdHocWorkoutSession(LocalDate date) {
        WorkoutSession session = new WorkoutSession();
        session.setDate(date);
        return workoutSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public Optional<WorkoutSession> findById(UUID id) {
        return workoutSessionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSession> findAll() {
        return workoutSessionRepository.findAllOrderByDateDesc();
    }

    @Transactional(readOnly = true)
    public List<WorkoutSession> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return workoutSessionRepository.findByDateBetween(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSession> findByTemplate(UUID templateId) {
        return workoutSessionRepository.findByTemplateIdOrderByDateDesc(templateId);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSession> findByProgram(UUID programId) {
        return workoutSessionRepository.findByProgramId(programId);
    }

    public WorkoutSession updateWorkoutSession(UUID id, WorkoutSession sessionDetails) {
        WorkoutSession session = workoutSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout session not found with id: " + id));

        session.setDate(sessionDetails.getDate());
        session.setWeek(sessionDetails.getWeek());
        session.setNotes(sessionDetails.getNotes());

        return workoutSessionRepository.save(session);
    }

    public void deleteWorkoutSession(UUID id) {
        if (!workoutSessionRepository.existsById(id)) {
            throw new RuntimeException("Workout session not found with id: " + id);
        }
        workoutSessionRepository.deleteById(id);
    }

    public SetResult addSetResult(UUID sessionId, SetResult setResult) {
        WorkoutSession session = findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Workout session not found with id: " + sessionId));

        setResult.setSession(session);
        SetResult savedSet = setResultRepository.save(setResult);
        session.getSets().add(savedSet);

        return savedSet;
    }

    @Transactional(readOnly = true)
    public List<SetResult> getSetResults(UUID sessionId) {
        return setResultRepository.findBySessionIdOrderByBlockLabelAscBlockItemOrderAscSetNumberAsc(sessionId);
    }

    public WorkoutSession instantiateFromTemplate(UUID templateId, LocalDate date, int week) {
        WorkoutSessionTemplate template = sessionTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + templateId));

        WorkoutSession session = new WorkoutSession(date, template);
        session.setWeek(week);
        session = workoutSessionRepository.save(session);

        // Pre-populate set results based on template prescriptions for the given week
        List<BlockItem> applicableItems = blockItemRepository.findByWeek(week);
        for (BlockItem item : applicableItems) {
            if (item.getBlock().getSession().getId().equals(templateId)) {
                createSetResultsFromPrescription(session, item, week);
            }
        }

        return session;
    }

    private void createSetResultsFromPrescription(WorkoutSession session, BlockItem item, int week) {
        Prescription prescription = item.getPrescription();
        if (prescription.getWeekStart() <= week && prescription.getWeekEnd() >= week) {
            for (int setNumber = 1; setNumber <= prescription.getSets(); setNumber++) {
                SetResult setResult = new SetResult(
                        session,
                        item.getExercise(),
                        item.getBlock().getLabel(),
                        item.getOrderIndex(),
                        setNumber
                );
                setResult.setPlannedItem(item);
                setResult.setTargetReps(prescription.getTargetReps());
                setResult.setTargetTempo(prescription.getTempo());
                setResult.setTargetRestSec(prescription.getRestSeconds());

                setResultRepository.save(setResult);
            }
        }
    }
}