import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Activity,
    Users,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Heart,
    Thermometer,
    Droplets,
    Plus,
    Wind,
    ChevronRight,
    Cpu,
    TrendingUp,
    Search
} from "lucide-react";

const FIELD_META = {
    name: { label: "Full Name", type: "text", icon: Users, placeholder: "John Doe", span: 2 },
    age: { label: "Age", type: "number", icon: Users, placeholder: "e.g. 45", span: 1 },
    gender: { label: "Gender", type: "text", icon: Users, placeholder: "Male / Female", span: 1 },
    HR: { label: "Heart Rate (bpm)", type: "number", icon: Heart, placeholder: "60–100 bpm", span: 1 },
    O2Sat: { label: "O₂ Saturation (%)", type: "number", icon: Droplets, placeholder: "95–100 %", span: 1 },
    Temp: { label: "Temperature (°F)", type: "number", icon: Thermometer, placeholder: "97–99 °F", span: 1 },
    SBP: { label: "Systolic BP", type: "number", icon: Activity, placeholder: "90–140 mmHg", span: 1 },
    MAP: { label: "Mean Art. Pressure", type: "number", icon: TrendingUp, placeholder: "70–105 mmHg", span: 1 },
    Resp: { label: "Resp. Rate (/min)", type: "number", icon: Wind, placeholder: "12–20 /min", span: 1 },
};

