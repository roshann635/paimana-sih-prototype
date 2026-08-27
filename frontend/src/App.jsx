import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import NationalOverview from './pages/NationalOverview/NationalOverview';
import PriorityQueue from './pages/PriorityQueue/PriorityQueue';
import ProjectExplorer from './pages/ProjectExplorer/ProjectExplorer';
import ProjectDeepDive from './pages/ProjectDeepDive/ProjectDeepDive';
import EarlyWarningCenter from './pages/EarlyWarningCenter/EarlyWarningCenter';
import InteractiveMap from './pages/InteractiveMap/InteractiveMap';
import MinistryAnalytics from './pages/MinistryAnalytics/MinistryAnalytics';
import SectorAnalytics from './pages/SectorAnalytics/SectorAnalytics';
import Benchmarking from './pages/Benchmarking/Benchmarking';
import DataQualityCenter from './pages/DataQualityCenter/DataQualityCenter';
import ModelHealth from './pages/ModelHealth/ModelHealth';
import ReportsCenter from './pages/ReportsCenter/ReportsCenter';
import InterventionsCenter from './pages/InterventionsCenter/InterventionsCenter';
import SatelliteObservatory from './pages/SatelliteObservatory/SatelliteObservatory';
import AIAssistantDrawer from './components/intelligence/AIAssistantDrawer';


export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle URL navigation
  const navigate = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle direct project select
  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    navigate(`/projects/${projectId}`);
  };

  // Route resolver with full route aliases and parameters
  const renderCurrentView = () => {
    // 1. Dynamic Project Deep Dive Route: /projects/:id
    if (currentPath.startsWith('/projects/') && currentPath.length > 10) {
      const pid = currentPath.replace('/projects/', '').split('?')[0];
      return (
        <ProjectDeepDive
          projectId={pid || selectedProjectId}
          onBack={() => navigate('/projects')}
          onNavigate={navigate}
        />
      );
    }

    // Normalized path without query params
    const cleanPath = currentPath.split('?')[0].toLowerCase();

    switch (cleanPath) {
      case '/':
      case '/overview':
      case '/dashboard':
        return (
          <NationalOverview
            onNavigate={navigate}
            onSelectProject={handleSelectProject}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />
        );

      case '/projects':
      case '/all-projects':
      case '/explorer':
        return (
          <ProjectExplorer
            onSelectProject={handleSelectProject}
            initialSearch={searchTerm}
          />
        );

      case '/priority-queue':
      case '/priority':
      case '/interventions-queue':
        return (
          <PriorityQueue
            onSelectProject={handleSelectProject}
          />
        );

      case '/map':
      case '/state-map':
      case '/geography':
      case '/spatial':
        return (
          <InteractiveMap
            onSelectProject={handleSelectProject}
          />
        );

      case '/early-warnings':
      case '/alerts':
      case '/surveillance':
      case '/bulletins':
        return (
          <EarlyWarningCenter
            onSelectProject={handleSelectProject}
          />
        );

      case '/analytics/portfolio':
      case '/analytics/sectors':
      case '/sectors':
      case '/risk-analytics':
      case '/schedule-risk':
        return <SectorAnalytics />;

      case '/satellite-observatory':
      case '/satellite':
      case '/satellite-verification':
      case '/earth-observation':
      case '/copernicus':
        return <SatelliteObservatory onSelectProject={handleSelectProject} />;

      case '/analytics/ministries':
      case '/ministries':
      case '/cost-risk':
        return <MinistryAnalytics onNavigate={navigate} />;


      case '/analytics/benchmarking':
      case '/benchmarking':
      case '/baselines':
        return <Benchmarking />;

      case '/intelligence/risk-diagnosis':
      case '/interventions':
      case '/actions':
      case '/remediation':
        return (
          <InterventionsCenter
            onSelectProject={handleSelectProject}
          />
        );

      case '/intelligence/model-health':
      case '/model-health':
      case '/governance/model-health':
      case '/ml-governance':
        return <ModelHealth />;

      case '/data-quality':
      case '/dqe':
      case '/governance/data-quality':
      case '/ingestion-audit':
        return <DataQualityCenter />;

      case '/reports':
      case '/reports-downloads':
      case '/downloads':
      case '/briefings':
        return <ReportsCenter />;

      default:
        return (
          <NationalOverview
            onNavigate={navigate}
            onSelectProject={handleSelectProject}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />
        );
    }
  };

  return (
    <AppShell
      currentPath={currentPath}
      onNavigate={navigate}
      onOpenAssistant={() => setIsAssistantOpen(true)}
      searchTerm={searchTerm}
      onSearchChange={(term) => {
        setSearchTerm(term);
        if (term.trim() && currentPath !== '/projects') {
          navigate('/projects');
        }
      }}
    >
      {renderCurrentView()}

      {/* Side Intelligence Assistant */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectProject={handleSelectProject}
      />
    </AppShell>
  );
}
