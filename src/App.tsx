import React from 'react';
import { RescueProvider, useRescue } from './context/RescueContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { SimulationDisclaimer } from './components/SimulationDisclaimer.tsx';
import { AiExplainModal } from './components/AiExplainModal.tsx';
import { PresentationMode } from './components/PresentationMode.tsx';

// Pages
import { CommandCenter } from './pages/CommandCenter.tsx';
import { EmergenciesView } from './pages/EmergenciesView.tsx';
import { DroneFleetView } from './pages/DroneFleetView.tsx';
import { DroneExplorer3DView } from './pages/DroneExplorer3DView.tsx';
import { DroneSimulatorView } from './pages/DroneSimulatorView.tsx';
import { RoboticArmView } from './pages/RoboticArmView.tsx';
import { VictimDetectionView } from './pages/VictimDetectionView.tsx';
import { SatelliteDetectionView } from './pages/SatelliteDetectionView.tsx';
import { MissionPlannerView } from './pages/MissionPlannerView.tsx';
import { TestingLabView } from './pages/TestingLabView.tsx';
import { CommunicationsView } from './pages/CommunicationsView.tsx';
import { EmergencyNetworkView } from './pages/EmergencyNetworkView.tsx';
import { DigitalTwinView } from './pages/DigitalTwinView.tsx';
import { AnalyticsView } from './pages/AnalyticsView.tsx';
import { AiRescueAssistantView } from './pages/AiRescueAssistantView.tsx';
import { AboutProjectView } from './pages/AboutProjectView.tsx';
import { SettingsView } from './pages/SettingsView.tsx';
import { LaColinaDigitalTwinView } from './pages/LaColinaDigitalTwinView.tsx';
import { SimulationStudioView } from './pages/SimulationStudioView.tsx';

const AppContent: React.FC = () => {
  const { activeTab, presentationMode } = useRescue();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header />

      {/* Main App Body with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-16">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Simulation Prototype Banner */}
            <div className="px-4 md:px-6 pt-4">
              <SimulationDisclaimer />
            </div>

            {/* Routed View Switcher */}
            {activeTab === 'la-colina-twin' && <LaColinaDigitalTwinView />}
            {activeTab === 'simulation-studio' && <SimulationStudioView />}
            {activeTab === 'command-center' && <CommandCenter />}
            {activeTab === 'emergencies' && <EmergenciesView />}
            {activeTab === 'drone-fleet' && <DroneFleetView />}
            {activeTab === 'drone-explorer' && <DroneExplorer3DView />}
            {activeTab === 'drone-simulator' && <DroneSimulatorView />}
            {activeTab === 'robotic-arm' && <RoboticArmView />}
            {activeTab === 'victim-detection' && <VictimDetectionView />}
            {(activeTab === 'satellite' || activeTab === 'satellite-detection') && <SatelliteDetectionView />}
            {activeTab === 'mission-planner' && <MissionPlannerView />}
            {activeTab === 'testing-lab' && <TestingLabView />}
            {activeTab === 'communications' && <CommunicationsView />}
            {activeTab === 'emergency-network' && <EmergencyNetworkView />}
            {activeTab === 'digital-twin' && <DigitalTwinView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'ai-assistant' && <AiRescueAssistantView />}
            {activeTab === 'about-project' && <AboutProjectView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* AI Explainability Modal */}
      <AiExplainModal />

      {/* Full-Screen Exhibition Presentation Mode */}
      {presentationMode && <PresentationMode />}
    </div>
  );
};

export default function App() {
  return (
    <RescueProvider>
      <AppContent />
    </RescueProvider>
  );
}
