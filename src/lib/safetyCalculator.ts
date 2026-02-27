import { WeatherData } from "@/types";

export function calculateWeatherRisk(temp: number, windSpeed: number, condition: string): number {
    let risk = 20; // Base normal risk as per PRD
    const conditionLower = condition.toLowerCase();

    // Condition checks
    if (conditionLower.includes('storm') || conditionLower.includes('tornado') || conditionLower.includes('hurricane') || conditionLower.includes('cyclone')) {
        return 95; // Critical
    }

    if (conditionLower.includes('snow') || conditionLower.includes('rain') || conditionLower.includes('thunder')) {
        risk += 15;
    }

    // Extreme temp checks (>40 or <0) as per PRD
    if (temp < 0 || temp > 40) {
        risk += 40;
    } else if (temp < 5 || temp > 35) {
        risk += 15;
    }

    // Wind speed check (>50kmh = 13.8 m/s)
    const windKmh = windSpeed * 3.6;
    if (windKmh > 50) {
        risk += 30;
    } else if (windKmh > 30) {
        risk += 10;
    }

    return Math.min(risk, 100);
}

export const KEYWORDS_BULL = ["peace", "stable", "safe", "tourism", "development", "growth", "agreement", "ceasefire", "recovery"];
export const KEYWORDS_BEAR = ["war", "conflict", "attack", "bomb", "protest", "riot", "flood", "earthquake", "tsunami", "hurricane", "epidemic", "explosion", "shooting", "terror"];

export function calculatePoliticalSentiment(articles: any[]): { score: number; hasCritical: boolean } {
    let score = 70; // Base political score as per PRD
    let hasCritical = false;

    articles.forEach((article: any) => {
        const text = `${article.title} ${article.description}`.toLowerCase();

        KEYWORDS_BULL.forEach(kw => {
            if (text.includes(kw)) score += 2;
        });

        KEYWORDS_BEAR.forEach(kw => {
            if (text.includes(kw)) {
                score -= 3;
                if (["war", "tsunami", "earthquake", "terror"].includes(kw)) {
                    hasCritical = true;
                }
            }
        });
    });

    return {
        score: Math.max(0, Math.min(100, score)),
        hasCritical
    };
}

export function calculateOverallSafetyScore(
    disasterRisk: number,
    crimeLevel: number,
    airQuality: number,
    politicalRisk: number,
    weatherRisk: number,
    hasCriticalNews: boolean
): number {
    // Formula from PRD:
    // Disaster Risk (25%) + Crime (25%) + Air (20%) + Political (20%) + Weather (10%)

    // Note: Scores should be "Safety Scores" not "Risk Scores" for the contribution
    // For values that represent risks (like disasterRisk), we use (100 - risk)

    const disasterContribution = (100 - disasterRisk) * 0.25;
    const crimeContribution = crimeLevel * 0.25; // Static data seems to use safety proportion
    const airContribution = airQuality * 0.20;
    const politicalContribution = politicalRisk * 0.20;
    const weatherContribution = (100 - weatherRisk) * 0.10;

    let total = disasterContribution + crimeContribution + airContribution + politicalContribution + weatherContribution;

    // Adjust if critical news
    if (hasCriticalNews) {
        total = Math.min(total, 40); // Hard cap for dangerous areas
    }

    return Math.round(Math.max(0, Math.min(100, total)));
}
