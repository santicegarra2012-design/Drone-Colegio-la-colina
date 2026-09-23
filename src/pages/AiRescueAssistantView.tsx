import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiRescueAssistantView: React.FC = () => {
  const { 
    drones, 
    emergencies, 
    selectedEmergency, 
    selectedDrone, 
    startDemo, 
    deployDroneToEmergency 
  } = useRescue();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I am the RESCUE AI Autonomous Mission Assistant. I have live telemetry for ${drones.length} drones across the Medellín Valley network and ${emergencies.length} active emergency incidents. Ask me for real-time mission analysis, system diagnostics, or tactical recommendations.`,
      timestamp: '19:42:10',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    'What should drone DR-07 do next?',
    'How many victims were detected at #0042?',
    'Which drone should be deployed for high-wind rain?',
    'Explain the LiDAR point-cloud perception system.',
    'Start an end-to-end simulated rescue mission.',
    'Summarize current medical payload capacity.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Speech synthesis TTS helper
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const generateSimulatedResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('next') || q.includes('what should')) {
      if (selectedEmergency.status === 'DETECTED') {
        return `Current recommendation for incident ${selectedEmergency.code}: Deploy DR-07 immediately. DR-07 is at 88% battery, equipped with a dual robotic manipulator and trauma kit. Weather en route has moderate rain, well within DR-07's IP66 rating.`;
      }
      if (selectedEmergency.status === 'DRONE_DEPLOYED' || selectedEmergency.status === 'EN_ROUTE') {
        return `DR-07 is currently en route to ${selectedEmergency.locationName}. Next protocol is autonomous descent to 25m, switching LiDAR into 360-degree dense mapping mode, and establishing ground bio-radar vital scanning.`;
      }
      if (selectedEmergency.status === 'ARRIVED' || selectedEmergency.status === 'SEARCHING') {
        return `DR-07 is on scene at ${selectedEmergency.code}. Three victims detected. Recommended action: Actuate robotic arm to deliver Smart Hemostatic Bandage to Victim Alpha, and transmit 3D point cloud to Hospital General de Medellín.`;
      }
      return `Mission ${selectedEmergency.code} is in state: ${selectedEmergency.status}. Ground ambulances are approaching. Maintain aerial perimeter surveillance until physical handoff.`;
    }

    if (q.includes('victim') || q.includes('how many')) {
      const vics = selectedEmergency.victims;
      return `For active incident ${selectedEmergency.code} at ${selectedEmergency.locationName}, our bio-radar detected ${vics.length} victims:
1. ${vics[0]?.label || 'Victim 1'}: Life signs DETECTED, HR ${vics[0]?.heartRateBpm} BPM (${vics[0]?.status}).
2. ${vics[1]?.label || 'Victim 2'}: Life signs DETECTED, HR ${vics[1]?.heartRateBpm} BPM (${vics[1]?.status}).
3. ${vics[2]?.label || 'Victim 3'}: Life signs ${vics[2]?.lifeSigns}, HR ${vics[2]?.heartRateBpm} BPM (${vics[2]?.status}).
All coordinates have been mapped for incoming triage crews.`;
    }

    if (q.includes('which drone') || q.includes('select') || q.includes('deploy')) {
      return `For high-wind rain or rapid expressway response, DR-07 (Apex HexaCopter Mk-IV) is the primary recommendation. Its 6-rotor coaxial configuration provides 24.6 kg thrust authority, with triple-band RTK-GPS and IP66 water ingress sealing.`;
    }

    if (q.includes('lidar') || q.includes('explain lidar')) {
      return `The 360° Solid-State LiDAR emits 200,000 laser pulses per second at 905nm wavelength. By measuring photon time-of-flight, it generates a sub-centimeter accurate 3D geometry of the crash site in zero visibility, enabling autonomous obstacle avoidance without reliance on daylight or GPS alone.`;
    }

    if (q.includes('start') || q.includes('demo') || q.includes('mission')) {
      setTimeout(() => startDemo(), 600);
      return `Initiating full end-to-end simulated rescue demo sequence now. Watch the automated choreography progress across Satellite Detection, AI Analysis, Drone Simulator, 3D Explorer, Bio-Radar, and Robotic Arm assistance!`;
    }

    if (q.includes('payload') || q.includes('medical')) {
      return `The onboard Trauma Pod carries:
- 1x Automated External Defibrillator (AED Concept Pod)
- 2x Smart Hemostatic Combat Gauze & Tourniquets
- 2x Space Thermal Survival Blankets
- Emergency Sterile Saline & Hydrogel Burn Dressings
- Controlled via the carbon-titanium robotic manipulator arm.`;
    }

    return `Telemetry analysis for query "${query}": System systems are 100% nominal. Active incident is ${selectedEmergency.code} (${selectedEmergency.title}) with DR-07 staged. All algorithms designed by Santiago Cegarra, Samuel Velasco, and Jeronimo Escobar for Colegio Campestre La Colina.`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sound.playBeep(980, 0.05);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      sound.playSuccess();
      const replyText = generateSimulatedResponse(query);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      speakText(replyText);
    }, 800);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              MISSION INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400 font-mono">GEMINI REASONING AGENT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            AI Rescue Assistant
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Conversational mission control agent grounded in live simulated drone telemetry, sensor streams, and victim data.
          </p>
        </div>

        {/* TTS Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              ttsEnabled
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{ttsEnabled ? 'Voice Output ON' : 'Voice Output OFF'}</span>
          </button>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col h-[560px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => {
            const isBot = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed ${isBot ? 'items-start' : 'items-end justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-3.5 rounded-2xl text-left whitespace-pre-wrap ${
                    isBot
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 font-medium'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`block text-[10px] font-mono mt-1.5 ${isBot ? 'text-slate-500' : 'text-cyan-900'}`}>
                    {m.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-200"></span>
                <span className="text-[11px] font-mono text-slate-500 ml-1">Analyzing mission telemetry...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="py-3 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Prompts:
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(p);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask RESCUE AI Assistant about telemetry, LiDAR, victims, or autonomous flight..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-40 text-white font-bold text-xs font-heading shadow-lg transition-all flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
