package com.fitnesscoach.controller;

import com.fitnesscoach.model.legacy.User;
import com.fitnesscoach.model.legacy.UserProgressSnapshot;
import com.fitnesscoach.service.legacy.UserProgressService;
import com.fitnesscoach.service.legacy.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
public class UserProgressController {

    @Autowired
    private UserProgressService progressService;

    @Autowired
    private UserService userService;

    @PostMapping("/snapshots")
    public ResponseEntity<UserProgressSnapshot> createProgressSnapshot(
            @Valid @RequestBody UserProgressSnapshot snapshot,
            Principal principal) {
        User user = userService.findByUsername(principal.getName());
        UserProgressSnapshot createdSnapshot = progressService.createProgressSnapshot(user, snapshot);
        return new ResponseEntity<>(createdSnapshot, HttpStatus.CREATED);
    }

    @PutMapping("/snapshots/{snapshotId}")
    public ResponseEntity<UserProgressSnapshot> updateProgressSnapshot(
            @PathVariable Long snapshotId,
            @Valid @RequestBody UserProgressSnapshot snapshot,
            Principal principal) {
        UserProgressSnapshot updatedSnapshot = progressService.updateProgressSnapshot(snapshotId, snapshot);
        return ResponseEntity.ok(updatedSnapshot);
    }

    @GetMapping("/snapshots/{snapshotId}")
    public ResponseEntity<UserProgressSnapshot> getProgressSnapshot(@PathVariable Long snapshotId, Principal principal) {
        UserProgressSnapshot snapshot = progressService.getProgressSnapshot(snapshotId);
        return ResponseEntity.ok(snapshot);
    }

    @GetMapping("/my-snapshots")
    public ResponseEntity<List<UserProgressSnapshot>> getMyProgressSnapshots(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<UserProgressSnapshot> snapshots = progressService.getProgressSnapshotsByUser(user);
        return ResponseEntity.ok(snapshots);
    }

    @GetMapping("/my-snapshots/date-range")
    public ResponseEntity<List<UserProgressSnapshot>> getMyProgressSnapshotsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<UserProgressSnapshot> snapshots = progressService.getProgressSnapshotsByUserAndDateRange(user, startDate, endDate);
        return ResponseEntity.ok(snapshots);
    }

    @GetMapping("/my-snapshots/recent")
    public ResponseEntity<List<UserProgressSnapshot>> getMyRecentProgressSnapshots(
            @RequestParam(defaultValue = "10") int limit,
            Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<UserProgressSnapshot> snapshots = progressService.getRecentProgressSnapshots(user, limit);
        return ResponseEntity.ok(snapshots);
    }

    @GetMapping("/my-snapshots/latest")
    public ResponseEntity<UserProgressSnapshot> getMyLatestProgressSnapshot(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        Optional<UserProgressSnapshot> snapshot = progressService.getLatestProgressSnapshot(user);

        if (snapshot.isPresent()) {
            return ResponseEntity.ok(snapshot.get());
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/my-analytics")
    public ResponseEntity<Map<String, Object>> getMyProgressAnalytics(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        Map<String, Object> analytics = progressService.getProgressAnalytics(user);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/my-trends")
    public ResponseEntity<Map<String, Object>> getMyProgressTrends(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Principal principal) {
        User user = userService.findByUsername(principal.getName());
        Map<String, Object> trends = progressService.getProgressTrends(user, startDate, endDate);
        return ResponseEntity.ok(trends);
    }

    @GetMapping("/my-snapshots/weight")
    public ResponseEntity<List<UserProgressSnapshot>> getMySnapshotsWithWeight(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<UserProgressSnapshot> snapshots = progressService.getSnapshotsWithWeight(user);
        return ResponseEntity.ok(snapshots);
    }

    @GetMapping("/my-snapshots/body-fat")
    public ResponseEntity<List<UserProgressSnapshot>> getMySnapshotsWithBodyFat(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<UserProgressSnapshot> snapshots = progressService.getSnapshotsWithBodyFat(user);
        return ResponseEntity.ok(snapshots);
    }

    @DeleteMapping("/snapshots/{snapshotId}")
    public ResponseEntity<Void> deleteProgressSnapshot(@PathVariable Long snapshotId, Principal principal) {
        progressService.deleteProgressSnapshot(snapshotId);
        return ResponseEntity.noContent().build();
    }
}