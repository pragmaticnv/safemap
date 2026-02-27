"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import SidePanel from "@/components/SidePanel";
import { CountryData } from "@/app/data/safetyData";
import Link from "next/link";

const GlobeComponent = dynamic(() => import("@/components/GlobeComponent"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(0,255,136,0.2)", borderTopColor: "#00ff88" }} />
        <p className="text-sm font-medium tracking-wider" style={{ color: "#444" }}>
          Loading Globe…
        </p>
      </div>
    </div>
  ),
});

interface Tooltip { x: number; y: number; country: CountryData; }

interface Star {
  id: number; x: number; y: number; size: number;
  duration: number; delay: number; opacity: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.6 + 0.15,
  }));
}

const STATS = [
  { label: "Active Disasters", value: "12", color: "#ff3333" },
  { label: "Countries Monitored", value: "195", color: "#00ff88" },
  { label: "Cities Tracked", value: "10,000+", color: "#0088ff" },
  { label: "Last Updated", value: "Live", color: "#ffaa00" },
];

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCountryClick = useCallback((country: CountryData) => {
    if (country.safetyScore === -1) return;
    setSelectedCountry(country);
    setTooltip(null);
    setShowHero(false);
  }, []);

  const handleCountryHover = useCallback(
    (country: CountryData | null, x: number, y: number) => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      if (!country) {
        tooltipTimeout.current = setTimeout(() => setTooltip(null), 120);
      } else {
        setTooltip({ x, y, country });
      }
    },
    []
  );

  const handleClosePanel = useCallback(() => {
    setSelectedCountry(null);
    setShowHero(true);
  }, []);

  useEffect(() => {
    setMounted(true);
    setStars(generateStars(200));

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCountry(null);
        setShowHero(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="home-page"
      style={{ background: "#0a0a0f" }}
    >
      {/* ── Star field ── */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                "--twinkle-duration": `${star.duration}s`,
                "--twinkle-delay": `${star.delay}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* ── Radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(0,255,136,0.04) 0%, transparent 70%)",
        }}
      />

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Globe ── */}
      <div className="absolute inset-0 z-10">
        <GlobeComponent
          onCountryClick={handleCountryClick}
          onCountryHover={handleCountryHover}
          sidePanelOpen={!!selectedCountry}
        />
      </div>

      {/* ── Hero overlay (hides when a country is selected) ── */}
      {showHero && (
        <div
          className="absolute inset-0 z-20 flex flex-col justify-end pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,15,0.82) 0%, rgba(10,10,15,0.35) 40%, transparent 70%)",
          }}
        >
          {/* Text centred at vertical midpoint */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-6 pointer-events-auto w-full max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6" style={{
              borderColor: "rgba(0,255,136,0.25)",
              background: "rgba(0,255,136,0.06)",
            }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00ff88" }} />
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#00ff88" }}>
                REAL-TIME GLOBAL SAFETY INTELLIGENCE
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-[1.1]">
              <span className="text-white">Navigate The </span>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #00ff88 0%, #0088ff 100%)" }}
              >
                World Safely
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
              Real-time safety intelligence for{" "}
              <span className="text-slate-200 font-semibold">195 countries</span> and{" "}
              <span className="text-slate-200 font-semibold">10,000+ cities</span>.
              Click any country on the globe below.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/explore"
                className="px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                  color: "#0a0a0f",
                  boxShadow: "0 0 24px rgba(0,255,136,0.35)",
                }}
              >
                Explore Safety Map
              </Link>
              <Link
                href="/travel-planner"
                className="px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 border"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "#e2e8f0",
                  backdropFilter: "blur(8px)",
                }}
              >
                Plan My Trip →
              </Link>
            </div>
          </div>

          {/* ── Stats bar ── */}
          <div className="w-full px-6 pb-8 pointer-events-auto">
            <div
              className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {STATS.map(({ label, value, color }) => (
                <div
                  key={label}
                  className="px-5 py-3.5 rounded-2xl border text-center"
                  style={{
                    background: "rgba(10,10,15,0.75)",
                    backdropFilter: "blur(16px)",
                    borderColor: `${color}25`,
                    boxShadow: `0 0 20px ${color}0a`,
                  }}
                >
                  <p className="text-xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tooltip ── */}
      {tooltip && (
        <div
          className="tooltip-enter fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 16, top: tooltip.y - 10 }}
        >
          <div
            className="px-3 py-2 rounded-xl text-sm font-medium shadow-2xl border"
            style={{
              background: "rgba(10,12,20,0.92)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.08)",
              color: "#e2e8f0",
            }}
          >
            <div className="flex items-center gap-2">
              {tooltip.country.flag && <span className="text-base">{tooltip.country.flag}</span>}
              <p className="font-semibold text-white">{tooltip.country.name}</p>
            </div>
            {tooltip.country.safetyScore !== -1 ? (
              <p
                className="text-xs mt-0.5"
                style={{
                  color:
                    tooltip.country.safetyScore >= 80 ? "#00ff88"
                      : tooltip.country.safetyScore >= 50 ? "#ffaa00"
                        : "#ff3333",
                }}
              >
                Safety Score: {tooltip.country.safetyScore} / 100
              </p>
            ) : (
              <p className="text-xs mt-0.5 text-slate-500">No data available</p>
            )}
          </div>
        </div>
      )}

      {/* ── Side Panel ── */}
      <SidePanel country={selectedCountry} onClose={handleClosePanel} />

      {/* ── Legend ── */}
      {!selectedCountry && (
        <div
          className="fixed bottom-6 left-6 z-30 px-4 py-3 rounded-2xl border"
          style={{
            background: "rgba(10,12,20,0.85)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-2">Safety Index</p>
          <div className="flex flex-col gap-1.5">
            {[
              { color: "#00ff88", label: "Safe", range: "80–100" },
              { color: "#ffaa00", label: "Moderate", range: "50–79" },
              { color: "#ff3333", label: "Dangerous", range: "0–49" },
            ].map(({ color, label, range }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
                <span className="text-xs text-slate-300">{label}</span>
                <span className="text-xs text-slate-500 ml-1">{range}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
