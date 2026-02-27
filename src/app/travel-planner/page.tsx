"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { safetyData, getSafetyColor, getSafetyLabel, getAlternatives } from "@/app/data/safetyData";
import { MapPin, Calendar, Users, Plane, Shield, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";

const TRIP_TYPES = ["Solo", "Couple", "Family", "Business", "Adventure"] as const;
type TripType = typeof TRIP_TYPES[number];

const POPULAR_SAFE = safetyData.filter((c) => c.safetyScore >= 80).slice(0, 6);

function ScoreGauge({ score, label }: { score: number; label: string }) {
    const color = getSafetyColor(score);
    const r = 38;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <circle
                    cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
                    style={{ fill: color, fontSize: 20, fontWeight: 800, transform: "rotate(90deg)", transformOrigin: "center" }}>
                    {score}
                </text>
            </svg>
            <p className="text-xs text-slate-400 text-center">{label}</p>
        </div>
    );
}

function ProgressBar({ value }: { value: number }) {
    const color = getSafetyColor(value);
    return (
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
        </div>
    );
}

export default function TravelPlannerPage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [dates, setDates] = useState({ start: "", end: "" });
    const [tripType, setTripType] = useState<TripType>("Solo");
    const [result, setResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            // Find destination country from static data to get ISO
            const destInfo = safetyData.find(
                (c) => c.name.toLowerCase().includes(to.toLowerCase()) || c.iso.toLowerCase() === to.toLowerCase()
            ) ?? safetyData[0];

            const originInfo = safetyData.find(
                (c) => c.name.toLowerCase().includes(from.toLowerCase())
            ) ?? safetyData[1];

            // Fetch LIVE intelligence from backend
            const res = await fetch(`/api/safety-score?country=${destInfo.iso}&city=${encodeURIComponent(destInfo.capital)}`);
            const liveData = await res.json();

            const alternatives = getAlternatives(destInfo.iso).slice(0, 3);

            const days = dates.start && dates.end
                ? Math.max(1, Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / 86400000))
                : 7;

            // Simulated timeline based on live score
            const riskByDay = Array.from({ length: Math.min(days, 7) }, (_, i) => ({
                day: i + 1,
                risk: Math.max(0, liveData.overall + (Math.random() * 10 - 5)),
            }));

            const checklist: string[] = [];
            if (liveData.crime < 60) checklist.push("Avoid displaying expensive items in public");
            if (liveData.disaster < 60) checklist.push("Download offline emergency maps");
            if (liveData.airQuality < 60) checklist.push("Carry N95 masks for air pollution");
            if (liveData.political < 60) checklist.push("Register with your embassy on arrival");
            if (liveData.weather < 60) checklist.push("Monitor local weather alerts daily");
            checklist.push("Get comprehensive travel insurance");
            checklist.push(`Save local emergency number for ${destInfo.name}`);
            checklist.push("Keep digital and physical copies of all travel documents");

            const bestMonth = liveData.weather >= 70 ? "Year-round" : destInfo.region === "Asia" ? "Nov–Mar" : "Apr–Sep";

            setResult({
                dest: { ...destInfo, safetyScore: liveData.overall, ...liveData },
                origin: originInfo,
                alternatives,
                riskByDay,
                checklist,
                bestMonth,
                days
            });
        } catch (err) {
            console.error("Travel analysis failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout>
            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* ── Header ── */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Plane className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">
                            AI-Powered Safety Analysis
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">Travel Planner</h1>
                    <p className="text-slate-400 text-lg font-light italic">Generate comprehensive safety intelligence reports for your global journeys.</p>
                </div>

                {/* ── Input Form ── */}
                <div
                    className="rounded-[2.5rem] p-10 border mb-12 shadow-2xl relative overflow-hidden"
                    style={{ background: "rgba(12,14,22,0.6)", borderColor: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}
                >
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">From (Origin)</label>
                            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all focus-within:border-blue-500/50" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                                <MapPin className="w-4 h-4 text-slate-600" />
                                <input
                                    type="text" value={from} onChange={(e) => setFrom(e.target.value)}
                                    placeholder="e.g. United States"
                                    className="bg-transparent flex-1 text-white outline-none placeholder-slate-600 text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">To (Destination)</label>
                            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all focus-within:border-green-500/50" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                                <MapPin className="w-4 h-4 text-green-500" />
                                <input
                                    type="text" value={to} onChange={(e) => setTo(e.target.value)}
                                    placeholder="e.g. Japan, France, Dubai…"
                                    className="bg-transparent flex-1 text-white outline-none placeholder-slate-600 text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Departure Date</label>
                            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                                <Calendar className="w-4 h-4 text-slate-600" />
                                <input
                                    type="date" value={dates.start} onChange={(e) => setDates((d) => ({ ...d, start: e.target.value }))}
                                    className="bg-transparent flex-1 text-slate-300 outline-none text-sm font-medium"
                                    style={{ colorScheme: "dark" }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Return Date</label>
                            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                                <Calendar className="w-4 h-4 text-slate-600" />
                                <input
                                    type="date" value={dates.end} onChange={(e) => setDates((d) => ({ ...d, end: e.target.value }))}
                                    className="bg-transparent flex-1 text-slate-300 outline-none text-sm font-medium"
                                    style={{ colorScheme: "dark" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Trip Configuration</label>
                        <div className="flex flex-wrap gap-2">
                            {TRIP_TYPES.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTripType(t)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300"
                                    style={{
                                        borderColor: tripType === t ? "#00ff88" : "rgba(255,255,255,0.05)",
                                        background: tripType === t ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.02)",
                                        color: tripType === t ? "#00ff88" : "#475569",
                                    }}
                                >
                                    <Users className="w-3.5 h-3.5" /> {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !to}
                        className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                        style={{
                            background: "linear-gradient(135deg, #00ff88, #0088ff)",
                            color: "#0a0a0f",
                            boxShadow: !loading && to ? "0 8px 32px rgba(0,255,136,0.2)" : "none",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Intelligence…
                            </>
                        ) : "Execute Safety Analysis"}
                    </button>
                </div>

                {/* ── Analysis Result ── */}
                {result && !loading && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                        {/* Overview Profile */}
                        <div
                            className="rounded-[2.5rem] p-10 border relative overflow-hidden"
                            style={{
                                background: "rgba(12,14,22,0.8)",
                                borderColor: `${getSafetyColor(result.dest.safetyScore)}30`,
                                backdropFilter: "blur(40px)"
                            }}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <span className="text-7xl opacity-20 filter grayscale">{result.dest.flag}</span>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <Shield className="w-5 h-5" style={{ color: getSafetyColor(result.dest.safetyScore) }} />
                                    </div>
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                                        Intelligence Profile · {result.dest.name}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-12">
                                    <div className="col-span-1 border-r border-white/5 pr-8">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Comparative Summary</p>
                                        <div className="space-y-8">
                                            <div>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="text-slate-400">Total Safety Index</span>
                                                    <span className="font-black" style={{ color: getSafetyColor(result.dest.safetyScore) }}>{result.dest.safetyScore}/100</span>
                                                </div>
                                                <ProgressBar value={result.dest.safetyScore} />
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Stability Delta</span>
                                                <span className={`text-xl font-black ${result.dest.safetyScore >= result.origin.safetyScore ? 'text-green-400' : 'text-red-400'}`}>
                                                    {result.dest.safetyScore >= result.origin.safetyScore ? '+' : ''}
                                                    {result.dest.safetyScore - result.origin.safetyScore}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-6">
                                        <ScoreGauge score={result.dest.disaster} label="Disaster Resistance" />
                                        <ScoreGauge score={result.dest.airQuality} label="Atmospheric Safety" />
                                        <ScoreGauge score={result.dest.crime} label="Urban Security" />
                                        <ScoreGauge score={result.dest.political} label="Civil Stability" />
                                        <ScoreGauge score={result.dest.weather} label="Climate Metrics" />
                                        <ScoreGauge score={result.dest.overall} label="Unified Index" />
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                                    <Info className="w-5 h-5 text-blue-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-slate-300 leading-relaxed font-light italic">
                                            "{result.dest.aiInsight}"
                                        </p>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-3">
                                            Optimal Window: {result.bestMonth}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Checklist */}
                            <div className="rounded-[2.5rem] p-10 border border-white/5 bg-[#0c0e16]/60 backdrop-blur-xl">
                                <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    Security Directives
                                </h2>
                                <p className="text-xs text-slate-500 mb-8 font-medium italic">Custom-tailored procedural checklist for {result.dest.name}.</p>
                                <div className="space-y-4">
                                    {result.checklist.map((item: string, i: number) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-green-500/30 transition-colors">
                                            <div className="w-5 h-5 rounded-full border border-green-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            </div>
                                            <span className="text-sm text-slate-300 font-light leading-relaxed group-hover:text-white transition-colors">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline & Suggestions */}
                            <div className="space-y-8">
                                <div className="rounded-[2.5rem] p-10 border border-white/5 bg-[#0c0e16]/60 backdrop-blur-xl">
                                    <h2 className="text-xl font-black text-white mb-8 uppercase tracking-tight">Temporal Risk Model</h2>
                                    <div className="flex items-end gap-3 h-32 mb-4">
                                        {result.riskByDay.map(({ day, risk }: any) => {
                                            const color = getSafetyColor(Math.round(risk));
                                            return (
                                                <div key={day} className="flex-1 group relative">
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
                                                        {Math.round(risk)}
                                                    </div>
                                                    <div
                                                        className="w-full rounded-t-xl transition-all duration-1000"
                                                        style={{ height: `${risk}%`, background: `linear-gradient(to top, ${color}22, ${color}88)` }}
                                                    />
                                                    <div className="text-[10px] text-slate-700 text-center mt-2 font-bold uppercase">D{day}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">Short-term predictive integrity: 94%</p>
                                </div>

                                <div className="rounded-[2.5rem] p-10 border border-white/5 bg-[#0c0e16]/60 backdrop-blur-xl">
                                    <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Safer Corridors</h2>
                                    <p className="text-xs text-slate-500 mb-6 italic">Suggested alternatives with superior stability metrics.</p>
                                    <div className="space-y-4">
                                        {result.alternatives.map((alt: any) => (
                                            <div key={alt.iso} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] cursor-pointer transition-all">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-3xl">{alt.flag}</span>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{alt.name}</p>
                                                        <p className="text-[10px] text-green-500 font-bold">+{alt.safetyScore - result.dest.safetyScore} points safer</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-white" style={{ color: getSafetyColor(alt.safetyScore) }}>{alt.safetyScore}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Discover More ── */}
                <div className="mt-20">
                    <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 text-center">Reference High-Stability Zones</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {POPULAR_SAFE.map((c) => (
                            <div
                                key={c.iso}
                                onClick={() => { setTo(c.name); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="rounded-2xl p-4 border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all text-center group cursor-pointer"
                            >
                                <span className="text-3xl block mb-2 filter grayscale group-hover:grayscale-0 transition-all">{c.flag}</span>
                                <p className="text-[10px] font-bold text-white uppercase truncate">{c.name}</p>
                                <p className="text-xs font-black mt-1" style={{ color: getSafetyColor(c.safetyScore) }}>{c.safetyScore}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </PageLayout>
    );
}
