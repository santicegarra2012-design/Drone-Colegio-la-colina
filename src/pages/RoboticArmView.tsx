import React, { useEffect, useRef } from 'react';
import { 
  Cpu, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Package, 
  Wrench, 
  AlertCircle, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

export const RoboticArmView: React.FC = () => {
  const { 
    armState, 
    setArmAngle, 
    toggleGripper, 
    executeArmTask, 
    resetArm,
    showAiExplanation 
  } = useRescue();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2D Arm Kinematics Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Base mount on top or bottom
      const baseX = w / 2;
      const baseY = 80; // Drone belly mounting plate

      // Drone Chassis base plate
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(baseX - 80, baseY - 30, 160, 30);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(baseX - 40, baseY - 5, 80, 6);

      // Label Drone Mount
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('DRONE CHASSIS MOUNT', baseX - 60, baseY - 12);

      // Kinematics Link Lengths
      const l1 = 120; // Upper arm
      const l2 = 100; // Forearm
      const l3 = 45;  // Wrist

      // Angles in radians
      // Shoulder (from downward vertical)
      const a1 = ((armState.shoulderAngle - 90) * Math.PI) / 180;
      const j1X = baseX;
      const j1Y = baseY;

      // Elbow joint
      const j2X = j1X + Math.cos(a1) * l1;
      const j2Y = j1Y + Math.sin(a1) * l1;

      // Wrist joint
      const a2 = a1 + ((armState.elbowAngle - 90) * Math.PI) / 180;
      const j3X = j2X + Math.cos(a2) * l2;
      const j3Y = j2Y + Math.sin(a2) * l2;

      // End Effector tip
      const a3 = a2 + ((armState.wristAngle - 90) * Math.PI) / 180;
      const endX = j3X + Math.cos(a3) * l3;
      const endY = j3Y + Math.sin(a3) * l3;

      // 1. Draw Link 1 (Shoulder to Elbow)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(j1X, j1Y);
      ctx.lineTo(j2X, j2Y);
      ctx.stroke();

      // Inner carbon accent
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(j1X, j1Y);
      ctx.lineTo(j2X, j2Y);
      ctx.stroke();

      // 2. Draw Link 2 (Elbow to Wrist)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(j2X, j2Y);
      ctx.lineTo(j3X, j3Y);
      ctx.stroke();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(j2X, j2Y);
      ctx.lineTo(j3X, j3Y);
      ctx.stroke();

      // 3. Draw Link 3 (Wrist)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(j3X, j3Y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // 4. Joints (Circles)
      [
        { x: j1X, y: j1Y, label: 'SHOULDER' },
        { x: j2X, y: j2Y, label: 'ELBOW' },
        { x: j3X, y: j3Y, label: 'WRIST' },
      ].forEach((j) => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(j.x, j.y, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Gripper Fingers
      const pinchGap = armState.gripperState === 'OPEN' ? 24 : 6;
      const fingerLen = 22;

      const normX = -Math.sin(a3);
      const normY = Math.cos(a3);

      const f1StartX = endX + normX * pinchGap;
      const f1StartY = endY + normY * pinchGap;
      const f1EndX = f1StartX + Math.cos(a3) * fingerLen;
      const f1EndY = f1StartY + Math.sin(a3) * fingerLen;

      const f2StartX = endX - normX * pinchGap;
      const f2StartY = endY - normY * pinchGap;
      const f2EndX = f2StartX + Math.cos(a3) * fingerLen;
      const f2EndY = f2StartY + Math.sin(a3) * fingerLen;

      ctx.strokeStyle = armState.gripperState === 'OPEN' ? '#38bdf8' : '#10b981';
      ctx.lineWidth = 5;

      // Finger 1
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(f1StartX, f1StartY);
      ctx.lineTo(f1EndX, f1EndY);
      ctx.stroke();

      // Finger 2
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(f2StartX, f2StartY);
      ctx.lineTo(f2EndX, f2EndY);
      ctx.stroke();

      // 6. Carried Item (if grabbed)
      if (armState.carriedItem) {
        ctx.save();
        ctx.translate(endX + Math.cos(a3) * 16, endY + Math.sin(a3) * 16);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-18, -14, 36, 28);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        // White cross on medical pod
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '8px Chakra Petch';
        ctx.fillText('AID POD', -15, 20);
        ctx.restore();
      }

      // 7. Ground reference line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(40, h - 40);
      ctx.lineTo(w - 40, h - 40);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('EMERGENCY GROUND SURFACE (ACCIDENT ZONE)', 50, h - 25);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [armState]);

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              PAYLOAD ROBOTICS
            </span>
            <span className="text-xs text-slate-400 font-mono">KINEMATICS SERVO CONTROLLER</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Articulated Robotic Manipulator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate precision manipulation: unlatching vehicle doors, clearing rubble, and delivering life-saving medical supplies.
          </p>
        </div>

        {/* Quick Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetArm}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Angles</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Kinematics Canvas + Angle Sliders & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Arm Visual Kinematics Canvas */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl h-[520px] flex flex-col">
          <canvas
            ref={canvasRef}
            width={800}
            height={520}
            className="w-full h-full object-cover"
          />

          {/* Top Status Overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>TASK: {armState.currentTask}</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">TORQUE: {armState.torqueLoadPercent}%</span>
          </div>

          {/* Quick Gripper Button floating on canvas */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={toggleGripper}
              className={`px-4 py-2 rounded-xl font-bold text-xs font-heading shadow-xl transition-all ${
                armState.gripperState === 'OPEN'
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              Gripper: {armState.gripperState} (Toggle)
            </button>
          </div>
        </div>

        {/* Right Controls Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Joint Servo Angle Sliders */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-left">
            <h3 className="text-sm font-bold text-white font-heading flex items-center justify-between">
              <span>Joint Angle Actuators</span>
              <span className="text-[10px] font-mono text-cyan-400">PWM SERVO BUS</span>
            </h3>

            {/* Shoulder */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Shoulder Joint:</span>
                <span className="text-cyan-300 font-bold">{armState.shoulderAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={armState.shoulderAngle}
                onChange={(e) => setArmAngle('shoulder', Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Elbow */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Elbow Joint:</span>
                <span className="text-emerald-300 font-bold">{armState.elbowAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={armState.elbowAngle}
                onChange={(e) => setArmAngle('elbow', Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Wrist */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Wrist Pitch:</span>
                <span className="text-sky-300 font-bold">{armState.wristAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={armState.wristAngle}
                onChange={(e) => setArmAngle('wrist', Number(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Automated Preset Rescue Tasks */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-left">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-emerald-400" />
              Automated Simulated Rescue Tasks:
            </h3>

            <div className="space-y-2">
              {[
                { task: 'Pick up First-Aid Trauma Pod', desc: 'Pre-latches pod from belly mount' },
                { task: 'Deliver Smart Hemostatic Bandage to Victim Alpha', desc: 'Deposits pressurized sterile dressing' },
                { task: 'Deploy Emergency Thermal Blanket Pod', desc: 'Drops self-unfolding insulated wrap' },
                { task: 'Clear Lightweight Rubble / Debris', desc: 'Displaces obstruction up to 4.8 kg' },
                { task: 'Press Emergency Vehicle Power Cutoff', desc: 'Actuates high-voltage vehicle kill switch' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => executeArmTask(item.task)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 font-heading">
                    {item.task}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Why Button */}
            <button
              onClick={() =>
                showAiExplanation(
                  'Robotic Manipulator Arm System',
                  'Designed by Samuel Velasco and the team at Colegio Campestre La Colina. Traditional drones only provide passive camera feeds; equipping the drone with an articulated manipulator allows active intervention (dropping medical packets directly into victim reach, pushing emergency switches) before ground teams arrive.'
                )
              }
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Why an active robotic arm?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
