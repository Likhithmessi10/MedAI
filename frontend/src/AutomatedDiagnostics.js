import React, { useState, useRef } from 'react';
import {
    UploadCloud,
    BrainCircuit,
    CheckCircle,
    Stethoscope,
    Microscope,
    FileText,
    AlertTriangle,
    X
} from 'lucide-react';

const AutomatedDiagnostics = ({ setView }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setResult(null); // Reset result on new file
            setError(null);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null); // Reset result on new file
            setError(null);
        }
    };

    const clearFile = () => {
        setFile(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSimulateAnalysis = async () => {
        if (!file) return;

        setAnalyzing(true);
        setResult(null);
        setError(null);

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await fetch('http://localhost:5000/api/diagnostics/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message || 'Error connecting to the analysis engine.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAction = (message) => {
        setToast(message);
        setTimeout(() => {
            setToast(null);
            clearFile(); // Reset the UI after an action
        }, 3000);
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

                {toast && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full font-medium shadow-xl shadow-emerald-500/20 z-50 flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
                        <CheckCircle className="w-5 h-5" />
                        {toast}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Upload Area */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                        {!file ? (
                            <div
                                className="w-full flex-1 border-2 border-dashed border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/5 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer group p-6"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 bg-slate-800 group-hover:bg-violet-500/20 rounded-full flex items-center justify-center mb-6 border border-slate-700 transition-colors">
                                    <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-violet-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Upload Medical Scan</h3>
                                <p className="text-slate-500 text-sm mb-4 max-w-sm">
                                    Click to upload or drag and drop X-Rays, MRI scans, or Pathology reports to run through the MedAI diagnostic pipeline.
                                </p>
                                <p className="text-xs text-slate-600">Supported formats: .jpg, .jpeg, .png, .pdf (Max. 10MB)</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                />
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center flex-1 justify-center relative">
                                <button
                                    onClick={clearFile}
                                    className="absolute top-0 right-0 p-2 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                {file.type.startsWith('image/') ? (
                                    <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-slate-700/50 mb-4 bg-slate-950 flex shadow-xl">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Scanned Upload"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <FileText className="w-16 h-16 text-violet-400 mb-4" />
                                )}

                                <p className="text-lg font-bold text-white mb-1 truncate px-4 w-full">
                                    {file.name}
                                </p>
                                <p className="text-slate-500 mb-6 text-sm">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                {error && (
                                    <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3 text-left w-full max-w-md">
                                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                <button
                                    className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                                    onClick={handleSimulateAnalysis}
                                    disabled={analyzing}
                                >
                                    {analyzing ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Running Advanced AI Models...
                                        </>
                                    ) : (
                                        <>
                                            <BrainCircuit className="w-5 h-5" /> Run Local Llama Analysis
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
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
                                <p className="animate-pulse font-medium text-center">
                                    Connecting to Local Llama 3.2 Engine...<br />
                                    <span className="text-sm font-normal text-slate-400">Processing locally (may take 10-20 seconds on CPU/GPU)</span>
                                </p>
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
                                    <button
                                        onClick={() => handleAction("Diagnostic Report flagged for Senior Review")}
                                        className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                                    >
                                        Request Human Review
                                    </button>
                                    <button
                                        onClick={() => handleAction("Report successfully attached to Patient EMR")}
                                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                                    >
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
