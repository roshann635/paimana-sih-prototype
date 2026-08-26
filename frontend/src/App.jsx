import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NationalOverview } from './pages/NationalOverview';
import { PriorityQueue } from './pages/PriorityQueue';
import { ProjectDeepDive } from './pages/ProjectDeepDive';
import { WhyRiskSHAP } from './pages/WhyRiskSHAP';
import { Benchmarking } from './pages/Benchmarking';
import { ModelHealth } from './pages/ModelHealth';
import { InterventionModal } from './components/InterventionModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { fetchAlerts, fetchPriorityQueue } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProjectId, setSelectedProjectId] = useState('P0001');
  const [selectedProjectObj, setSelectedProjectObj] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(834);

  useEffect(() => {
    async function initApp() {
      try {
        const [alertsData, topProjects] = await Promise.all([
          fetchAlerts('CRITICAL', 10),
          fetchPriorityQueue(5),
        ]);
        if (alertsData.length > 0) {
          setAlertCount(alertsData.length);
        }
        if (topProjects.length > 0) {
          setSelectedProjectId(topProjects[0].project_id);
          setSelectedProjectObj(topProjects[0]);
        }
      } catch (err) {
        console.error('App init error:', err);
      }
    }
    initApp();
  }, []);

  function handleSelectProject(pid) {
    setSelectedProjectId(pid);
    setActiveTab('deep-dive');
  }

  function handleOpenWhyRisk(pid) {
    setSelectedProjectId(pid);
    setActiveTab('why-risk');
  }

  function handleOpenIntervention(proj) {
    setSelectedProjectObj(proj);
    setInterventionModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedProjectId={selectedProjectId}
        openAssistant={() => setIsAssistantOpen(true)}
        alertCount={alertCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {activeTab === 'overview' && (
          <NationalOverview
            onSelectProject={handleSelectProject}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'priority-queue' && (
          <PriorityQueue
            onSelectProject={handleSelectProject}
            onOpenIntervention={handleOpenIntervention}
          />
        )}

        {activeTab === 'deep-dive' && (
          <ProjectDeepDive
            projectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onOpenWhyRisk={handleOpenWhyRisk}
            onOpenIntervention={handleOpenIntervention}
          />
        )}

        {activeTab === 'why-risk' && (
          <WhyRiskSHAP
            projectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onOpenIntervention={handleOpenIntervention}
          />
        )}

        {activeTab === 'benchmarking' && (
          <Benchmarking
            projectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        )}

        {activeTab === 'model-health' && <ModelHealth />}
      </main>

      {/* Intervention Action Modal */}
      <InterventionModal
        project={selectedProjectObj || { project_id: selectedProjectId, composite_risk_score: 85 }}
        isOpen={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectProject={handleSelectProject}
      />

      {/* Government Institutional Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-5 mt-10 text-[11px] text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Ministry of Statistics and Programme Implementation (MoSPI) • Infrastructure and Project Monitoring Division
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            PAIMANA v1.0 • Temporal XGBoost Engine • TreeSHAP XAI
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
