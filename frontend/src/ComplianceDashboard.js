import React, { useState } from 'react';
import {
    Building2,
    CheckCircle2,
    AlertTriangle,
    Clock,
    ShieldCheck,
    Users,
    FileCheck,
    TrendingDown
} from 'lucide-react';

const ComplianceDashboard = ({ setView }) => {
    const [metrics] = useState([
        {
            id: 1,
            title: "Hand Hygiene Compliance",
            value: "92%",
            target: "95%",
            status: "warning",
            trend: "+2% from last week",
            icon: <Users className="text-amber-500" />
        },
        {
            id: 2,
            title: "Equipment Calibration",
            value: "98%",
            target: "100%",
            status: "good",
            trend: "All severe items calibrated",
            icon: <FileCheck className="text-emerald-500" />
        },
        {
            id: 3,
            title: "Incident Reporting Time",
            value: "1.2 hrs",
            target: "< 2 hrs",
            status: "good",
            trend: "Faster by 30 mins",
            icon: <Clock className="text-emerald-500" />
        },
        {
            id: 4,
            title: "Staff Certification",
            value: "85%",
            target: "100%",
            status: "critical",
            trend: "15 nurses pending renewal",
            icon: <AlertTriangle className="text-red-500" />
        }
    ]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
            <div className="max-w-screen-xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <ShieldCheck className="text-emerald-500 w-8 h-8" />
                            Hospital Compliance Monitor
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Real-time accreditation & safety tracking</p>
                    </div>
                    <button
                        onClick={() => setView('dashboard')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                        ← Back to Patient Nexus
                    </button>
                </div>

                {/* Global Status */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-emerald-400">NABH/JCI Readiness: 91%</h2>
                        <p className="text-slate-400 text-sm mt-1">Audit ready. 3 areas require attention before Q3 inspection.</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((m) => (
                        <div key={m.id} className={`p-5 rounded-xl border bg-slate-900 border-slate-800`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    {m.icon}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full border ${m.status === 'good' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                        m.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                            'bg-red-500/10 border-red-500/30 text-red-400'
                                    }`}>
                                    {m.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">{m.title}</p>
                            <p className="text-3xl font-bold mt-1 text-white">{m.value}</p>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/50">
                                <span className="text-xs text-slate-500">Target: {m.target}</span>
                                <span className="text-xs text-slate-400 ml-auto">{m.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logs */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50">
                        <h3 className="font-semibold text-white">Recent Compliance Logs</h3>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {[
                            { time: "10 mins ago", event: "Automated HVAC Particle Count Test Passed", dept: "Facility", type: "success" },
                            { time: "2 hrs ago", event: "MRI Machine #2 Missed daily auto-calibration", dept: "Radiology", type: "error" },
                            { time: "5 hrs ago", event: "Nurse Shift Handover Documentation Complete (100%)", dept: "ICU Ward 3", type: "success" },
                        ].map((log, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <span className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="text-slate-300">{log.event}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-500">
                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs">{log.dept}</span>
                                    <span className="w-24 text-right">{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ComplianceDashboard;
