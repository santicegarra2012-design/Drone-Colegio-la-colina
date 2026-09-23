import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Cpu, 
  HeartPulse, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  Layers, 
  Award,
  BookOpen,
  MapPin,
  Compass,
  Zap,
  Target,
  Clock,
  Lightbulb,
  Building,
  Flag
} from 'lucide-react';
import { SchoolLogo } from '../components/SchoolLogo.tsx';

export const AboutProjectView: React.FC = () => {
  const teamMembers = [
    {
      name: 'Santiago Cegarra',
      grade: '8th Grade Student • Grado 8°',
      role: 'Team Lead • Autonomous Flight Navigation & AI Perception Systems',
      bio: 'Leads flight trajectory mathematics, 3D simulation architecture, and real-time obstacle avoidance algorithms. Passionate about aeronautics, software architecture, and solving mountain transit bottlenecks in Medellín.',
      focus: 'Autonomous path planning, RTK-GPS differential positioning, Three.js WebGL simulation engines, and orbital satellite crash anomaly classification.',
      badge: 'Team Lead & Flight Systems',
      avatarColor: 'from-cyan-500 to-blue-600',
    },
    {
      name: 'Samuel Velasco',
      grade: '8th Grade Student • Grado 8°',
      role: 'Hardware Lead • Robotic Manipulator & Mechanical Payload Integration',
      bio: 'Designs the drone payload drop bays, carbon-fiber structural tolerances, and articulated robotic arm kinematics. Focuses on mechanical precision, gear ratios, and servo durability in high-wind conditions.',
      focus: 'Articulated 4-axis robotic arm kinematics, active end-effector gripper design, medical trauma airdrop mechanisms, and structural airframe CAD modelling.',
      badge: 'Robotics & Mechanical Lead',
      avatarColor: 'from-emerald-500 to-teal-600',
    },
    {
      name: 'Jerónimo Escobar',
      grade: '8th Grade Student • Grado 8°',
      role: 'Systems Lead • Through-Debris Bio-Radar & Emergency Communications',
      bio: 'Engineers the sensor fusion stack, victim detection vital sign processing, and encrypted mesh radio links. Passionate about medical technology, life-saving bio-telemetry, and hospital integration.',
      focus: 'Ultra-Wideband (UWB) micro-motion radar vital sensing, victim triage classification algorithms, thermal infrared signatures, and hospital telemetry data pipelines.',
      badge: 'Bio-Telemetry & Sensors Lead',
      avatarColor: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-8 text-left animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Hero School & Student Badge Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <SchoolLogo size="lg" className="shrink-0 p-2 bg-slate-950/90 rounded-2xl border border-emerald-500/40 shadow-2xl" />

          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>COLEGIO CAMPESTRE LA COLINA</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                8TH GRADE STEM RESEARCH & ROBOTICS 2026
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Medellín, Colombia
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white font-heading tracking-wide">
              Rescue AI — Emergency Drone Network
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
              An engineering prototype and digital emergency twin conceived, researched, and programmed by <strong>8th-grade students</strong> at <strong>Colegio Campestre La Colina</strong> in Medellín, Colombia. Our system reduces emergency medical response times from 30–45 minutes down to 3 minutes across rugged Andean topography.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                Calle 12 Sur # 18 - 173, Loma Los Balsos, El Poblado
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                <Flag className="w-3.5 h-3.5" />
                Team Medellín, Antioquia
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the 8th Grade Student Engineering Team */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-heading">
              The 8th Grade Student Engineering Team
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
            CLASS OF 2026 • 8° OCTAVO GRADO
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 shadow-xl space-y-4 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.avatarColor} border border-white/20 flex items-center justify-center font-heading font-black text-white text-xl shadow-lg group-hover:scale-105 transition-transform`}>
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {member.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-heading group-hover:text-cyan-300 transition-colors">
                    {member.name}
                  </h3>
                  <span className="text-xs text-amber-400 font-bold block mt-0.5">
                    {member.grade}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium block mt-1 leading-snug">
                    {member.role}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">
                  Primary Technical Focus:
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {member.focus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our 8th Grade Story & Why We Built This */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white font-heading">
            Our 8th Grade Story: How Rescue AI Was Born
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <h4 className="text-white font-bold font-heading flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Living on Loma Los Balsos & Mountain Corridors</span>
            </h4>
            <p>
              Every morning on our way to <strong>Colegio Campestre La Colina</strong> along <strong>Calle 12 Sur and Loma Los Balsos</strong>, we witnessed severe traffic congestion. In the Aburrá Valley, our geography is surrounded by dramatic Andean mountains and narrow winding corridors like <strong>Vía Las Palmas</strong> and <strong>Santa Elena</strong>.
            </p>
            <p>
              Whenever an accident occurs, ground ambulances are trapped in gridlock. We researched emergency response statistics in Medellín and learned that ambulances often take <strong>30 to 45 minutes</strong> to reach victims. For critical trauma or cardiac arrest, survival probability drops by <strong>7% to 10% each minute</strong> without first aid or defibrillation.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold font-heading flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Turning Classroom STEM into Life-Saving Action</span>
            </h4>
            <p>
              As 8th graders with a passion for robotics, programming, and aerospace engineering, we asked ourselves: <em>"Why do doctors and medical supplies have to stay on congested roads when the sky is completely clear?"</em>
            </p>
            <p>
              We combined our different strengths—Santiago on autonomous navigation and Three.js 3D simulation, Samuel on robotics and mechanical payload delivery, and Jerónimo on radar vitals and communications—to build a unified emergency network prototype. We designed <strong>Rescue AI</strong> to fly straight over the mountains and arrive on-scene in <strong>under 3 minutes</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* The Problem vs Solution Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Problem */}
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-red-300 font-heading flex items-center gap-2">
              <span>Current Reality: Mountain Transit Gridlock</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              30–45 MIN DELAY
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            In urban sectors like Loma Los Balsos, El Poblado, Envigado, and Vía Las Palmas, steep geography and congestion delay traditional ground ambulances. Medical personnel arrive after the critical "Golden Hour," resulting in preventable mortality for trauma, blood loss, and cardiac distress.
          </p>
          <ul className="text-xs text-red-300/80 space-y-1 pt-2 font-mono">
            <li>• Average ambulance dispatch time: 32 minutes</li>
            <li>• Survival chance loss: ~7–10% per minute</li>
            <li>• No real-time victim vitals before arrival</li>
          </ul>
        </div>

        {/* The Solution */}
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-emerald-300 font-heading flex items-center gap-2">
              <span>The Rescue AI Solution</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              &lt; 3 MIN ARRIVAL
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Autonomous drones cruise at 80 km/h along dedicated airspace corridors, bypassing 100% of terrain congestion. Using multispectral satellite triggers, onboard UWB radar, and robotic payload drops, the drone delivers defibrillators, blood tourniquets, and medical guidance in under 3 minutes.
          </p>
          <ul className="text-xs text-emerald-300/90 space-y-1 pt-2 font-mono">
            <li>• Response time: 2.8 minutes (-91% reduction)</li>
            <li>• Projected survival rate increase: +350%</li>
            <li>• Live bio-radar telemetry streaming to ICU doctors</li>
          </ul>
        </div>
      </div>

      {/* Technical Milestones Achieved by 8th Graders */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Key Technical Milestones Achieved by the 8th Grade Team
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full 3D Campus Twin</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Modeled Colegio Campestre La Colina with precision classroom blocks, Science Wing rooftop vertiport, soccer field, and street gates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Physics Flight Engine</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Programmed full Three.js flight mechanics with roll, pitch, yaw, wind turbulence, battery decay, and automated parachute physics.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Procedural Audio</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Synthesized realistic drone motors, Doppler pitch shifts, radar pings, and robotic servos natively using Web Audio API without audio files.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>UWB Radar Simulation</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Implemented simulated through-debris micro-motion vital sensing to detect chest wall displacements of trapped accident victims.
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Support & Academic Acknowledgments */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-mono uppercase text-emerald-400 font-bold">Academic Institution & Mentorship</span>
          <h4 className="text-lg font-bold text-white font-heading">Colegio Campestre La Colina — Medellín</h4>
          <p className="text-xs text-slate-400 max-w-xl">
            We extend our deepest gratitude to our science teachers, robotics instructors, family members, and the administrative leadership of Colegio Campestre La Colina for encouraging student innovation, critical engineering inquiry, and human-centered design.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-center px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-mono text-cyan-400 font-bold">GRADE LEVEL</div>
            <div className="text-base font-bold text-white">8° Octavo</div>
          </div>
          <div className="text-center px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-mono text-emerald-400 font-bold">LOCATION</div>
            <div className="text-base font-bold text-white">Medellín</div>
          </div>
        </div>
      </div>
    </div>
  );
};
