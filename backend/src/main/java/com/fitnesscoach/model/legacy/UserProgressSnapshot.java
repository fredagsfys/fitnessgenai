package com.fitnesscoach.model.legacy;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress_snapshots")
public class UserProgressSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotNull
    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "body_fat_percentage")
    private Double bodyFatPercentage;

    @Column(name = "muscle_mass_kg")
    private Double muscleMassKg;

    @Column(name = "chest_cm")
    private Double chestCm;

    @Column(name = "waist_cm")
    private Double waistCm;

    @Column(name = "hips_cm")
    private Double hipsCm;

    @Column(name = "bicep_left_cm")
    private Double bicepLeftCm;

    @Column(name = "bicep_right_cm")
    private Double bicepRightCm;

    @Column(name = "thigh_left_cm")
    private Double thighLeftCm;

    @Column(name = "thigh_right_cm")
    private Double thighRightCm;

    @Column(name = "calf_left_cm")
    private Double calfLeftCm;

    @Column(name = "calf_right_cm")
    private Double calfRightCm;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (snapshotDate == null) {
            snapshotDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getSnapshotDate() {
        return snapshotDate;
    }

    public void setSnapshotDate(LocalDate snapshotDate) {
        this.snapshotDate = snapshotDate;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getBodyFatPercentage() {
        return bodyFatPercentage;
    }

    public void setBodyFatPercentage(Double bodyFatPercentage) {
        this.bodyFatPercentage = bodyFatPercentage;
    }

    public Double getMuscleMassKg() {
        return muscleMassKg;
    }

    public void setMuscleMassKg(Double muscleMassKg) {
        this.muscleMassKg = muscleMassKg;
    }

    public Double getChestCm() {
        return chestCm;
    }

    public void setChestCm(Double chestCm) {
        this.chestCm = chestCm;
    }

    public Double getWaistCm() {
        return waistCm;
    }

    public void setWaistCm(Double waistCm) {
        this.waistCm = waistCm;
    }

    public Double getHipsCm() {
        return hipsCm;
    }

    public void setHipsCm(Double hipsCm) {
        this.hipsCm = hipsCm;
    }

    public Double getBicepLeftCm() {
        return bicepLeftCm;
    }

    public void setBicepLeftCm(Double bicepLeftCm) {
        this.bicepLeftCm = bicepLeftCm;
    }

    public Double getBicepRightCm() {
        return bicepRightCm;
    }

    public void setBicepRightCm(Double bicepRightCm) {
        this.bicepRightCm = bicepRightCm;
    }

    public Double getThighLeftCm() {
        return thighLeftCm;
    }

    public void setThighLeftCm(Double thighLeftCm) {
        this.thighLeftCm = thighLeftCm;
    }

    public Double getThighRightCm() {
        return thighRightCm;
    }

    public void setThighRightCm(Double thighRightCm) {
        this.thighRightCm = thighRightCm;
    }

    public Double getCalfLeftCm() {
        return calfLeftCm;
    }

    public void setCalfLeftCm(Double calfLeftCm) {
        this.calfLeftCm = calfLeftCm;
    }

    public Double getCalfRightCm() {
        return calfRightCm;
    }

    public void setCalfRightCm(Double calfRightCm) {
        this.calfRightCm = calfRightCm;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
