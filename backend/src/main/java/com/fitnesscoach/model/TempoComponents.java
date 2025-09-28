package com.fitnesscoach.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class TempoComponents {
    private Integer eccentric;
    private Integer bottomPause;
    private Integer concentric;
    private Integer topPause;
    private String raw;

    public TempoComponents() {}

    public TempoComponents(String raw) {
        this.raw = raw;
    }

    public Integer getEccentric() {
        return eccentric;
    }

    public void setEccentric(Integer eccentric) {
        this.eccentric = eccentric;
    }

    public Integer getBottomPause() {
        return bottomPause;
    }

    public void setBottomPause(Integer bottomPause) {
        this.bottomPause = bottomPause;
    }

    public Integer getConcentric() {
        return concentric;
    }

    public void setConcentric(Integer concentric) {
        this.concentric = concentric;
    }

    public Integer getTopPause() {
        return topPause;
    }

    public void setTopPause(Integer topPause) {
        this.topPause = topPause;
    }

    public String getRaw() {
        return raw;
    }

    public void setRaw(String raw) {
        this.raw = raw;
    }
}