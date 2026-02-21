import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  Thermometer,
  Droplets,
  Heart,
  User,
  Clock,
  ShieldAlert,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';

const DigitalTwinICU = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api/patients';

  const fetchData = async () => {
    try {
      const { data } = await axios.get(API_BASE_URL);
      setPatients(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Twin Sync Lost - Check Backend Server");
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
      <p className="text-cyan-400 text-sm font-mono tracking-[0.2em] uppercase animate-pulse">
        Initializing Digital Twin Streams...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10">

      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-800/60 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-4 h-4 text-white stroke-[2.5px]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              MEDAI <span className="text-cyan-400">CORE</span>
            </h1>
          </div>
          <p className="text-slate-500 font-mono text-[11px] uppercase tracking-[0.2em] ml-12">
            Digital Twin ICU Management System
          </p>
        </div>

        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${error
            ? 'bg-red-950/40 border-red-500/20'
            : 'bg-emerald-950/40 border-emerald-500/20'
          }`}>
          {error
            ? <WifiOff className="w-4 h-4 text-red-400" />
            : <Wifi className="w-4 h-4 text-emerald-400" />
          }
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest leading-none mb-0.5">System Status</p>
            <p className={`text-xs font-mono font-bold ${error ? 'text-red-400' : 'text-emerald-400'}`}>
              {error ? 'CONNECTION ERROR' : 'LIVE SYNC ACTIVE'}
            </p>
          </div>
          <div className={`w-2 h-2 rounded-full ml-1 ${error ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
        </div>
      </header>

      {/* Patients Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
        {patients.map((patient) => (
          <PatientTwinCard key={patient._id} patient={patient} />
        ))}
      </main>
    </div>
  );
};

const PatientTwinCard = ({ patient }) => {
  const riskPercent = (patient.sepsisRisk * 100).toFixed(1);
  const isCritical = patient.sepsisRisk > 0.7;
  const isWarning = patient.sepsisRisk > 0.3 && patient.sepsisRisk <= 0.7;

  return (
    <div className={`group relative bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${isCritical
        ? 'border-red-500/30 hover:border-red-500/50 hover:shadow-red-950/50'
        : isWarning
          ? 'border-yellow-500/30 hover:border-yellow-500/50 hover:shadow-yellow-950/50'
          : 'border-slate-800/60 hover:border-blue-500/30 hover:shadow-blue-950/40'
      }`}>

      {/* Colored left accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-[3px] ${isCritical ? 'bg-gradient-to-b from-red-500 to-red-800'
          : isWarning ? 'bg-gradient-to-b from-yellow-400 to-yellow-700'
            : 'bg-gradient-to-b from-blue-500 to-blue-800'
        }`} />

      <div className="p-6 pl-7">

        {/* Patient header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <div className={`p-2.5 rounded-xl shrink-0 ${isCritical ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
              }`}>
              <User size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight tracking-tight">{patient.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                  AGE {patient.age}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock size={11} /> ADM: 4H AGO
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 ml-4">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-wide uppercase ${isCritical
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : isWarning
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
              {isCritical && <ShieldAlert size={12} />}
              {isCritical ? 'High Risk' : isWarning ? 'Warning' : 'Stable'}
            </div>
            <p className="text-[10px] text-slate-600 font-mono mt-1.5 italic">{patient.condition}</p>
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <VitalBox
            label="Heart Rate"
            value={patient.vitals?.hr}
            unit="BPM"
            icon={<Heart size={14} className="text-red-400" />}
            isAlert={patient.vitals?.hr > 100 || patient.vitals?.hr < 60}
          />
          <VitalBox
            label="Blood Pressure"
            value={`${patient.vitals?.sbp}/${patient.vitals?.dbp}`}
            unit="mmHg"
            icon={<Activity size={14} className="text-blue-400" />}
            isAlert={patient.vitals?.sbp < 90}
          />
          <VitalBox
            label="SpO2"
            value={patient.vitals?.spo2}
            unit="%"
            icon={<Droplets size={14} className="text-cyan-400" />}
            isAlert={patient.vitals?.spo2 < 90}
          />
          <VitalBox
            label="Temp"
            value={patient.vitals?.temp}
            unit="°C"
            icon={<Thermometer size={14} className="text-orange-400" />}
            isAlert={patient.vitals?.temp > 38}
          />
        </div>

        {/* AI Risk Analysis */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/60">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 tracking-[0.15em] uppercase">AI Digital Twin Analysis</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Sepsis probability score</p>
            </div>
            <div className="text-right">
              <span className={`font-mono text-2xl font-black leading-none ${isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                {riskPercent}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isCritical
                  ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  : isWarning
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                    : 'bg-gradient-to-r from-blue-600 to-blue-400'
                }`}
              style={{ width: `${riskPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-slate-700 font-mono mb-3">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-semibold text-slate-400 hover:text-blue-400 hover:bg-blue-500/5 rounded-lg transition-all duration-150 border border-transparent hover:border-blue-500/20 group/btn tracking-wider uppercase">
            View Full Clinical Twin Data
            <ChevronRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

const VitalBox = ({ label, value, unit, icon, isAlert }) => (
  <div className={`p-3 rounded-xl border transition-colors ${isAlert
      ? 'bg-red-500/5 border-red-500/20'
      : 'bg-slate-800/30 border-slate-800/60 hover:border-slate-700/60'
    }`}>
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider leading-none">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-base font-mono font-bold leading-none ${isAlert ? 'text-red-400 animate-pulse' : 'text-slate-100'
        }`}>
        {value || '--'}
      </span>
      <span className="text-[10px] text-slate-600 font-medium">{unit}</span>
    </div>
  </div>
);

export default DigitalTwinICU;