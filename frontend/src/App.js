import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  Server,
  BrainCircuit,
  Cpu,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

import PatientNexus from "./PatientNexus";
import DigitalTwinICU from "./DigitalTwinICU";
import ComplianceDashboard from "./ComplianceDashboard";
import DeviceInteroperabilityHub from "./DeviceInteroperabilityHub";
import AutomatedDiagnostics from "./AutomatedDiagnostics";

export default function App() {
  const [view, setView] = useState("dashboard");

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const renderView = () => {
    switch (view) {
      case "dashboard": return <PatientNexus />;
      case "simulator": return <DigitalTwinICU setView={setView} />;
      case "compliance": return <ComplianceDashboard setView={setView} />;
      case "devices": return <DeviceInteroperabilityHub setView={setView} />;
      case "diagnostics": return <AutomatedDiagnostics setView={setView} />;
      default: return <PatientNexus />;
    }
  };

  if (view === "simulator") {
    return <DigitalTwinICU setView={setView} />;
  }

  const navBtn = (id, icon, label, activeColor) => {
    const activeStyles = {
      cyan: "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400",
      violet: "bg-violet-500/10 text-violet-400 border-l-2 border-violet-400",
      emerald: "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400",
      blue: "bg-blue-500/10 text-blue-400 border-l-2 border-blue-400",
    };
    const isActive = view === id;
    return (
      <button
        onClick={() => setView(id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border-l-2 border-transparent
          ${isActive
            ? activeStyles[activeColor]
            : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
          }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex w-60 flex-col bg-slate-900/80 border-r border-slate-800/60 shrink-0">

        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/60 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <p className="font-bold text-white tracking-tight text-[15px]">MedAI Nexus</p>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
          <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-[0.15em] mb-3">
            Core Systems
          </p>

          {navBtn("dashboard", <Users className="w-4 h-4 shrink-0" />, "Patient Nexus (EWS)", "cyan")}
          {navBtn("diagnostics", <BrainCircuit className="w-4 h-4 shrink-0" />, "Automated Diagnostics", "violet")}

          <div className="my-3 border-t border-slate-800/60" />

          {navBtn("compliance", <ShieldCheck className="w-4 h-4 shrink-0" />, "Compliance Monitor", "emerald")}
          {navBtn("devices", <Server className="w-4 h-4 shrink-0" />, "Device Interop Hub", "blue")}
        </div>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-slate-800/60 shrink-0">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 border-l-2 border-transparent">
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-16 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-xl shrink-0 flex items-center justify-between px-6 z-20">

          {/* Status */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/60 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">Platform Online</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Clock */}
            <div className="hidden lg:block text-right mr-2">
              <p className="text-xs font-bold text-slate-200 tabular-nums tracking-wide">{timeStr}</p>
              <p className="text-[10px] text-slate-600 tracking-wide">{dateStr}</p>
            </div>

            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-all duration-150">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-all duration-150">
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setView("simulator")}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-[11px] font-bold tracking-widest transition-all duration-150 shadow-lg shadow-red-950/50 hover:-translate-y-px active:translate-y-0"
            >
              LAUNCH AI ICU
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white ring-1 ring-violet-500/30 ml-1">
              Dr
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>

    </div>
  );
}