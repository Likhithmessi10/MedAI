import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function ICUDashboard({ setView }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    socket.on("icuUpdate", (data) => {
      setPatients((prev) => {
        const others = prev.filter(p => p._id !== data._id);
        return [...others, data];
      });
    });

    return () => socket.off("icuUpdate");
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-red-500">
          LIVE ICU MONITOR
        </h1>

        <button
          onClick={() => setView("main")}
          className="px-4 py-2 bg-gray-700 rounded"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {patients.map(p => (
          <div
            key={p._id}
            className={`p-5 rounded-xl shadow-lg ${
              p.risk_level === "HIGH"
                ? "bg-red-900 animate-pulse"
                : p.risk_level === "MEDIUM"
                ? "bg-yellow-700"
                : "bg-green-800"
            }`}
          >
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p>Age: {p.age}</p>

            <div className="mt-3 space-y-1">
              <p>❤️ HR: {p.vitals.HR}</p>
              <p>🫁 O2: {p.vitals.O2Sat}</p>
              <p>🌡 Temp: {p.vitals.Temp.toFixed(1)}</p>
              <p>💨 Resp: {p.vitals.Resp}</p>
            </div>

            <div className="mt-4 text-lg font-bold">
              Risk: {p.risk_level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ICUDashboard;