package com.fitnesscoach.service;

import com.fitnesscoach.model.*;
import com.fitnesscoach.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced analytics service for tracking performance across all workout types
 * Provides comprehensive metrics, trends, and insights
 */
@Service
public class AdvancedAnalyticsService {

    @Autowired
    private AdvancedWorkoutResultRepository workoutResultRepository;

    @Autowired
    private AdvancedSetResultRepository setResultRepository;

    @Autowired
    private BlockResultRepository blockResultRepository;

    /**
     * Comprehensive workout analytics for all workout types
     */
    public static class WorkoutAnalytics {
        // Overall metrics
        private int totalWorkouts;
        private double averageSessionDuration;
        private double totalVolumeLoad;
        private double averageRPE;
        private int personalRecords;

        // Time-based workout metrics
        private Map<String, EMOMAnalytics> emomMetrics;
        private Map<String, TabataAnalytics> tabataMetrics;
        private Map<String, AMRAPAnalytics> amrapMetrics;
        private Map<String, CircuitAnalytics> circuitMetrics;

        // Strength metrics
        private Map<String, StrengthAnalytics> strengthMetrics;
        private Map<String, Double> oneRepMaxEstimates;

        // Performance trends
        private Map<String, List<Double>> performanceTrends;
        private Map<String, Double> weeklyProgress;

        // Consistency metrics
        private double workoutConsistency; // How regularly workouts are completed
        private double performanceConsistency; // How consistent performance is
        private Map<String, Double> blockTypeSuccess; // Success rate by block type

        // Getters and setters
        public int getTotalWorkouts() { return totalWorkouts; }
        public void setTotalWorkouts(int totalWorkouts) { this.totalWorkouts = totalWorkouts; }

        public double getAverageSessionDuration() { return averageSessionDuration; }
        public void setAverageSessionDuration(double averageSessionDuration) { this.averageSessionDuration = averageSessionDuration; }

        public double getTotalVolumeLoad() { return totalVolumeLoad; }
        public void setTotalVolumeLoad(double totalVolumeLoad) { this.totalVolumeLoad = totalVolumeLoad; }

        public double getAverageRPE() { return averageRPE; }
        public void setAverageRPE(double averageRPE) { this.averageRPE = averageRPE; }

        public int getPersonalRecords() { return personalRecords; }
        public void setPersonalRecords(int personalRecords) { this.personalRecords = personalRecords; }

        public Map<String, EMOMAnalytics> getEmomMetrics() { return emomMetrics; }
        public void setEmomMetrics(Map<String, EMOMAnalytics> emomMetrics) { this.emomMetrics = emomMetrics; }

        public Map<String, TabataAnalytics> getTabataMetrics() { return tabataMetrics; }
        public void setTabataMetrics(Map<String, TabataAnalytics> tabataMetrics) { this.tabataMetrics = tabataMetrics; }

        public Map<String, AMRAPAnalytics> getAmrapMetrics() { return amrapMetrics; }
        public void setAmrapMetrics(Map<String, AMRAPAnalytics> amrapMetrics) { this.amrapMetrics = amrapMetrics; }

        public Map<String, CircuitAnalytics> getCircuitMetrics() { return circuitMetrics; }
        public void setCircuitMetrics(Map<String, CircuitAnalytics> circuitMetrics) { this.circuitMetrics = circuitMetrics; }

        public Map<String, StrengthAnalytics> getStrengthMetrics() { return strengthMetrics; }
        public void setStrengthMetrics(Map<String, StrengthAnalytics> strengthMetrics) { this.strengthMetrics = strengthMetrics; }

        public Map<String, Double> getOneRepMaxEstimates() { return oneRepMaxEstimates; }
        public void setOneRepMaxEstimates(Map<String, Double> oneRepMaxEstimates) { this.oneRepMaxEstimates = oneRepMaxEstimates; }

        public Map<String, List<Double>> getPerformanceTrends() { return performanceTrends; }
        public void setPerformanceTrends(Map<String, List<Double>> performanceTrends) { this.performanceTrends = performanceTrends; }

