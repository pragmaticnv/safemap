"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Globe, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "Travel Planner", href: "/travel-planner" },
    { label: "Alerts", href: "/alerts" },
    { label: "About", href: "/about" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [timeStr, setTimeStr] = useState("");

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
        };
        update();
        const id = setInterval(update, 30_000);
        return () => clearInterval(id);
    }, []);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
            style={{ background: "rgba(10,10,15,0.82)", backdropFilter: "blur(24px)" }}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div
                        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,136,255,0.1))",
                            border: "1px solid rgba(0,255,136,0.3)",
                            boxShadow: "0 0 20px rgba(0,255,136,0.12)",
                        }}
                    >
                        <Shield className="absolute w-5 h-5" style={{ color: "#00ff88" }} />
                        <Globe
                            className="absolute w-3 h-3 opacity-60"
                            style={{ color: "#0088ff", marginTop: 6, marginLeft: 6 }}
                        />
                    </div>
                    <span
                        className="text-lg font-bold tracking-tight bg-clip-text text-transparent"
                        style={{ backgroundImage: "linear-gradient(90deg, #00ff88, #0088ff)" }}
                    >
                        SafeMap
                    </span>
                </Link>

                {/* ── Desktop Nav ── */}
                <ul className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-white/5 group"
                                    style={{ color: isActive ? "#00ff88" : "#94a3b8" }}
                                >
                                    {link.label}
                                    <span
                                        className="absolute bottom-1 left-4 right-4 h-px transition-transform duration-300 origin-left"
                                        style={{
                                            background: "#00ff88",
                                            transform: isActive ? "scaleX(1)" : "scaleX(0)",
                                        }}
                                    />
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* ── Live badge ── */}
                <div
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border"
                    style={{
                        background: "rgba(0,255,136,0.05)",
                        borderColor: "rgba(0,255,136,0.2)",
                    }}
                >
                    <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: "#00ff88", boxShadow: "0 0 8px #00ff88" }}
                    />
                    <span className="text-xs font-medium" style={{ color: "#00ff88" }}>
                        LIVE
                    </span>
                    {timeStr && (
                        <span className="text-xs text-slate-500 border-l border-white/10 pl-2 ml-1">
                            Updated {timeStr}
                        </span>
                    )}
                </div>

                {/* ── Mobile toggle ── */}
                <button
                    className="md:hidden text-slate-400 hover:text-white transition-colors p-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* ── Mobile drawer ── */}
            {mobileOpen && (
                <div
                    className="md:hidden border-t border-white/5 px-6 py-4"
                    style={{ background: "rgba(10,10,15,0.97)" }}
                >
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center justify-between py-3 text-sm border-b border-white/5 last:border-0 transition-colors"
                                style={{ color: isActive ? "#00ff88" : "#94a3b8" }}
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00ff88" }} />
                                )}
                            </Link>
                        );
                    })}

                    {/* Mobile live badge */}
                    <div className="mt-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00ff88" }} />
                        <span className="text-xs" style={{ color: "#00ff88" }}>LIVE · Updated {timeStr}</span>
                    </div>
                </div>
            )}
        </nav>
    );
}
