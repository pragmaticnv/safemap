"use client";

import { useState, useEffect } from "react";
import { X, Shield, AlertTriangle, Wind, Users, Flag, CloudRain, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { CountryData, getSafetyColor, getSafetyLabel, getAlternatives } from "@/app/data/safetyData";
import { getSeverityColor, AlertSeverity } from "@/app/data/alertsData";

interface SidePanelProps {
    country: CountryData | null;
    onClose: () => void;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
    return (
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${value}%`, background: color }}
            />
        </div>
    );
}

function ScoreBadge({ score }: { score: number }) {
    const color = getSafetyColor(score);
    const label = getSafetyLabel(score);
    return (
        <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}
        >
            {label}
        </span>
    );
}

function SeverityDot({ severity }: { severity: string }) {
    const color = getSeverityColor(severity as any);
    return (
        <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}
        >
            {severity}
        </span>
    );
}

export default function SidePanel({ country, onClose }: SidePanelProps) {
    const [liveData, setLiveData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!country) {
            setLiveData(null);
            return;
        }

        async function fetchLiveIntelligence() {
            setLoading(true);
            try {
                const res = await fetch(`/api/safety-score?country=${country?.iso}&city=${encodeURIComponent(country?.capital || '')}`);
                if (res.ok) {
                    const data = await res.json();
                    setLiveData(data);
                }
            } catch (err) {
                console.error("Failed to fetch live safety data", err);
            } finally {
                setLoading(false);
            }
        }

        fetchLiveIntelligence();
    }, [country]);

    if (!country) return null;

    // Use live data if available, otherwise fallback to static data
    const currentScore = liveData?.overall ?? country.safetyScore;
    const safetyColor = getSafetyColor(currentScore);
    const safetyLabel = getSafetyLabel(currentScore);
    const alternatives = getAlternatives(country.iso);

    // Live News Alerts from backend
    const newsAlerts = liveData?.newsAlerts || [];

    const indicators = [
        { label: "Disaster Risk", value: liveData?.disaster ?? country.disasterRisk, icon: <AlertTriangle className="w-3.5 h-3.5" />, desc: "Natural disaster exposure" },
        { label: "Air Quality", value: liveData?.airQuality ?? country.airQuality, icon: <Wind className="w-3.5 h-3.5" />, desc: "Ambient air quality index" },
        { label: "Crime Safety", value: liveData?.crime ?? country.crimeLevel, icon: <Users className="w-3.5 h-3.5" />, desc: "Public safety from crime" },
        { label: "Political Stability", value: liveData?.political ?? country.politicalUnrest, icon: <Flag className="w-3.5 h-3.5" />, desc: "Government and civil stability" },
        { label: "Weather Risk", value: liveData?.weather ?? country.weatherRisk, icon: <CloudRain className="w-3.5 h-3.5" />, desc: "Real-time weather risk score" },
    ];

    return (
        <div
            className="fixed top-0 right-0 h-full z-40 side-panel-enter flex flex-col"
            style={{
                width: "420px",
                background: "linear-gradient(160deg, rgba(14,18,30,0.98) 0%, rgba(10,10,18,0.99) 100%)",
                backdropFilter: "blur(28px)",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "-24px 0 80px rgba(0,0,0,0.6)",
            }}
        >
            {/* ── HEADER ── */}
            <div className="flex-shrink-0 px-6 pt-20 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{country.flag}</span>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">{country.name}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-500">{country.capital} · {country.region}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border border-white/5 hover:border-white/15"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap mb-4">
                    {[
                        { label: "Pop", value: country.population },
                        { label: "TZ", value: country.timezone.split(" ")[0] },
                        { label: "Live", value: loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enabled" },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            <span className="text-slate-500">{label}:</span>
                            <span className="text-slate-300 font-medium">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Overall score */}
                <div
                    className="rounded-2xl p-4 border relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${safetyColor}0d 0%, ${safetyColor}05 100%)`,
                        borderColor: `${safetyColor}30`,
                    }}
                >
                    {loading && (
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: `${safetyColor}1a`, border: `1px solid ${safetyColor}40` }}
                            >
                                <Shield className="w-4.5 h-4.5" style={{ color: safetyColor }} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Overall Safety</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-bold" style={{ color: safetyColor }}>
                                        {currentScore}
                                    </span>
                                    <span className="text-slate-500 text-sm">/ 100</span>
                                </div>
                            </div>
                        </div>
                        <span
                            className="text-sm font-semibold px-3 py-1.5 rounded-full border"
                            style={{ color: safetyColor, borderColor: `${safetyColor}44`, background: `${safetyColor}11` }}
                        >
                            {safetyLabel}
                        </span>
                    </div>
                    <ProgressBar value={currentScore} color={safetyColor} />
                </div>
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* AI Insights from Backend */}
                {liveData?.aiInsight && (
                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">AI Safety Intelligence</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                            "{liveData.aiInsight}"
                        </p>
                    </div>
                )}

                {/* SECTION: Safety Breakdown */}
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Real-Time Indicators</p>
                    <div className="space-y-3">
                        {indicators.map((ind) => {
                            const c = getSafetyColor(ind.value);
                            return (
                                <div
                                    key={ind.label}
                                    className="rounded-xl p-3.5 border transition-colors"
                                    style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.025)" }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span style={{ color: c }}>{ind.icon}</span>
                                            <span className="text-sm font-medium text-slate-300">{ind.label}</span>
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: c }}>{ind.value}/100</span>
                                    </div>
                                    <ProgressBar value={ind.value} color={c} />
                                    <p className="text-xs text-slate-600 mt-1.5">{ind.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SECTION: Backend News Alerts */}
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Intelligence Feed</p>
                    {newsAlerts.length === 0 ? (
                        <div
                            className="rounded-xl p-3.5 text-center border"
                            style={{ borderColor: "rgba(0,255,136,0.1)", background: "rgba(0,255,136,0.03)" }}
                        >
                            <p className="text-sm text-slate-400">✅ No critical alerts found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {newsAlerts.map((article: any, i: number) => (
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={i}
                                    className="block transition-all hover:translate-x-1"
                                >
                                    <div
                                        className="rounded-xl p-3.5 border border-white/5 bg-white/2 hover:bg-white/5"
                                    >
                                        <div className="flex justify-between items-start gap-3 mb-2">
                                            <p className="text-[13px] font-semibold text-white leading-tight line-clamp-2">
                                                {article.title}
                                            </p>
                                            <span className="text-[10px] text-slate-600 whitespace-nowrap">{article.source?.name}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-light">
                                            {article.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-700">{new Date(article.publishedAt).toLocaleDateString()}</span>
                                            <ChevronRight className="w-3 h-3 text-slate-700" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* SECTION: AI Suggestions */}
                {alternatives.length > 0 && (
                    <div className="pb-4">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">AI Suggestions</p>
                        <p className="text-xs text-slate-600 mb-3">
                            Consider these safer alternatives based on current intelligence:
                        </p>
                        <div className="space-y-2">
                            {alternatives.map((alt) => {
                                const c = getSafetyColor(alt.safetyScore);
                                const diff = alt.safetyScore - currentScore;
                                return (
                                    <div
                                        key={alt.iso}
                                        className="flex items-center justify-between rounded-xl px-3.5 py-3 border transition-all duration-200 cursor-pointer group"
                                        style={{
                                            borderColor: "rgba(0,136,255,0.15)",
                                            background: "rgba(0,136,255,0.04)",
                                        }}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">{alt.flag}</span>
                                            <div>
                                                <p className="text-sm font-medium text-white">{alt.name}</p>
                                                <p className="text-xs" style={{ color: "#00ff88" }}>+{diff} units safer</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold" style={{ color: c }}>{alt.safetyScore}</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