const PatientNexus = () => {
    const [patients, setPatients] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [search, setSearch] = useState("");
    const [formData, setForm] = useState({
        name: "", age: "", gender: "",
        HR: "", O2Sat: "", Temp: "",
        SBP: "", MAP: "", Resp: "",
    });

    const fetchPatients = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/patients/all");
            setPatients(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitted(false);
        try {
            const payload = {
                name: formData.name,
                age: parseInt(formData.age),
                gender: formData.gender,
                condition: "New Admission",
                hr: parseFloat(formData.HR),
                sbp: parseFloat(formData.SBP),
                dbp: parseFloat(formData.SBP) * 0.66,
                o2: parseFloat(formData.O2Sat),
                temp: parseFloat(formData.Temp),
                respRate: parseFloat(formData.Resp)
            };
            await axios.post("http://localhost:5000/api/patients", payload);
            setSubmitted(true);
            fetchPatients();
            setForm({ name: "", age: "", gender: "", HR: "", O2Sat: "", Temp: "", SBP: "", MAP: "", Resp: "" });
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            alert("Error registering patient: " + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const high = patients.filter(p => p.risk_level === "HIGH").length;
    const med = patients.filter(p => p.risk_level === "MEDIUM").length;
    const low = patients.filter(p => p.risk_level === "LOW").length;

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-8">

            {/* ── PAGE HEADER ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Patient Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time AI-powered risk monitoring & early warning</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800/60 px-4 py-2 rounded-xl shrink-0">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{patients.length} patients tracked</span>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="w-5 h-5 text-cyan-400" />}
                    iconBg="bg-cyan-500/10 border-cyan-500/20"
                    hoverBorder="hover:border-cyan-500/30"
                    glow="from-cyan-500/5"
                    value={patients.length}
                    label="Total Patients"
                />
                <StatCard
                    icon={<ShieldX className="w-5 h-5 text-red-400" />}
                    iconBg="bg-red-500/10 border-red-500/20"
                    hoverBorder="hover:border-red-500/30"
                    glow="from-red-500/5"
                    value={high}
                    label="High Risk"
                    alert={high > 0}
                />
                <StatCard
                    icon={<ShieldAlert className="w-5 h-5 text-amber-400" />}
                    iconBg="bg-amber-500/10 border-amber-500/20"
                    hoverBorder="hover:border-amber-500/30"
                    glow="from-amber-500/5"
                    value={med}
                    label="Medium Risk"
                />
                <StatCard
                    icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
                    iconBg="bg-emerald-500/10 border-emerald-500/20"
                    hoverBorder="hover:border-emerald-500/30"
                    glow="from-emerald-500/5"
                    value={low}
                    label="Low Risk"
                />
            </div>

            {/* ── ADD PATIENT FORM ── */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Register New Patient</h2>
                        <p className="text-xs text-slate-500">Enter vitals for AI risk assessment</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(FIELD_META).map(([key, meta]) => {
                            const Icon = meta.icon;
                            return (
                                <div key={key} className="flex flex-col gap-1.5" style={{ gridColumn: `span ${meta.span}` }}>
                                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                        <Icon className="w-3 h-3 text-slate-600" />
                                        {meta.label}
                                    </label>
                                    <input
                                        type={meta.type}
                                        placeholder={meta.placeholder}
                                        className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 hover:border-slate-600 transition-all"
                                        value={formData[key]}
                                        onChange={(e) => setForm({ ...formData, [key]: e.target.value })}
                                        required
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-5 w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2"
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
                                Added & Analyzed
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

            {/* ── PATIENT LIST ── */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">

                {/* List header */}
                <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
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
                            className="pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 hover:border-slate-600 transition-all w-48"
                        />
                    </div>
                </div>

                {/* Table */}
                {filteredPatients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800/60 bg-slate-950/30">
                                    {["Patient", "Age / Gender", "Heart Rate", "O₂ Sat", "Temp", "Resp Rate", "Risk Score", "Risk Level"].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filteredPatients.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-800/30 transition-colors group">

                                        {/* Name */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 ring-1 ring-slate-600/40">
                                                    {p.name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <span className="font-medium text-white whitespace-nowrap">{p.name}</span>
                                            </div>
                                        </td>

                                        {/* Age / Gender */}
                                        <td className="px-5 py-4 text-slate-400 whitespace-nowrap text-xs">
                                            {p.age} yrs · {p.gender}
                                        </td>

                                        {/* HR */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Heart className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                <span className="text-slate-300 tabular-nums">
                                                    {p.vitals?.hr} <span className="text-slate-600 text-xs">bpm</span>
                                                </span>
                                            </div>
                                        </td>

                                        {/* SpO2 */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                <span className="text-slate-300 tabular-nums">
                                                    {p.vitals?.spo2}<span className="text-slate-600 text-xs">%</span>
                                                </span>
                                            </div>
                                        </td>

                                        {/* Temp */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                                <span className="text-slate-300 tabular-nums">
                                                    {p.vitals?.temp}<span className="text-slate-600 text-xs">°F</span>
                                                </span>
                                            </div>
                                        </td>

                                        {/* Resp */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Wind className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                <span className="text-slate-300 tabular-nums">20</span>
                                            </div>
                                        </td>

                                        {/* Risk score bar */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${p.risk_level === "HIGH" ? "bg-gradient-to-r from-red-600 to-red-400" :
                                                                p.risk_level === "MEDIUM" ? "bg-gradient-to-r from-amber-600 to-amber-400" :
                                                                    "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                                            }`}
                                                        style={{ width: `${Math.min((p.sepsisRisk || 0) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-slate-400 font-mono text-xs tabular-nums">
                                                    {(p.sepsisRisk || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Risk badge */}
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${p.risk_level === "HIGH"
                                                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                                                    : p.risk_level === "MEDIUM"
                                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                }`}>
                                                {p.risk_level === "HIGH" ? <ShieldX className="w-3 h-3" /> :
                                                    p.risk_level === "MEDIUM" ? <ShieldAlert className="w-3 h-3" /> :
                                                        <ShieldCheck className="w-3 h-3" />}
                                                {p.risk_level}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-slate-400 font-medium">No patients found</p>
                        <p className="text-slate-600 text-sm mt-1">
                            {search ? "Try a different search term" : "Add a patient using the form above"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Stat Card ──────────────────────────────────────────────────────────── */
const StatCard = ({ icon, iconBg, hoverBorder, glow, value, label, alert }) => (
    <div className={`relative overflow-hidden bg-slate-900 border border-slate-800/60 rounded-2xl p-5 group transition-all duration-300 ${hoverBorder} hover:shadow-lg`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
                {icon}
            </div>
            {alert
                ? <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold animate-pulse tracking-wide">ALERT</span>
                : <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors" />
            }
        </div>
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
    </div>
);

export default PatientNexus;