        public Map<String, Double> getWeeklyProgress() { return weeklyProgress; }
        public void setWeeklyProgress(Map<String, Double> weeklyProgress) { this.weeklyProgress = weeklyProgress; }

        public double getWorkoutConsistency() { return workoutConsistency; }
        public void setWorkoutConsistency(double workoutConsistency) { this.workoutConsistency = workoutConsistency; }

        public double getPerformanceConsistency() { return performanceConsistency; }
        public void setPerformanceConsistency(double performanceConsistency) { this.performanceConsistency = performanceConsistency; }

        public Map<String, Double> getBlockTypeSuccess() { return blockTypeSuccess; }
        public void setBlockTypeSuccess(Map<String, Double> blockTypeSuccess) { this.blockTypeSuccess = blockTypeSuccess; }
    }

    // Specific analytics classes
    public static class EMOMAnalytics {
        private double averageCompletionRate;
        private int totalMinutesCompleted;
        private int totalMinutesAttempted;
        private Map<String, Double> exerciseCompletionRates;
        private List<Integer> roundsCompletedHistory;
        private double bestPerformance;
        private LocalDate bestPerformanceDate;

        // Getters and setters
        public double getAverageCompletionRate() { return averageCompletionRate; }
        public void setAverageCompletionRate(double averageCompletionRate) { this.averageCompletionRate = averageCompletionRate; }

        public int getTotalMinutesCompleted() { return totalMinutesCompleted; }
        public void setTotalMinutesCompleted(int totalMinutesCompleted) { this.totalMinutesCompleted = totalMinutesCompleted; }

        public int getTotalMinutesAttempted() { return totalMinutesAttempted; }
        public void setTotalMinutesAttempted(int totalMinutesAttempted) { this.totalMinutesAttempted = totalMinutesAttempted; }

        public Map<String, Double> getExerciseCompletionRates() { return exerciseCompletionRates; }
        public void setExerciseCompletionRates(Map<String, Double> exerciseCompletionRates) { this.exerciseCompletionRates = exerciseCompletionRates; }

        public List<Integer> getRoundsCompletedHistory() { return roundsCompletedHistory; }
        public void setRoundsCompletedHistory(List<Integer> roundsCompletedHistory) { this.roundsCompletedHistory = roundsCompletedHistory; }

        public double getBestPerformance() { return bestPerformance; }
        public void setBestPerformance(double bestPerformance) { this.bestPerformance = bestPerformance; }

        public LocalDate getBestPerformanceDate() { return bestPerformanceDate; }
        public void setBestPerformanceDate(LocalDate bestPerformanceDate) { this.bestPerformanceDate = bestPerformanceDate; }
    }

    public static class TabataAnalytics {
        private double averageRepsPerRound;
        private int totalRoundsCompleted;
        private Map<String, Double> exerciseAverageReps;
        private List<Double> repsHistory;
        private double bestAverageReps;
        private LocalDate bestPerformanceDate;

        // Getters and setters
        public double getAverageRepsPerRound() { return averageRepsPerRound; }
        public void setAverageRepsPerRound(double averageRepsPerRound) { this.averageRepsPerRound = averageRepsPerRound; }

        public int getTotalRoundsCompleted() { return totalRoundsCompleted; }
        public void setTotalRoundsCompleted(int totalRoundsCompleted) { this.totalRoundsCompleted = totalRoundsCompleted; }

        public Map<String, Double> getExerciseAverageReps() { return exerciseAverageReps; }
        public void setExerciseAverageReps(Map<String, Double> exerciseAverageReps) { this.exerciseAverageReps = exerciseAverageReps; }

        public List<Double> getRepsHistory() { return repsHistory; }
        public void setRepsHistory(List<Double> repsHistory) { this.repsHistory = repsHistory; }

        public double getBestAverageReps() { return bestAverageReps; }
        public void setBestAverageReps(double bestAverageReps) { this.bestAverageReps = bestAverageReps; }

        public LocalDate getBestPerformanceDate() { return bestPerformanceDate; }
        public void setBestPerformanceDate(LocalDate bestPerformanceDate) { this.bestPerformanceDate = bestPerformanceDate; }
    }

