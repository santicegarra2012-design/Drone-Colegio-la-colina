import React, { useState } from 'react';
import { Award, Users, GraduationCap, X, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo.tsx';

interface StudentBadgeProps {
  variant?: 'compact' | 'full' | 'banner';
}

export const StudentBadge: React.FC<StudentBadgeProps> = ({ variant = 'compact' }) => {
  const [showModal, setShowModal] = useState(false);

  const team = [
    {
      name: 'Santiago Cegarra',
      role: 'Project Lead & Autonomous Systems',
      focus: 'Path planning, mission choreography, telemetry architecture',
    },
    {
      name: 'Samuel Velasco',
      role: 'Robotics & Hardware Integration',
      focus: 'Multi-axis robotic arm kinematics, payload gripper, mechanical specs',
    },
    {
      name: 'Jeronimo Escobar',
      role: 'AI Systems & Telecommunications',
      focus: 'LiDAR vital sign filtering, radar life-sign scanning, network topology',
    },
  ];

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-slate-700/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <SchoolLogo size="sm" />
          <div className="h-4 w-px bg-slate-700"></div>
          <span className="text-slate-400 font-medium hidden sm:inline">Engineering Prototype by:</span>
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <span className="text-cyan-400">Santiago Cegarra</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">Samuel Velasco</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-400">Jeronimo Escobar</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors"
        >
          <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
          <span>School Project Info</span>
        </button>

        {showModal && <TeamModal onClose={() => setShowModal(false)} team={team} />}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-emerald-500/60 transition-all text-left shadow-sm hover:shadow-emerald-950/20"
        title="View Engineering Team Details"
      >
        <div className="relative">
          <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <div className="flex flex-col text-[11px] leading-tight">
          <span className="text-slate-400 font-normal">Colegio Campestre La Colina</span>
          <span className="text-slate-200 font-semibold group-hover:text-emerald-300">
            Santiago • Samuel • Jeronimo
          </span>
        </div>
      </button>

      {showModal && <TeamModal onClose={() => setShowModal(false)} team={team} />}
    </>
  );
};

interface TeamModalProps {
  onClose: () => void;
  team: Array<{ name: string; role: string; focus: string }>;
}

const TeamModal: React.FC<TeamModalProps> = ({ onClose, team }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Logo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <SchoolLogo size="lg" />
          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> 8th Grade Engineering & Robotics
            </span>
            <p className="text-xs text-slate-400 mt-1">Class of 2026 • 8° Octavo Grado</p>
          </div>
        </div>

        {/* Project Description */}
        <div className="my-6">
          <h3 className="text-lg font-bold text-white font-heading tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            8th Grade Student Engineering Team
          </h3>
          <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
            Conceived and built by 8th-grade students at <strong>Colegio Campestre La Colina</strong> in Medellín, Colombia to demonstrate how autonomous drones, multispectral satellite triggers, and UWB bio-radar eliminate mountain road delays for critical medical emergencies.
          </p>
        </div>

        {/* Student Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {team.map((student, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-emerald-400 mb-2.5 font-bold text-sm">
                  0{idx + 1}
                </div>
                <h4 className="text-sm font-bold text-white font-heading">{student.name}</h4>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">{student.role}</p>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{student.focus}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500">
                <span>Colegio La Colina</span>
                <span className="text-cyan-400 font-mono">ENG-2026</span>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer badge */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Simulated Prototype • Prepared for Teacher & Jury Presentation</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition-colors"
          >
            Enter Platform
          </button>
        </div>
      </div>
    </div>
  );
};
