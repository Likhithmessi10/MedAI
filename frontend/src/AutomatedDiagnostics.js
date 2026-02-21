import React, { useState } from 'react';
import {
    FileSearch,
    UploadCloud,
    BrainCircuit,
    CheckCircle,
    Stethoscope,
    Microscope,
    FileText,
    AlertTriangle
} from 'lucide-react';

const AutomatedDiagnostics = ({ setView }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleSimulateAnalysis = () => {
        setAnalyzing(true);
        setResult(null);
        // Simulate AI processing delay
        setTimeout(() => {
            setAnalyzing(false);
            setResult({
                patient: "John Doe (ID: 84920)",
                scanType: "Chest X-Ray (AP View)",
                findings: "Ground-glass opacities observed in the lower right lobe. Mild cardiomegaly present. No signs of pleural effusion.",
                confidence: "94.2%",
                recommendation: "Pneumonia likely. Recommend immediate pulmonology consult and ABG test.",
                riskLevel: "High"
            });
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
            <div className="max-w-screen-xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <BrainCircuit className="text-violet-500 w-8 h-8" />
                            Automated AI Diagnostics
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Upload DICOM, Images, or Lab Results for Instant AI Analysis</p>
                    </div>
                    <button
                        onClick={() => setView('dashboard')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                        ← Back to Patient Nexus
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Upload Area */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                            <UploadCloud className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Upload Medical Scan</h3>
                        <p className="text-slate-500 text-sm mb-8 max-w-sm">
                            Drag and drop DICOM files, X-Rays, MRI scans, or Pathology reports to run through the MedAI diagnostic pipeline.
                        </p>
                        <button
                            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
                            onClick={handleSimulateAnalysis}
                            disabled={analyzing}
                        >
                            {analyzing ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Running AI Models...
                                </>
                            ) : (
                                <>
                                    <FileSearch className="w-5 h-5" /> Run Simulated Scan Analysis
                                </>
                            )}
                        </button>
                        <p className="text-xs text-slate-600 mt-4">Supported formats: .dcm, .nii, .jpeg, .pdf</p>
                    </div>

                    {/* Results Area */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
                            <FileText className="text-violet-400" /> Generated Diagnostic Report
                        </h3>

                        {!result && !analyzing && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                                <Microscope className="w-12 h-12 opacity-20" />
                                <p>Upload a file to view AI diagnostic insights</p>
                            </div>
                        )}

                        {analyzing && (
                            <div className="flex flex-col items-center justify-center h-64 text-violet-400 gap-4">
                                <BrainCircuit className="w-12 h-12 animate-pulse" />
                                <p className="animate-pulse font-medium">Connecting to MedAI Model Engine...</p>
                            </div>
                        )}

                        {result && !analyzing && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Patient</p>
                                        <p className="font-semibold text-white">{result.patient}</p>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Scan Type</p>
                                        <p className="font-semibold text-white">{result.scanType}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                                        <Stethoscope className="w-4 h-4 text-emerald-400" /> Key Findings
                                    </h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">{result.findings}</p>
                                </div>

                                <div className="flex items-center justify-between p-5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                                    <div>
                                        <h4 className="text-sm font-bold text-violet-300 mb-1">AI Confidence Score</h4>
                                        <p className="text-2xl font-black text-violet-400">{result.confidence}</p>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-sm font-bold text-slate-400 mb-1">Risk Assessment</h4>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-red-500/10 border-red-500/30 text-red-400">
                                            <AlertTriangle className="w-3 h-3" /> {result.riskLevel} Priority
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                                    <p className="text-sm font-semibold text-rose-400 mb-1">Clinical Recommendation</p>
                                    <p className="text-sm text-slate-300">{result.recommendation}</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
                                        Request Human Review
                                    </button>
                                    <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Approve & Attach to EMR
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AutomatedDiagnostics;