    public static class AMRAPAnalytics {
        private double averageRounds;
        private Map<String, List<String>> wodResults; // WOD name -> list of results
        private Map<String, String> personalRecords;
        private List<Double> roundsHistory;
        private double bestScore;
        private String bestScoreWod;
        private LocalDate bestScoreDate;

        // Getters and setters
        public double getAverageRounds() { return averageRounds; }
        public void setAverageRounds(double averageRounds) { this.averageRounds = averageRounds; }

        public Map<String, List<String>> getWodResults() { return wodResults; }
        public void setWodResults(Map<String, List<String>> wodResults) { this.wodResults = wodResults; }

        public Map<String, String> getPersonalRecords() { return personalRecords; }
        public void setPersonalRecords(Map<String, String> personalRecords) { this.personalRecords = personalRecords; }

        public List<Double> getRoundsHistory() { return roundsHistory; }
        public void setRoundsHistory(List<Double> roundsHistory) { this.roundsHistory = roundsHistory; }

        public double getBestScore() { return bestScore; }
        public void setBestScore(double bestScore) { this.bestScore = bestScore; }

        public String getBestScoreWod() { return bestScoreWod; }
        public void setBestScoreWod(String bestScoreWod) { this.bestScoreWod = bestScoreWod; }

        public LocalDate getBestScoreDate() { return bestScoreDate; }
        public void setBestScoreDate(LocalDate bestScoreDate) { this.bestScoreDate = bestScoreDate; }
    }

    public static class CircuitAnalytics {
        private double averageRoundTime;
        private int totalRoundsCompleted;
        private Map<String, Double> exerciseAverageTimes;
        private List<Double> roundTimeHistory;
        private double fastestRoundTime;
        private LocalDate fastestRoundDate;

        // Getters and setters
        public double getAverageRoundTime() { return averageRoundTime; }
        public void setAverageRoundTime(double averageRoundTime) { this.averageRoundTime = averageRoundTime; }

        public int getTotalRoundsCompleted() { return totalRoundsCompleted; }
        public void setTotalRoundsCompleted(int totalRoundsCompleted) { this.totalRoundsCompleted = totalRoundsCompleted; }

        public Map<String, Double> getExerciseAverageTimes() { return exerciseAverageTimes; }
        public void setExerciseAverageTimes(Map<String, Double> exerciseAverageTimes) { this.exerciseAverageTimes = exerciseAverageTimes; }

        public List<Double> getRoundTimeHistory() { return roundTimeHistory; }
        public void setRoundTimeHistory(List<Double> roundTimeHistory) { this.roundTimeHistory = roundTimeHistory; }

        public double getFastestRoundTime() { return fastestRoundTime; }
        public void setFastestRoundTime(double fastestRoundTime) { this.fastestRoundTime = fastestRoundTime; }

        public LocalDate getFastestRoundDate() { return fastestRoundDate; }
        public void setFastestRoundDate(LocalDate fastestRoundDate) { this.fastestRoundDate = fastestRoundDate; }
    }

    public static class StrengthAnalytics {
        private double maxWeight;
        private double estimatedOneRepMax;
        private double totalVolumeLoad;
        private List<Double> weightHistory;
        private Map<String, Double> repMaxes; // "1RM", "3RM", "5RM", etc.
        private double strengthGain; // Percentage gain over time period
        private LocalDate maxWeightDate;

        // Getters and setters
        public double getMaxWeight() { return maxWeight; }
        public void setMaxWeight(double maxWeight) { this.maxWeight = maxWeight; }

        public double getEstimatedOneRepMax() { return estimatedOneRepMax; }
        public void setEstimatedOneRepMax(double estimatedOneRepMax) { this.estimatedOneRepMax = estimatedOneRepMax; }

        public double getTotalVolumeLoad() { return totalVolumeLoad; }
        public void setTotalVolumeLoad(double totalVolumeLoad) { this.totalVolumeLoad = totalVolumeLoad; }

        public List<Double> getWeightHistory() { return weightHistory; }
        public void setWeightHistory(List<Double> weightHistory) { this.weightHistory = weightHistory; }

