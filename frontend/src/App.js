import { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import ICUDashboard from "./ICUDashboard";
import DigitalTwinICU  from "./DigitalTwinICU";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {
  Activity,
  AlertTriangle,
  Users,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Plus,
  ChevronRight,
  Cpu,
  Bell,
  Settings,
  Search,
  User,
  TrendingUp,
} from "lucide-react";

Chart.register(ArcElement, Tooltip, Legend);

const FIELD_META = {
  name:   { label: "Full Name",         type: "text",   icon: User,        placeholder: "John Doe",        span: 2 },
  age:    { label: "Age",               type: "number", icon: User,        placeholder: "e.g. 45",         span: 1 },
  gender: { label: "Gender",            type: "text",   icon: User,        placeholder: "Male / Female",   span: 1 },
  HR:     { label: "Heart Rate (bpm)",  type: "number", icon: Heart,       placeholder: "60–100 bpm",      span: 1 },
  O2Sat:  { label: "O₂ Saturation (%)", type: "number", icon: Droplets,    placeholder: "95–100 %",        span: 1 },
  Temp:   { label: "Temperature (°F)",  type: "number", icon: Thermometer, placeholder: "97–99 °F",        span: 1 },
  SBP:    { label: "Systolic BP",       type: "number", icon: Activity,    placeholder: "90–140 mmHg",     span: 1 },
  MAP:    { label: "Mean Art. Pressure",type: "number", icon: TrendingUp,  placeholder: "70–105 mmHg",     span: 1 },
  Resp:   { label: "Resp. Rate (/min)", type: "number", icon: Wind,        placeholder: "12–20 /min",      span: 1 },
};

const RISK_CONFIG = {
  HIGH:   { bg: "bg-red-500/10",    border: "border-red-500/30",    badge: "bg-red-500",    text: "text-red-400",    dot: "bg-red-500",    icon: ShieldX,     label: "High Risk"   },
  MEDIUM: { bg: "bg-amber-500/10",  border: "border-amber-500/30",  badge: "bg-amber-500",  text: "text-amber-400",  dot: "bg-amber-500",  icon: ShieldAlert,  label: "Medium Risk" },
  LOW:    { bg: "bg-emerald-500/10",border: "border-emerald-500/30",badge: "bg-emerald-500",text: "text-emerald-400",dot: "bg-emerald-500",icon: ShieldCheck,  label: "Low Risk"    },
};
  

export default function App() {
  const [patients, setPatients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("dashboard"); // "dashboard" or "icu"
  const [form, setForm] = useState({
    name: "", age: "", gender: "",
    HR: "", O2Sat: "", Temp: "",
    SBP: "", MAP: "", Resp: "",
  });

  const fetchPatients = async () => {
    const res = await axios.get("http://localhost:5000/api/patients/all");
    setPatients(res.data);
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await axios.post("http://localhost:5000/api/patients/add", form);
    await fetchPatients();
    setSubmitting(false);
    setSubmitted(true);
    setForm({ name: "", age: "", gender: "", HR: "", O2Sat: "", Temp: "", SBP: "", MAP: "", Resp: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const high = patients.filter(p => p.risk_level === "HIGH").length;
  const med  = patients.filter(p => p.risk_level === "MEDIUM").length;
  const low  = patients.filter(p => p.risk_level === "LOW").length;

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = {
    labels: ["High Risk", "Medium Risk", "Low Risk"],
    datasets: [{
      data: [high, med, low],
      backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
      borderColor: ["#991b1b", "#92400e", "#065f46"],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94a3b8",
          padding: 20,
          font: { size: 13, family: "'DM Sans', sans-serif" },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  if (view == "simulator"){
    return <DigitalTwinICU setView={setView}/>;
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white leading-none tracking-tight text-lg">MedAI Nexus</p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Intelligent Hospital Monitoring System</p>
            </div>
          </div>

          {/* Center status */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">AI Engine Active</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 text-slate-400">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-medium text-slate-300">{timeStr}</p>
              <p className="text-xs text-slate-600">{dateStr}</p>
            </div>
            <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <Bell className="w-4 h-4" />
              {high > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button
 onClick={()=>setView("simulator")}
 className="px-4 py-2 rounded-lg bg-red-600 text-white"
>
AI ICU SIMULATION
</button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">Dr</div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">

        {/* ── PAGE HEADER ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Patient Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time AI-powered risk monitoring & early warning</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            <span>{patients.length} patients tracked</span>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 group hover:border-cyan-500/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-white">{patients.length}</p>
            <p className="text-sm text-slate-500 mt-1">Total Patients</p>
          </div>

          {/* High */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 group hover:border-red-500/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <ShieldX className="w-5 h-5 text-red-400" />
              </div>
              {high > 0 && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium animate-pulse">Alert</span>}
            </div>
            <p className="text-3xl font-bold text-white">{high}</p>
            <p className="text-sm text-slate-500 mt-1">High Risk</p>
          </div>

          {/* Medium */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 group hover:border-amber-500/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{med}</p>
            <p className="text-sm text-slate-500 mt-1">Medium Risk</p>
          </div>

          {/* Low */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 group hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{low}</p>
            <p className="text-sm text-slate-500 mt-1">Low Risk</p>
          </div>
        </div>

        {/* ── CHART + FORM ROW ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Risk Distribution</h2>
                <p className="text-xs text-slate-500">AI-classified patient segments</p>
              </div>
            </div>
            {patients.length > 0 ? (
              <div className="flex justify-center">
                <div className="w-64">
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-slate-600 text-sm">No patient data yet</p>
              </div>
            )}
            {/* mini legend */}
            <div className="mt-6 grid grid-cols-3 gap-2 pt-4 border-t border-slate-800">
              {[
                { label: "High", value: high,  color: "bg-red-500"     },
                { label: "Medium", value: med, color: "bg-amber-500"   },
                { label: "Low",  value: low,   color: "bg-emerald-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className="text-lg font-bold text-white">{patients.length > 0 ? `${Math.round((value / patients.length) * 100)}%` : "—"}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Patient Form */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Register New Patient</h2>
                <p className="text-xs text-slate-500">Enter vitals for AI risk assessment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(FIELD_META).map(([key, meta]) => {
                  const Icon = meta.icon;
                  return (
                    <div key={key} className={`col-span-${meta.span} flex flex-col gap-1.5`}
                      style={{ gridColumn: `span ${meta.span}` }}>
                      <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-slate-600" />
                        {meta.label}
                      </label>
                      <input
                        type={meta.type}
                        placeholder={meta.placeholder}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        required
                      />
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analyzing Vitals…
                  </>
                ) : submitted ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Patient Added Successfully
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Add Patient & Run AI Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── PATIENT LIST ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Patient Registry</h2>
                <p className="text-xs text-slate-500">{filteredPatients.length} records</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                type="text"
                placeholder="Search patients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all w-48"
              />
            </div>
          </div>

          {/* Table */}
          {filteredPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["Patient", "Age / Gender", "Heart Rate", "O₂ Sat", "Temp", "Resp Rate", "Risk Score", "Risk Level"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPatients.map((p, i) => {
                    const risk = RISK_CONFIG[p.risk_level] || RISK_CONFIG.LOW;
                    const RiskIcon = risk.icon;
                    return (
                      <tr key={p._id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                              {p.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="font-medium text-white whitespace-nowrap">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 whitespace-nowrap">{p.age} yrs · {p.gender}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-slate-300">{p.vitals?.HR} <span className="text-slate-600 text-xs">bpm</span></span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-slate-300">{p.vitals?.O2Sat}<span className="text-slate-600 text-xs">%</span></span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-slate-300">{p.vitals?.Temp}<span className="text-slate-600 text-xs">°F</span></span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Wind className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-slate-300">{p.vitals?.Resp}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${p.risk_level === "HIGH" ? "bg-red-500" : p.risk_level === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min((p.risk_score || 0) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-slate-300 font-mono text-xs">{p.risk_score?.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            p.risk_level === "HIGH"   ? "bg-red-500/10 border-red-500/30 text-red-400" :
                            p.risk_level === "MEDIUM" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                            "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          }`}>
                            <RiskIcon className="w-3 h-3" />
                            {p.risk_level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No patients found</p>
              <p className="text-slate-600 text-sm mt-1">{search ? "Try a different search term" : "Add a patient using the form above"}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-slate-800/50">
          <p className="text-xs text-slate-700">MedAI Nexus · Intelligent Hospital Monitoring System · Final Year Project Demo</p>
        </div>
      </main>
    </div>
  );
}