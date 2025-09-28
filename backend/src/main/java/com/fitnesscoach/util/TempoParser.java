package com.fitnesscoach.util;

import com.fitnesscoach.model.TempoComponents;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TempoParser {

    private static final Pattern TEMPO_PATTERN_4_DIGITS = Pattern.compile("^(\\d)(\\d)(\\d)(\\d)(.*)$");
    private static final Pattern TEMPO_PATTERN_WITH_X = Pattern.compile("^(\\d+)x(\\d+)(.*)$");
    private static final Pattern TEMPO_PATTERN_3_DIGITS = Pattern.compile("^(\\d)(\\d)(\\d)(.*)$");

    public TempoComponents parse(String tempoString) {
        if (tempoString == null || tempoString.trim().isEmpty()) {
            return new TempoComponents(tempoString);
        }

        String tempo = tempoString.trim();
        TempoComponents components = new TempoComponents(tempo);

        // Try 4-digit pattern first (e.g., "3010", "4120")
        Matcher matcher4 = TEMPO_PATTERN_4_DIGITS.matcher(tempo);
        if (matcher4.matches()) {
            components.setEccentric(Integer.parseInt(matcher4.group(1)));
            components.setBottomPause(Integer.parseInt(matcher4.group(2)));
            components.setConcentric(Integer.parseInt(matcher4.group(3)));
            components.setTopPause(Integer.parseInt(matcher4.group(4)));
            return components;
        }

        // Try "XxY" pattern (e.g., "30x0", "21x1")
        Matcher matcherX = TEMPO_PATTERN_WITH_X.matcher(tempo);
        if (matcherX.matches()) {
            components.setEccentric(Integer.parseInt(matcherX.group(1)));
            components.setBottomPause(0); // Default
            components.setConcentric(Integer.parseInt(matcherX.group(2)));
            components.setTopPause(0); // Default
            return components;
        }

        // Try 3-digit pattern (e.g., "301", "210")
        Matcher matcher3 = TEMPO_PATTERN_3_DIGITS.matcher(tempo);
        if (matcher3.matches()) {
            components.setEccentric(Integer.parseInt(matcher3.group(1)));
            components.setBottomPause(Integer.parseInt(matcher3.group(2)));
            components.setConcentric(Integer.parseInt(matcher3.group(3)));
            components.setTopPause(0); // Default
            return components;
        }

        return components;
    }

    public String formatTempo(TempoComponents components) {
        if (components == null) {
            return null;
        }

        if (components.getRaw() != null && !components.getRaw().trim().isEmpty()) {
            return components.getRaw();
        }

        StringBuilder sb = new StringBuilder();
        sb.append(components.getEccentric() != null ? components.getEccentric() : 0);
        sb.append(components.getBottomPause() != null ? components.getBottomPause() : 0);
        sb.append(components.getConcentric() != null ? components.getConcentric() : 0);
        sb.append(components.getTopPause() != null ? components.getTopPause() : 0);

        return sb.toString();
    }

    public boolean isValidTempo(String tempoString) {
        if (tempoString == null || tempoString.trim().isEmpty()) {
            return true; // Empty tempo is valid
        }

        try {
            TempoComponents parsed = parse(tempoString);
            return parsed.getEccentric() != null || parsed.getConcentric() != null;
        } catch (Exception e) {
            return false;
        }
    }

    public int calculateTotalTime(TempoComponents components) {
        if (components == null) {
            return 0;
        }

        int total = 0;
        if (components.getEccentric() != null) total += components.getEccentric();
        if (components.getBottomPause() != null) total += components.getBottomPause();
        if (components.getConcentric() != null) total += components.getConcentric();
        if (components.getTopPause() != null) total += components.getTopPause();

        return total;
    }

    public int calculateTotalTimePerRep(String tempoString) {
        TempoComponents components = parse(tempoString);
        return calculateTotalTime(components);
    }

    public String getTempoDescription(String tempoString) {
        TempoComponents components = parse(tempoString);
        if (components == null) {
            return "No tempo specified";
        }

        StringBuilder desc = new StringBuilder();
        desc.append("Eccentric: ").append(components.getEccentric() != null ? components.getEccentric() + "s" : "unspecified");
        desc.append(", Bottom pause: ").append(components.getBottomPause() != null ? components.getBottomPause() + "s" : "unspecified");
        desc.append(", Concentric: ").append(components.getConcentric() != null ? components.getConcentric() + "s" : "unspecified");
        desc.append(", Top pause: ").append(components.getTopPause() != null ? components.getTopPause() + "s" : "unspecified");

        return desc.toString();
    }
}