        public Map<String, Double> getRepMaxes() { return repMaxes; }
        public void setRepMaxes(Map<String, Double> repMaxes) { this.repMaxes = repMaxes; }

        public double getStrengthGain() { return strengthGain; }
        public void setStrengthGain(double strengthGain) { this.strengthGain = strengthGain; }

        public LocalDate getMaxWeightDate() { return maxWeightDate; }
        public void setMaxWeightDate(LocalDate maxWeightDate) { this.maxWeightDate = maxWeightDate; }
    }

    /**
     * Generate comprehensive analytics for a user within a date range
     */
    public WorkoutAnalytics generateAnalytics(UUID userId, LocalDate startDate, LocalDate endDate) {
        WorkoutAnalytics analytics = new WorkoutAnalytics();

        List<AdvancedWorkoutResult> workouts = workoutResultRepository
            .findByUserIdAndDateBetween(userId, startDate, endDate);

        if (workouts.isEmpty()) {
            return analytics;
        }

        // Calculate overall metrics
        calculateOverallMetrics(analytics, workouts);

        // Calculate workout-type specific metrics
        calculateEMOMMetrics(analytics, workouts);
        calculateTabataMetrics(analytics, workouts);
        calculateAMRAPMetrics(analytics, workouts);
        calculateCircuitMetrics(analytics, workouts);
        calculateStrengthMetrics(analytics, workouts);

        // Calculate trends and consistency
        calculateTrends(analytics, workouts);
        calculateConsistency(analytics, workouts, startDate, endDate);

        return analytics;
    }

    private void calculateOverallMetrics(WorkoutAnalytics analytics, List<AdvancedWorkoutResult> workouts) {
        analytics.setTotalWorkouts(workouts.size());

        double avgDuration = workouts.stream()
            .filter(w -> w.getTotalDurationSeconds() != null)
            .mapToInt(AdvancedWorkoutResult::getTotalDurationSeconds)
            .average()
            .orElse(0.0);
        analytics.setAverageSessionDuration(avgDuration);

        double totalVolume = workouts.stream()
            .filter(w -> w.getTotalVolumeLoad() != null)
            .mapToDouble(AdvancedWorkoutResult::getTotalVolumeLoad)
            .sum();
        analytics.setTotalVolumeLoad(totalVolume);

        double avgRPE = workouts.stream()
            .filter(w -> w.getAverageRPE() != null)
            .mapToDouble(AdvancedWorkoutResult::getAverageRPE)
            .average()
            .orElse(0.0);
        analytics.setAverageRPE(avgRPE);

        int prs = workouts.stream()
            .mapToInt(w -> w.getPersonalRecords() != null ? w.getPersonalRecords().size() : 0)
            .sum();
        analytics.setPersonalRecords(prs);
    }

    private void calculateEMOMMetrics(WorkoutAnalytics analytics, List<AdvancedWorkoutResult> workouts) {
        Map<String, EMOMAnalytics> emomMetrics = new HashMap<>();

        List<AdvancedWorkoutResult> emomWorkouts = workouts.stream()
            .filter(w -> w.getEmomMinutesTarget() != null)
            .collect(Collectors.toList());

        if (!emomWorkouts.isEmpty()) {
            EMOMAnalytics emomAnalytics = new EMOMAnalytics();

            double avgCompletionRate = emomWorkouts.stream()
                .mapToDouble(w -> {
                    if (w.getEmomMinutesTarget() != null && w.getEmomMinutesTarget() > 0) {
                        int completed = w.getEmomMinutesCompleted() != null ? w.getEmomMinutesCompleted() : 0;
                        return (double) completed / w.getEmomMinutesTarget() * 100;
                    }
                    return 0.0;
                })
                .average()
                .orElse(0.0);
            emomAnalytics.setAverageCompletionRate(avgCompletionRate);

            int totalCompleted = emomWorkouts.stream()
                .mapToInt(w -> w.getEmomMinutesCompleted() != null ? w.getEmomMinutesCompleted() : 0)
                .sum();
            emomAnalytics.setTotalMinutesCompleted(totalCompleted);

            int totalAttempted = emomWorkouts.stream()
                .mapToInt(w -> w.getEmomMinutesTarget() != null ? w.getEmomMinutesTarget() : 0)
                .sum();
            emomAnalytics.setTotalMinutesAttempted(totalAttempted);

            emomMetrics.put("overall", emomAnalytics);
        }

        analytics.setEmomMetrics(emomMetrics);
    }

