import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Terminal, 
  RotateCcw, 
  ShieldCheck, 
  Zap,
  HelpCircle
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

export const TestingLabView: React.FC = () => {
  const { diagnosticTests, runSingleTest, runAllTests, showAiExplanation } = useRescue();
  const [selectedTestId, setSelectedTestId] = useState<string>(diagnosticTests[0].id);

  const selectedTest = diagnosticTests.find((t) => t.id === selectedTestId) || diagnosticTests[0];

  const passCount = diagnosticTests.filter((t) => t.status === 'PASS').length;

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ENGINEERING VALIDATION
            </span>
            <span className="text-xs text-slate-400 font-mono">LAB QA AUTOMATION</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Autonomous Drone Testing Laboratory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rigorous automated hardware-in-the-loop and software verification suite for flight safety certification.
          </p>
        </div>

        {/* Run All Tests Action */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            Passed: <strong className="text-emerald-400">{passCount} / {diagnosticTests.length}</strong>
          </div>
          <button
            onClick={runAllTests}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs font-heading shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>RUN ALL SUBSYSTEM TESTS</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Test Suite Table + Live Diagnostic Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Test List Table */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              Automated Test Matrix ({diagnosticTests.length} Tests)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">COLEGIO LA COLINA TEST HARNESS</span>
          </div>

          <div className="space-y-2">
            {diagnosticTests.map((t) => {
              const isSelected = selectedTestId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    sound.playBeep(980, 0.05);
                    setSelectedTestId(t.id);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-bold">
                        {t.subsystem}
                      </span>
                      <span className="text-xs font-bold text-white font-heading">{t.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        t.status === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : t.status === 'RUNNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runSingleTest(t.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 text-slate-300 transition-colors"
                      title="Run this test individually"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Diagnostic Logs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>TERMINAL LOG: {selectedTest.id}</span>
              </div>
              <button
                onClick={() => runSingleTest(selectedTest.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold"
              >
                Execute Test
              </button>
            </div>

            {/* Terminal Screen */}
            <div className="bg-black/90 p-4 rounded-xl border border-slate-800/80 text-[11px] leading-relaxed text-slate-300 min-h-[260px] space-y-1.5 overflow-y-auto">
              <div className="text-cyan-400 font-bold">$ qa-runner --subsystem {selectedTest.subsystem} --id {selectedTest.id}</div>
              <div className="text-slate-500">[INFO] Target test: {selectedTest.name}</div>
              <div className="text-slate-500">[INFO] Harness: FlightController-HIL v2.4</div>
              
              {selectedTest.status === 'RUNNING' && (
                <div className="text-amber-400 animate-pulse mt-2">
                  &gt; Probing hardware registers... waiting for ACK...
                </div>
              )}

              {selectedTest.lastRunLogs.map((log, idx) => (
                <div key={idx} className={log.includes('PASS') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  &gt; {log}
                </div>
              ))}

              {selectedTest.status === 'IDLE' && selectedTest.lastRunLogs.length === 0 && (
                <div className="text-slate-600 mt-4 italic">
                  No diagnostic run in current session. Click "Execute Test" above to verify nominal behavior.
                </div>
              )}
            </div>

            {/* Test Summary Pill */}
            <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
              <span>Status: <strong className="text-white">{selectedTest.status}</strong></span>
              <span>Subsystem: <strong className="text-cyan-400">{selectedTest.subsystem}</strong></span>
            </div>

            {/* Why Explain */}
            <button
              onClick={() =>
                showAiExplanation(
                  'Automated Subsystem Verification',
                  'Engineered by Santiago, Samuel, and Jeronimo for Colegio Campestre La Colina. Autonomous emergency rescue systems require strict fail-safe certification. Every sensor (LiDAR, UWB radar, RTK-GPS) and actuator (propeller motors, manipulator arm) undergoes automated verification before launch clearance.'
                )
              }
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Why rigorous lab testing?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
