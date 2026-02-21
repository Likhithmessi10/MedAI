import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

// ─── Physiological Simulation Engine ────────────────────────────────────────

function generatePatient() {
  return {
    age: Math.floor(Math.random() * 56) + 25,
    name: ["J. HARTWELL", "M. CHEN", "R. OKAFOR", "S. NOVAK", "A. IBRAHIM", "L. PETROV"][
      Math.floor(Math.random() * 6)
    ],
    ward: ["ICU-A", "ICU-B", "CCU", "NEURO-ICU"][Math.floor(Math.random() * 4)],
    bed: `BED-${Math.floor(Math.random() * 12) + 1}`,
    infectionSeverity: Math.random() * 0.3,
    lungFunction: 0.85 + Math.random() * 0.15,
    cardiacStress: Math.random() * 0.25,
  };
}

function generateBaseVitals(patient) {
  return {
    HR: 60 + Math.round(patient.cardiacStress * 40) + Math.floor(Math.random() * 10),
    O2Sat: Math.round((patient.lungFunction * 97) + (Math.random() * 2 - 1)),
    Temp: parseFloat((97.8 + patient.infectionSeverity * 3 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
    SBP: 110 + Math.round(patient.cardiacStress * 30) + Math.floor(Math.random() * 10),
    MAP: 70 + Math.round(patient.cardiacStress * 20) + Math.floor(Math.random() * 8),
    Resp: 12 + Math.round(patient.infectionSeverity * 10) + Math.floor(Math.random() * 3),
  };
}

function evolveVitals(prev, patient, tick) {
  const drift = Math.sin(tick * 0.15) * 0.015 + (Math.random() - 0.5) * 0.03;
  const infNow = Math.min(patient.infectionSeverity + tick * 0.003, 0.95);
  const lungNow = Math.max(patient.lungFunction - tick * 0.001, 0.4);

  const HR = Math.round(
    Math.max(40, Math.min(160,
      prev.HR + (100 - prev.O2Sat) * 0.6 + drift * 20 + infNow * 2 + (Math.random() - 0.5) * 3
    ))
  );
  const O2Sat = Math.round(
    Math.max(70, Math.min(100,
      prev.O2Sat + (lungNow - 0.85) * 1.5 + drift * -3 + (Math.random() - 0.5) * 1.5
    ))
  );
  const Temp = parseFloat(
    Math.max(95, Math.min(106,
      prev.Temp + infNow * 0.08 + (Math.random() - 0.5) * 0.15
    )).toFixed(1)
  );
  const SBP = Math.round(
    Math.max(70, Math.min(200,
      prev.SBP - infNow * 1.5 + (Math.random() - 0.5) * 4
    ))
  );
  const MAP = Math.round(
    Math.max(50, Math.min(140,
      prev.MAP - infNow * 1 + (Math.random() - 0.5) * 3
    ))
  );
  const Resp = Math.round(
    Math.max(8, Math.min(40,
      prev.Resp + infNow * 0.4 + (100 - O2Sat) * 0.1 + (Math.random() - 0.5) * 1.5
    ))
  );

  return { HR, O2Sat, Temp, SBP, MAP, Resp };
}

// ─── ECG Waveform Generator ─────────────────────────────────────────────────

function generateECGPoint(t, hr) {
  const period = 60 / hr;
  const phase = (t % period) / period;
  if (phase < 0.05) return Math.sin(phase * 60) * 0.15;
  if (phase < 0.12) return -0.05;
  if (phase < 0.14) return -0.15;
  if (phase < 0.17) return 1.0;
  if (phase < 0.19) return -0.35;
  if (phase < 0.22) return 0.05;
  if (phase < 0.38) return 0.25 * Math.sin(((phase - 0.22) / 0.16) * Math.PI);
  if (phase < 0.48) return 0.1 * Math.sin(((phase - 0.38) / 0.1) * Math.PI);
  return (Math.random() - 0.5) * 0.02;
}

// ─── Inline Styles & CSS ────────────────────────────────────────────────────

const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&display=swap');

  .icu-root { font-family: 'Rajdhani', sans-serif; }
  .icu-mono { font-family: 'Share Tech Mono', monospace; }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes critical-flash {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); border-color: rgba(239,68,68,0.4); }
    50% { box-shadow: 0 0 60px 10px rgba(239,68,68,0.35); border-color: rgba(239,68,68,0.9); }
  }
  @keyframes blink-text {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.1; }
  }
  @keyframes glow-green {
    0%, 100% { text-shadow: 0 0 8px #00ff88, 0 0 20px #00ff88; }
    50% { text-shadow: 0 0 14px #00ff88, 0 0 35px #00ff88, 0 0 60px #00cc66; }
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    14% { transform: scale(1.15); }
    28% { transform: scale(1); }
    42% { transform: scale(1.08); }
  }
  @keyframes data-scroll {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .scanline-effect::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(transparent, rgba(0,255,136,0.06), transparent);
    animation: scanline 4s linear infinite;
    pointer-events: none;
  }
  .glow-green-text { animation: glow-green 2.5s ease-in-out infinite; }
  .critical-border { animation: critical-flash 1.2s ease-in-out infinite; }
  .heartbeat-icon { animation: heartbeat 1s ease-in-out infinite; }
  .blink { animation: blink-text 1s step-start infinite; }
  .spin-slow { animation: spin-slow 8s linear infinite; }
  .fade-in-up { animation: fadeInUp 0.6s ease forwards; }

  .vital-card {
    background: linear-gradient(135deg, rgba(0,20,10,0.9) 0%, rgba(0,30,20,0.7) 100%);
    border: 1px solid rgba(0,255,136,0.15);
    backdrop-filter: blur(12px);
    transition: all 0.3s ease;
  }
  .vital-card:hover {
    border-color: rgba(0,255,136,0.4);
    box-shadow: 0 0 20px rgba(0,255,136,0.1), inset 0 0 20px rgba(0,255,136,0.03);
  }
  .vital-value-normal { color: #00ff88; text-shadow: 0 0 12px rgba(0,255,136,0.8); }
  .vital-value-warn   { color: #fbbf24; text-shadow: 0 0 12px rgba(251,191,36,0.8); }
  .vital-value-danger { color: #f87171; text-shadow: 0 0 12px rgba(248,113,113,0.8); animation: blink-text 1.5s ease infinite; }

  .glass-panel {
    background: rgba(0,10,6,0.85);
    border: 1px solid rgba(0,255,136,0.12);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,255,136,0.08);
  }
  .risk-high {
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.5) !important;
    box-shadow: 0 0 40px rgba(239,68,68,0.2), inset 0 0 40px rgba(239,68,68,0.05);
  }
  .risk-medium {
    background: rgba(251,191,36,0.06);
    border-color: rgba(251,191,36,0.4) !important;
    box-shadow: 0 0 30px rgba(251,191,36,0.15);
  }
  .risk-low {
    background: rgba(0,255,136,0.04);
    border-color: rgba(0,255,136,0.25) !important;
  }
  .ticker-text { animation: data-scroll 22s linear infinite; white-space: nowrap; }
  .ecg-canvas { image-rendering: pixelated; }
  .grid-bg {
    background-image:
      linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px);
    background-size: 32px 32px;
  }
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function VitalCard({ label, value, unit, normal, warn, icon, extra }) {
  const num = parseFloat(value);
  const cls =
    num >= warn[0] && num <= warn[1]
      ? "vital-value-warn"
      : num < normal[0] || num > normal[1]
      ? "vital-value-danger"
      : "vital-value-normal";

  return (
    <div className="vital-card rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
      <div className="absolute top-2 right-3 text-xs opacity-30 icu-mono">{icon}</div>
      <span className="text-xs tracking-widest text-green-500/60 uppercase font-medium">{label}</span>
      <div className="flex items-end gap-1">
        <span className={`icu-mono text-3xl font-bold leading-none ${cls}`}>{value}</span>
        <span className="text-green-600/70 text-xs mb-1 icu-mono">{unit}</span>
      </div>
      {extra && <span className="text-xs text-green-600/50 icu-mono">{extra}</span>}
    </div>
  );
}

function ECGCanvas({ hr }) {
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const bufferRef = useRef(new Array(600).fill(0));
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const mid = H / 2;
    const amp = H * 0.38;

    function draw() {
      tRef.current += 0.045;
      const newVal = generateECGPoint(tRef.current, hr);
      bufferRef.current.push(newVal);
      bufferRef.current.shift();

      ctx.clearRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = "rgba(0,255,136,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // trailing glow lines (3 passes for bloom)
      [
        { alpha: 0.08, width: 6, color: "0,255,136" },
        { alpha: 0.25, width: 3, color: "0,255,136" },
        { alpha: 1.0,  width: 1.5, color: "80,255,170" },
      ].forEach(({ alpha, width, color }) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color},${alpha})`;
        ctx.lineWidth = width;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        const buf = bufferRef.current;
        for (let i = 1; i < buf.length; i++) {
          const x = (i / buf.length) * W;
          const y = mid - buf[i] * amp;
          i === 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // moving cursor dot
      const lastX = W - 2;
      const lastY = mid - (bufferRef.current[bufferRef.current.length - 1] * amp);
      const grad = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, 6);
      grad.addColorStop(0, "rgba(0,255,136,1)");
      grad.addColorStop(1, "rgba(0,255,136,0)");
      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [hr]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className="w-full h-full ecg-canvas"
      style={{ display: "block" }}
    />
  );
}

function RiskGauge({ score }) {
  const pct = Math.round((score || 0) * 100);
  const angle = (pct / 100) * 180 - 90;
  const r = 70;
  const cx = 90, cy = 90;
  const arcPath = (start, end, color, sw) => {
    const s = start * Math.PI / 180;
    const e = end * Math.PI / 180;
    const x1 = cx + r * Math.cos(s - Math.PI / 2);
    const y1 = cy + r * Math.sin(s - Math.PI / 2);
    const x2 = cx + r * Math.cos(e - Math.PI / 2);
    const y2 = cy + r * Math.sin(e - Math.PI / 2);
    const la = end - start > 180 ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    );
  };
  const needleX = cx + (r - 12) * Math.cos((angle * Math.PI) / 180);
  const needleY = cy + (r - 12) * Math.sin((angle * Math.PI) / 180);
  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-xs mx-auto">
      {arcPath(0, 180, "rgba(0,255,136,0.1)", 12)}
      {arcPath(0, 60, "rgba(0,255,136,0.7)", 10)}
      {arcPath(60, 120, "rgba(251,191,36,0.7)", 10)}
      {arcPath(120, 180, "rgba(239,68,68,0.7)", 10)}
      {arcPath(0, pct * 1.8, pct < 40 ? "#00ff88" : pct < 70 ? "#fbbf24" : "#ef4444", 3)}
      <line
        x1={cx} y1={cy}
        x2={needleX} y2={needleY}
        stroke="white" strokeWidth="2" strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 4px white)" }}
      />
      <circle cx={cx} cy={cy} r="5" fill="#1a1a1a" stroke="rgba(0,255,136,0.5)" strokeWidth="1.5" />
      <text x={20} y={98} fill="rgba(0,255,136,0.5)" fontSize="8" fontFamily="'Share Tech Mono'">LOW</text>
      <text x={80} y={98} fill="rgba(251,191,36,0.5)" fontSize="8" fontFamily="'Share Tech Mono'">MED</text>
      <text x={148} y={98} fill="rgba(239,68,68,0.5)" fontSize="8" fontFamily="'Share Tech Mono'">HIGH</text>
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DigitalTwinICU() {
  const [patient] = useState(generatePatient);
  const [vitals, setVitals] = useState(() => generateBaseVitals(generatePatient()));
  const [risk, setRisk] = useState({ risk_level: "LOW", risk_score: 0.1 });
  const [prevRisk, setPrevRisk] = useState("LOW");
  const [tick, setTick] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState([]);
  const [connecting, setConnecting] = useState(true);
  const [statusMsg, setStatusMsg] = useState("INITIALIZING…");
  const patientRef = useRef(patient);
  const vitalsRef = useRef(vitals);
  vitalsRef.current = vitals;

  // Boot sequence
  useEffect(() => {
    const msgs = [
      "LOADING DIGITAL TWIN ENGINE…",
      "CONNECTING AI INFERENCE SERVER…",
      "CALIBRATING BIOSENSORS…",
      "ESTABLISHING PATIENT PROFILE…",
      "SYSTEM READY",
    ];
    let i = 0;
    const iv = setInterval(() => {
      setStatusMsg(msgs[i]);
      i++;
      if (i >= msgs.length) { clearInterval(iv); setConnecting(false); }
    }, 500);
    return () => clearInterval(iv);
  }, []);

  // Vital evolution
  useEffect(() => {
    if (connecting) return;
    const iv = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        setVitals(prev => evolveVitals(prev, patientRef.current, next));
        return next;
      });
    }, 2500);
    return () => clearInterval(iv);
  }, [connecting]);

  // Timer
  useEffect(() => {
    if (connecting) return;
    const iv = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(iv);
  }, [connecting]);

  // AI Prediction
  useEffect(() => {
    if (connecting) return;
    const iv = setInterval(async () => {
      try {
        const { HR, O2Sat, Temp, SBP, MAP, Resp } = vitalsRef.current;
        const res = await axios.post("http://localhost:5000/api/patients/predictLive", {
          HR, O2Sat, Temp, SBP, MAP, Resp, Age: patientRef.current.age,
        });
        const result = res.data;
        setPrevRisk(r => r);
        setRisk(prev => {
          if (prev.risk_level !== result.risk_level) {
            setPrevRisk(prev.risk_level);
            const now = new Date();
            const ts = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
            setLog(l => [`[${ts}] RISK CHANGED: ${prev.risk_level} → ${result.risk_level}  |  SCORE: ${(result.risk_score * 100).toFixed(1)}%`, ...l.slice(0, 6)]);
          }
          return result;
        });
      } catch {
        setLog(l => ["[ERR] AI SERVER UNREACHABLE — RETRYING…", ...l.slice(0, 6)]);
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [connecting]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const rl = risk.risk_level;
  const score = risk.risk_score || 0;
  const isHigh = rl === "HIGH";
  const isMed  = rl === "MEDIUM";

  const riskPanelClass = isHigh ? "risk-high critical-border" : isMed ? "risk-medium" : "risk-low";
  const riskColor = isHigh ? "#ef4444" : isMed ? "#fbbf24" : "#00ff88";
  const statusLabel = isHigh ? "CRITICAL" : isMed ? "DETERIORATING" : "STABLE";

  return (
    <>
      <style>{GLOBAL_STYLE}</style>

      <div
        className={`icu-root min-h-screen grid-bg relative overflow-hidden`}
        style={{ background: "#000a05" }}
      >
        {/* Scanline overlay */}
        <div className="scanline-effect absolute inset-0 pointer-events-none" />

        {/* Ambient glow top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,255,136,0.06) 0%, transparent 70%)" }} />

        {/* Critical screen glow */}
        {isHigh && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(239,68,68,0.05) 0%, transparent 70%)",
              animation: "critical-flash 1.2s ease-in-out infinite" }} />
        )}

        {/* Boot screen */}
        {connecting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "#000a05" }}>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-green-500/30 flex items-center justify-center spin-slow"
                style={{ boxShadow: "0 0 30px rgba(0,255,136,0.2)" }}>
                <div className="w-12 h-12 rounded-full border-2 border-green-400/50" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-400 tracking-widest glow-green-text icu-mono">MEDAI NEXUS</h1>
                <p className="text-green-600/60 text-xs tracking-widest mt-1 icu-mono">DIGITAL TWIN ICU MONITOR</p>
              </div>
              <div className="w-64 h-px bg-green-900/50 mx-auto overflow-hidden">
                <div className="h-full bg-green-400/60" style={{ width: "60%", transition: "width 0.4s" }} />
              </div>
              <p className="icu-mono text-xs text-green-500/80 tracking-widest blink">{statusMsg}</p>
            </div>
          </div>
        )}

        {!connecting && (
          <div className="flex flex-col h-screen max-h-screen" style={{ padding: "10px 12px", gap: "8px" }}>

            {/* ── TOP BAR ── */}
            <header className="glass-panel rounded-xl px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #00ff88" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/20" />
                </div>
                <div>
                  <h1 className="icu-mono text-green-400 font-bold tracking-widest text-sm glow-green-text">
                    AI DIGITAL TWIN ·· ICU MONITOR
                  </h1>
                  <p className="text-green-600/50 text-xs icu-mono tracking-widest">
                    MEDAI NEXUS  ·  REAL-TIME PREDICTIVE MONITORING  ·  v2.4.1
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="icu-mono text-green-400/80 text-xs">SESSION</p>
                  <p className="icu-mono text-green-300 text-lg font-bold" style={{ lineHeight: 1 }}>{fmt(elapsed)}</p>
                </div>
                <div className="text-right">
                  <p className="icu-mono text-green-400/80 text-xs">PATIENT</p>
                  <p className="icu-mono text-green-300 text-sm font-bold">{patient.name}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border icu-mono text-xs font-bold tracking-widest ${
                  isHigh ? "border-red-500/60 text-red-400 bg-red-500/10" :
                  isMed  ? "border-amber-500/60 text-amber-400 bg-amber-500/10" :
                           "border-green-500/40 text-green-400 bg-green-500/10"
                } ${isHigh ? "blink" : ""}`}>
                  {statusLabel}
                </div>
              </div>
            </header>

            {/* ── MAIN GRID ── */}
            <div className="flex-1 grid gap-2 min-h-0" style={{ gridTemplateColumns: "280px 1fr 260px" }}>

              {/* ── LEFT: VITALS ── */}
              <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
                <div className="glass-panel rounded-xl px-4 py-2 flex-shrink-0">
                  <p className="icu-mono text-green-500/50 text-xs tracking-widest">BIOSENSOR ARRAY</p>
                </div>

                <VitalCard label="HEART RATE" value={vitals.HR} unit="BPM"
                  normal={[60,100]} warn={[101,120]}
                  icon="♥" extra={vitals.HR > 100 ? "TACHYCARDIA" : vitals.HR < 60 ? "BRADYCARDIA" : "NORMAL SINUS"} />

                <VitalCard label="SpO₂  OXYGEN SAT" value={vitals.O2Sat} unit="%"
                  normal={[95,100]} warn={[90,94]}
                  icon="◎" extra={vitals.O2Sat < 90 ? "⚠ HYPOXEMIA" : "ADEQUATE PERFUSION"} />

                <VitalCard label="CORE TEMPERATURE" value={vitals.Temp} unit="°F"
                  normal={[97,99]} warn={[99,101]}
                  icon="T°" extra={vitals.Temp > 101 ? "FEBRILE" : vitals.Temp < 97 ? "HYPOTHERMIC" : "NORMOTHERMIC"} />

                <VitalCard label="SYSTOLIC BP" value={vitals.SBP} unit="mmHg"
                  normal={[90,140]} warn={[141,160]}
                  icon="⊕" extra={`MAP: ${vitals.MAP} mmHg`} />

                <VitalCard label="RESPIRATORY RATE" value={vitals.Resp} unit="/min"
                  normal={[12,20]} warn={[21,25]}
                  icon="~" extra={vitals.Resp > 25 ? "TACHYPNEA" : "NORMAL RATE"} />
              </div>

              {/* ── CENTER: ECG + LOG ── */}
              <div className="flex flex-col gap-2 min-h-0">
                {/* ECG Panel */}
                <div className="glass-panel rounded-xl flex-1 flex flex-col p-4 min-h-0">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="heartbeat-icon text-xl" style={{ filter: "drop-shadow(0 0 6px #ef4444)", color: isHigh ? "#ef4444" : "#00ff88" }}>♥</span>
                      <div>
                        <p className="icu-mono text-green-400/70 text-xs tracking-widest">LEAD II  ·  ECG WAVEFORM</p>
                        <p className="icu-mono text-xs text-green-600/40">25mm/s  ·  10mm/mV  ·  CONTINUOUS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 8px #00ff88", animation: "pulse-ring 1.5s ease-out infinite" }} />
                      <span className="icu-mono text-xs text-green-400/60">LIVE</span>
                    </div>
                  </div>
                  <div className="flex-1 rounded-lg overflow-hidden min-h-0" style={{
                    background: "rgba(0,8,4,0.9)",
                    border: "1px solid rgba(0,255,136,0.08)",
                    minHeight: "100px",
                  }}>
                    <ECGCanvas hr={vitals.HR} />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 flex-shrink-0">
                    {[
                      { l: "PR Int.", v: `${Math.round(120 + (100-vitals.HR)*0.5)}ms` },
                      { l: "QRS Dur.", v: `${Math.round(80 + vitals.Resp * 0.5)}ms` },
                      { l: "QTc", v: `${Math.round(380 + (vitals.HR-70)*0.8)}ms` },
                      { l: "RR Int.", v: `${Math.round(60000/vitals.HR)}ms` },
                    ].map(({l,v}) => (
                      <div key={l} className="rounded-lg p-2 text-center" style={{ background: "rgba(0,255,136,0.03)", border: "1px solid rgba(0,255,136,0.08)" }}>
                        <p className="icu-mono text-green-500/40 text-xs">{l}</p>
                        <p className="icu-mono text-green-300 text-sm font-bold">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Log */}
                <div className="glass-panel rounded-xl p-4 flex-shrink-0" style={{ height: "120px" }}>
                  <p className="icu-mono text-green-500/40 text-xs tracking-widest mb-2">SYSTEM EVENT LOG</p>
                  <div className="space-y-1 overflow-hidden" style={{ maxHeight: "70px" }}>
                    {log.length === 0 ? (
                      <p className="icu-mono text-xs text-green-700/50">Monitoring in progress…</p>
                    ) : log.map((l, i) => (
                      <p key={i} className="icu-mono text-xs" style={{
                        color: l.includes("HIGH") ? "#f87171" : l.includes("MEDIUM") ? "#fbbf24" : l.includes("ERR") ? "#f87171" : "#00cc66",
                        opacity: 1 - i * 0.15,
                      }}>{l}</p>
                    ))}
                  </div>
                </div>

                {/* Ticker */}
                <div className="glass-panel rounded-lg px-4 py-2 flex-shrink-0 overflow-hidden">
                  <div className="ticker-text icu-mono text-xs text-green-600/50">
                    MEDAI NEXUS AI ENGINE  ·  DIGITAL TWIN ACTIVE  ·  PHYSIOLOGICAL SIM v2.4  ·
                    VITALS MONITORED: HR  O2Sat  TEMP  SBP  MAP  RESP  ·
                    AI RISK MODEL: GRADIENT BOOSTED ENSEMBLE  ·  LATENCY &lt;50ms  ·
                    {patient.ward}  ·  {patient.bed}  ·  AGE {patient.age}  ·
                    ALL SYSTEMS NOMINAL  ·  NEXT ANALYSIS IN 3s  ·
                  </div>
                </div>
              </div>

              {/* ── RIGHT: AI RISK ENGINE ── */}
              <div className={`glass-panel rounded-xl flex flex-col p-5 gap-4 transition-all duration-700 ${riskPanelClass}`}>
                <div>
                  <p className="icu-mono text-xs tracking-widest mb-1" style={{ color: `${riskColor}88` }}>
                    AI RISK ENGINE
                  </p>
                  <p className="text-xs text-green-700/50 icu-mono">PREDICTIVE ANALYSIS</p>
                </div>

                {/* Big Risk Level */}
                <div className="text-center">
                  <div className="relative inline-block">
                    {isHigh && (
                      <div className="absolute inset-0 rounded-full"
                        style={{ background: "rgba(239,68,68,0.15)", animation: "pulse-ring 1.5s ease-out infinite", transform: "scale(1.5)" }} />
                    )}
                    <div className={`w-28 h-28 rounded-full mx-auto flex flex-col items-center justify-center relative`}
                      style={{
                        border: `3px solid ${riskColor}`,
                        boxShadow: `0 0 30px ${riskColor}55, inset 0 0 30px ${riskColor}11`,
                        background: `radial-gradient(circle, ${riskColor}10 0%, transparent 70%)`,
                      }}>
                      <span className="icu-mono font-bold text-2xl leading-none" style={{ color: riskColor,
                        textShadow: `0 0 15px ${riskColor}` }}>
                        {rl}
                      </span>
                      <span className="text-xs mt-1 icu-mono" style={{ color: `${riskColor}99` }}>RISK</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-center">
                  <p className="icu-mono text-xs text-green-600/50 tracking-widest">RISK SCORE</p>
                  <p className="icu-mono text-4xl font-bold" style={{ color: riskColor, textShadow: `0 0 20px ${riskColor}` }}>
                    {Math.round(score * 100)}<span className="text-lg">%</span>
                  </p>
                </div>

                {/* Gauge */}
                <RiskGauge score={score} />

                {/* Status */}
                <div className={`rounded-lg p-3 text-center ${isHigh ? "blink" : ""}`}
                  style={{ background: `${riskColor}10`, border: `1px solid ${riskColor}30` }}>
                  <p className="icu-mono font-bold text-sm tracking-widest" style={{ color: riskColor }}>
                    {isHigh ? "⚠ CRITICAL CONDITION" : isMed ? "⚡ DETERIORATING" : "✓ STABLE"}
                  </p>
                  {isHigh && (
                    <p className="icu-mono text-xs text-red-400/70 mt-1">IMMEDIATE INTERVENTION REQUIRED</p>
                  )}
                </div>

                {/* Risk breakdown bars */}
                <div className="space-y-2">
                  {[
                    { label: "CARDIAC RISK",  val: Math.min(score * 1.1 + 0.05, 1), color: "#f87171" },
                    { label: "RESP RISK",     val: Math.min(score * 0.9 + 0.03, 1), color: "#fbbf24" },
                    { label: "SEPSIS INDEX",  val: Math.min(score * 0.85,       1), color: "#a78bfa" },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1">
                        <span className="icu-mono text-xs text-green-600/50">{label}</span>
                        <span className="icu-mono text-xs" style={{ color }}>{Math.round(val * 100)}%</span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${val * 100}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-2 border-t border-green-900/30">
                  <p className="icu-mono text-xs text-green-700/40 text-center">
                    MODEL: GBM ENSEMBLE · ACC 94.2%
                  </p>
                </div>
              </div>
            </div>

            {/* ── BOTTOM STATUS BAR ── */}
            <footer className="glass-panel rounded-xl px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #00ff88" }} />
                  <span className="icu-mono text-xs text-green-500/70">AI ENGINE ONLINE</span>
                </div>
                <div className="icu-mono text-xs text-green-700/50">
                  PATIENT: <span className="text-green-400/80">{patient.name}</span>
                </div>
                <div className="icu-mono text-xs text-green-700/50">
                  AGE: <span className="text-green-400/80">{patient.age}Y</span>
                </div>
                <div className="icu-mono text-xs text-green-700/50">
                  WARD: <span className="text-green-400/80">{patient.ward} · {patient.bed}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="icu-mono text-xs text-green-700/50">
                  VITALS: <span className="text-green-400/80">UPDATING 2.5s</span>
                </div>
                <div className="icu-mono text-xs text-green-700/50">
                  AI POLL: <span className="text-green-400/80">3.0s</span>
                </div>
                <div className="icu-mono text-xs text-green-700/50">
                  TICK: <span className="text-green-400/80">#{tick}</span>
                </div>
                <div className="icu-mono text-xs" style={{ color: riskColor }}>
                  {rl} · {Math.round(score * 100)}%
                </div>
              </div>
            </footer>
          </div>
        )}
      </div>
    </>
  );
}