    private void calculateTabataMetrics(WorkoutAnalytics analytics, List<AdvancedWorkoutResult> workouts) {
        Map<String, TabataAnalytics> tabataMetrics = new HashMap<>();

        List<AdvancedWorkoutResult> tabataWorkouts = workouts.stream()
            .filter(w -> w.getTabataRoundsTarget() != null)
            .collect(Collectors.toList());

        if (!tabataWorkouts.isEmpty()) {
            TabataAnalytics tabataAnalytics = new TabataAnalytics();

            double avgReps = tabataWorkouts.stream()
                .filter(w -> w.getTabataAverageReps() != null)
                .mapToDouble(AdvancedWorkoutResult::getTabataAverageReps)
                .average()
                .orElse(0.0);
            tabataAnalytics.setAverageRepsPerRound(avgReps);

            int totalRounds = tabataWorkouts.stream()
                .mapToInt(w -> w.getTabataRoundsCompleted() != null ? w.getTabataRoundsCompleted() : 0)
                .sum();
            tabataAnalytics.setTotalRoundsCompleted(totalRounds);

            List<Double> repsHistory = tabataWorkouts.stream()
                .filter(w -> w.getTabataAverageReps() != null)
                .map(AdvancedWorkoutResult::getTabataAverageReps)
                .collect(Collectors.toList());
            tabataAnalytics.setRepsHistory(repsHistory);

            double bestReps = repsHistory.stream()
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0.0);
            tabataAnalytics.setBestAverageReps(bestReps);

            tabataMetrics.put("overall", tabataAnalytics);
        }

