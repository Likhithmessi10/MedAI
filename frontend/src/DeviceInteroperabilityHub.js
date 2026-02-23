import React, { useState, useEffect } from 'react';
import {
    Server,
    Activity,
    Wifi,
    WifiOff,
    Database,
    RefreshCcw,
    Zap,
    Radio,
    AlertTriangle
} from 'lucide-react';

const DeviceInteroperabilityHub = ({ setView }) => {
    const [devices, setDevices] = useState([
        { id: "MRI-01", type: "Imaging", location: "Radiology Wing A", status: "online", latency: "12ms", dataRate: "450 MB/s", baseRate: 450 },
        { id: "VENT-04", type: "Life Support", location: "ICU Bed 4", status: "online", latency: "5ms", dataRate: "1.2 MB/s", baseRate: 1.2 },
        { id: "VENT-08", type: "Life Support", location: "ICU Bed 8", status: "offline", latency: "-", dataRate: "-", baseRate: 0 },
        { id: "ECG-12", type: "Monitoring", location: "Cardiology", status: "online", latency: "18ms", dataRate: "5.5 MB/s", baseRate: 5.5 },
        { id: "PUMP-22", type: "Infusion", location: "Ward 3", status: "warning", latency: "150ms", dataRate: "0.1 MB/s", baseRate: 0.1 },
        { id: "CTX-01", type: "Imaging", location: "ER", status: "online", latency: "22ms", dataRate: "320 MB/s", baseRate: 320 }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDevices(prev => prev.map(dev => {
                if (dev.status === "offline") return dev;

                // Random latency fluctuation
                const baseLatency = dev.status === "warning" ? 100 : 10;
                const newLatency = Math.floor(baseLatency + Math.random() * 20) + "ms";

                // Random data rate fluctuation
                const rateMutation = dev.baseRate * (1 + (Math.random() * 0.1 - 0.05));
                const newRate = rateMutation.toFixed(1) + " MB/s";

                // 2% chance to briefly throw a warning status
                let newStatus = dev.status;
                if (dev.status === "online" && Math.random() > 0.98) newStatus = "warning";
                else if (dev.status === "warning" && Math.random() > 0.7) newStatus = "online";

                return { ...dev, latency: newLatency, dataRate: newRate, status: newStatus };
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
            <div className="max-w-screen-xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Server className="text-blue-500 w-8 h-8" />
                            Device Interoperability Hub
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Hospital IT Data Ingestion & Sync Status</p>
                    </div>
                    <button
                        onClick={() => setView('dashboard')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                        ← Back to Patient Nexus
                    </button>
                </div>

                {/* Network Topology Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Radio className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Connected Devices</p>
                            <p className="text-2xl font-bold text-white">1,402</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Network Health</p>
                            <p className="text-2xl font-bold text-emerald-400">99.8% Uptime</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-violet-500/10 rounded-xl">
                            <Database className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Data Ingestion Rate</p>
                            <p className="text-2xl font-bold text-white">4.2 GB/s</p>
                        </div>
                    </div>
                </div>

                {/* Device Grid */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" /> Active Nodes
                        </h2>
                        <button className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-colors">
                            <RefreshCcw className="w-3 h-3" /> Resync All
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900/50 text-slate-500 uppercase text-xs border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium tracking-wider">Device ID</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Type</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Location</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Latency</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Data Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {devices.map((dev) => (
                                    <tr key={dev.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{dev.id}</td>
                                        <td className="px-6 py-4 text-slate-400">{dev.type}</td>
                                        <td className="px-6 py-4 text-slate-400">{dev.location}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${dev.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                dev.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                    'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}>
                                                {dev.status === 'online' ? <Wifi className="w-3 h-3" /> : (dev.status === 'offline' ? <WifiOff className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />)}
                                                {dev.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-300">{dev.latency}</td>
                                        <td className="px-6 py-4 font-mono text-slate-300">{dev.dataRate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DeviceInteroperabilityHub;