        analytics.setTabataMetrics(tabataMetrics);
    }

    private void calculateAMRAPMetrics(WorkoutAnalytics analytics, List<AdvancedWorkoutResult> workouts) {
        Map<String, AMRAPAnalytics> amrapMetrics = new HashMap<>();

        List<AdvancedWorkoutResult> amrapWorkouts = workouts.stream()
            .filter(w -> w.getTotalRounds() != null && w.getWodResult() != null)
            .collect(Collectors.toList());

        if (!amrapWorkouts.isEmpty()) {
            AMRAPAnalytics amrapAnalytics = new AMRAPAnalytics();

            double avgRounds = amrapWorkouts.stream()
                .mapToInt(w -> w.getTotalRounds() != null ? w.getTotalRounds() : 0)
                .average()
                .orElse(0.0);
            amrapAnalytics.setAverageRounds(avgRounds);

            // Group by WOD name for tracking specific workout progress
            Map<String, List<String>> wodResults = amrapWorkouts.stream()
                .filter(w -> w.getTemplate() != null && w.getTemplate().getTitle() != null)
                .collect(Collectors.groupingBy(
                    w -> w.getTemplate().getTitle(),
                    Collectors.mapping(AdvancedWorkoutResult::getWodResult, Collectors.toList())
                ));
            amrapAnalytics.setWodResults(wodResults);

            amrapMetrics.put("overall", amrapAnalytics);
        }

        analytics.setAmrapMetrics(amrapMetrics);
    }

    private void calculateCircuitMetrics(WorkoutAnalytics analytics, List<AdvancedWorkoutResult> workouts) {
        Map<String, CircuitAnalytics> circuitMetrics = new HashMap<>();

        List<AdvancedWorkoutResult> circuitWorkouts = workouts.stream()
            .filter(w -> w.getAverageCircuitTime() != null)
            .collect(Collectors.toList());

        if (!circuitWorkouts.isEmpty()) {
            CircuitAnalytics circuitAnalytics = new CircuitAnalytics();

            double avgTime = circuitWorkouts.stream()
                .mapToDouble(AdvancedWorkoutResult::getAverageCircuitTime)
                .average()
                .orElse(0.0);
            circuitAnalytics.setAverageRoundTime(avgTime);

            int totalRounds = circuitWorkouts.stream()
                .mapToInt(w -> w.getCircuitRoundsCompleted() != null ? w.getCircuitRoundsCompleted() : 0)
                .sum();
            circuitAnalytics.setTotalRoundsCompleted(totalRounds);

            List<Double> timeHistory = circuitWorkouts.stream()
                .map(AdvancedWorkoutResult::getAverageCircuitTime)
                .collect(Collectors.toList());
            circuitAnalytics.setRoundTimeHistory(timeHistory);

            double fastestTime = circuitWorkouts.stream()
                .filter(w -> w.getFastestCircuitTimeSeconds() != null)
                .mapToInt(AdvancedWorkoutResult::getFastestCircuitTimeSeconds)
                .min()
                .orElse(0);
            circuitAnalytics.setFastestRoundTime(fastestTime);

            circuitMetrics.put("overall", circuitAnalytics);
        }

        analytics.setCircuitMetrics(circuitMetrics);
    }

    private void calculateStrengthMetrics(WorkoutAnalytics analytics, List<AdvancedWorkoutResult> workouts) {
        Map<String, StrengthAnalytics> strengthMetrics = new HashMap<>();
        Map<String, Double> oneRepMaxEstimates = new HashMap<>();

        // Get all set results for strength exercises
        List<AdvancedSetResult> strengthSets = workouts.stream()
            .flatMap(w -> w.getSetResults().stream())
            .filter(set -> set.getWeight() != null && set.getPerformedReps() != null &&
                          set.getResultType() == AdvancedSetResult.ResultType.STRAIGHT_SET)
            .collect(Collectors.toList());

        // Group by exercise name
        Map<String, List<AdvancedSetResult>> byExercise = strengthSets.stream()
            .collect(Collectors.groupingBy(set -> set.getExercise().getName()));

        byExercise.forEach((exerciseName, sets) -> {
            StrengthAnalytics strengthAnalytics = new StrengthAnalytics();

            double maxWeight = sets.stream()
                .mapToDouble(AdvancedSetResult::getWeight)
                .max()
                .orElse(0.0);
            strengthAnalytics.setMaxWeight(maxWeight);

            // Estimate 1RM using Epley formula: weight * (1 + reps/30)
            double estimated1RM = sets.stream()
                .mapToDouble(set -> set.getWeight() * (1 + set.getPerformedReps() / 30.0))
                .max()
                .orElse(0.0);
            strengthAnalytics.setEstimatedOneRepMax(estimated1RM);
            oneRepMaxEstimates.put(exerciseName, estimated1RM);

            double totalVolume = sets.stream()
                .mapToDouble(set -> set.getWeight() * set.getPerformedReps())
                .sum();
            strengthAnalytics.setTotalVolumeLoad(totalVolume);

            List<Double> weightHistory = sets.stream()
                .sorted(Comparator.comparing(AdvancedSetResult::getCompletedAt))
                .map(AdvancedSetResult::getWeight)
                .collect(Collectors.toList());
            strengthAnalytics.setWeightHistory(weightHistory);

            strengthMetrics.put(exerciseName, strengthAnalytics);
        });

        analytics.setStrengthMetrics(strengthMetrics);
        analytics.setOneRepMaxEstimates(oneRepMaxEstimates);
    }

    private void calculateTrends(WorkoutAnalytics analytics, List<AdvancedWorkoutResult> workouts) {
        Map<String, List<Double>> trends = new HashMap<>();

        // Sort workouts by date
        List<AdvancedWorkoutResult> sortedWorkouts = workouts.stream()
            .sorted(Comparator.comparing(AdvancedWorkoutResult::getDate))
            .collect(Collectors.toList());

        // Volume load trend
        List<Double> volumeTrend = sortedWorkouts.stream()
            .map(w -> w.getTotalVolumeLoad() != null ? w.getTotalVolumeLoad() : 0.0)
            .collect(Collectors.toList());
        trends.put("volumeLoad", volumeTrend);

        // RPE trend
        List<Double> rpeTrend = sortedWorkouts.stream()
            .map(w -> w.getAverageRPE() != null ? w.getAverageRPE() : 0.0)
            .collect(Collectors.toList());
        trends.put("averageRPE", rpeTrend);

        // Duration trend
        List<Double> durationTrend = sortedWorkouts.stream()
            .map(w -> w.getTotalDurationSeconds() != null ? w.getTotalDurationSeconds().doubleValue() : 0.0)
            .collect(Collectors.toList());
        trends.put("sessionDuration", durationTrend);

        analytics.setPerformanceTrends(trends);
    }

    private void calculateConsistency(WorkoutAnalytics analytics, List<AdvancedWorkoutResult> workouts,
                                    LocalDate startDate, LocalDate endDate) {
        // Workout frequency consistency
        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double workoutFrequency = (double) workouts.size() / totalDays * 7; // workouts per week
        analytics.setWorkoutConsistency(workoutFrequency);

        // Performance consistency (coefficient of variation of RPE)
        List<Double> rpeValues = workouts.stream()
            .filter(w -> w.getAverageRPE() != null)
            .map(AdvancedWorkoutResult::getAverageRPE)
            .collect(Collectors.toList());

        if (!rpeValues.isEmpty()) {
            double avgRPE = rpeValues.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double variance = rpeValues.stream()
                .mapToDouble(rpe -> Math.pow(rpe - avgRPE, 2))
                .average()
                .orElse(0.0);
            double stdDev = Math.sqrt(variance);
            double coefficientOfVariation = avgRPE > 0 ? (stdDev / avgRPE) * 100 : 0;
            analytics.setPerformanceConsistency(100 - coefficientOfVariation); // Higher is more consistent
        }

        // Block type success rates
        Map<String, Double> blockTypeSuccess = new HashMap<>();
        List<BlockResult> blockResults = workouts.stream()
            .flatMap(w -> w.getBlockResults().stream())
            .collect(Collectors.toList());

        Map<ExerciseBlock.BlockType, List<BlockResult>> byBlockType = blockResults.stream()
            .collect(Collectors.groupingBy(BlockResult::getBlockType));

        byBlockType.forEach((blockType, results) -> {
            double successRate = results.stream()
                .mapToDouble(block -> block.getCompletedAsPlanned() != null && block.getCompletedAsPlanned() ? 1.0 : 0.0)
                .average()
                .orElse(0.0) * 100;
            blockTypeSuccess.put(blockType.name(), successRate);
        });

        analytics.setBlockTypeSuccess(blockTypeSuccess);
    }

    /**
     * Generate a performance report for a specific workout type
     */
    public String generateWorkoutTypeReport(UUID userId, ExerciseBlock.BlockType blockType, LocalDate startDate, LocalDate endDate) {
        List<AdvancedWorkoutResult> workouts = workoutResultRepository
            .findByUserIdAndDateBetween(userId, startDate, endDate);

        List<BlockResult> blockResults = workouts.stream()
            .flatMap(w -> w.getBlockResults().stream())
            .filter(b -> b.getBlockType() == blockType)
            .collect(Collectors.toList());

        if (blockResults.isEmpty()) {
            return "No " + blockType.getDisplayName() + " workouts found in the specified date range.";
        }

        StringBuilder report = new StringBuilder();
        report.append("=== ").append(blockType.getDisplayName()).append(" Performance Report ===\n\n");

        // Calculate specific metrics based on block type
        switch (blockType) {
            case EMOM:
                generateEMOMReport(report, blockResults);
                break;
            case TABATA:
                generateTabataReport(report, blockResults);
                break;
            case CIRCUIT:
                generateCircuitReport(report, blockResults);
                break;
            case SUPERSET:
                generateSupersetReport(report, blockResults);
                break;
            default:
                generateGenericReport(report, blockResults);
        }

        return report.toString();
    }

    private void generateEMOMReport(StringBuilder report, List<BlockResult> results) {
        double avgCompletionRate = results.stream()
            .filter(r -> r.getEmomMinutesTarget() != null && r.getEmomMinutesTarget() > 0)
            .mapToDouble(r -> {
                int completed = r.getEmomMinutesCompleted() != null ? r.getEmomMinutesCompleted() : 0;
                return (double) completed / r.getEmomMinutesTarget() * 100;
            })
            .average()
            .orElse(0.0);

        int totalMinutes = results.stream()
            .mapToInt(r -> r.getEmomMinutesCompleted() != null ? r.getEmomMinutesCompleted() : 0)
            .sum();

        report.append("Total EMOM Sessions: ").append(results.size()).append("\n");
        report.append("Average Completion Rate: ").append(String.format("%.1f%%", avgCompletionRate)).append("\n");
        report.append("Total Minutes Completed: ").append(totalMinutes).append("\n");

        if (avgCompletionRate >= 90) {
            report.append("Performance: Excellent - Consider increasing intensity\n");
        } else if (avgCompletionRate >= 80) {
            report.append("Performance: Good - Solid consistency\n");
        } else if (avgCompletionRate >= 70) {
            report.append("Performance: Fair - Focus on pacing\n");
        } else {
            report.append("Performance: Needs improvement - Consider reducing load\n");
        }
    }

    private void generateTabataReport(StringBuilder report, List<BlockResult> results) {
        double avgReps = results.stream()
            .filter(r -> r.getTabataAverageReps() != null)
            .mapToDouble(BlockResult::getTabataAverageReps)
            .average()
            .orElse(0.0);

        int totalRounds = results.stream()
            .mapToInt(r -> r.getTabataRoundsCompleted() != null ? r.getTabataRoundsCompleted() : 0)
            .sum();

        report.append("Total Tabata Sessions: ").append(results.size()).append("\n");
        report.append("Average Reps per Round: ").append(String.format("%.1f", avgReps)).append("\n");
        report.append("Total Rounds Completed: ").append(totalRounds).append("\n");
        report.append("Intensity Level: ").append(avgReps >= 15 ? "High" : avgReps >= 10 ? "Moderate" : "Low").append("\n");
    }

    private void generateCircuitReport(StringBuilder report, List<BlockResult> results) {
        double avgTime = results.stream()
            .filter(r -> r.getAverageRoundTime() != null)
            .mapToDouble(BlockResult::getAverageRoundTime)
            .average()
            .orElse(0.0);

        int totalRounds = results.stream()
            .mapToInt(r -> r.getCompletedRounds() != null ? r.getCompletedRounds() : 0)
            .sum();

        report.append("Total Circuit Sessions: ").append(results.size()).append("\n");
        report.append("Average Round Time: ").append(String.format("%.1f seconds", avgTime)).append("\n");
        report.append("Total Rounds Completed: ").append(totalRounds).append("\n");
    }

    private void generateSupersetReport(StringBuilder report, List<BlockResult> results) {
        double avgRest = results.stream()
            .filter(r -> r.getAverageRestBetweenSupersets() != null)
            .mapToDouble(BlockResult::getAverageRestBetweenSupersets)
            .average()
            .orElse(0.0);

        int totalSupersets = results.stream()
            .mapToInt(r -> r.getSupersetRounds() != null ? r.getSupersetRounds() : 0)
            .sum();

        report.append("Total Superset Sessions: ").append(results.size()).append("\n");
        report.append("Average Rest Between Supersets: ").append(String.format("%.1f seconds", avgRest)).append("\n");
        report.append("Total Supersets Completed: ").append(totalSupersets).append("\n");
    }

    private void generateGenericReport(StringBuilder report, List<BlockResult> results) {
        double avgCompletion = results.stream()
            .filter(r -> r.getCompletionPercentage() != null)
            .mapToDouble(BlockResult::getCompletionPercentage)
            .average()
            .orElse(0.0);

        report.append("Total Sessions: ").append(results.size()).append("\n");
        report.append("Average Completion Rate: ").append(String.format("%.1f%%", avgCompletion)).append("\n");
    }
}