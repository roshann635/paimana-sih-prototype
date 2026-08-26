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

  // Route resolver
  const renderCurrentView = () => {
    if (currentPath.startsWith('/projects/') && currentPath.length > 10) {
      const pid = currentPath.replace('/projects/', '');
      return (
        <ProjectDeepDive
          projectId={pid || selectedProjectId}
          onBack={() => navigate('/projects')}
          onNavigate={navigate}
        />
      );
    }

    switch (currentPath) {
      case '/':
      case '/overview':
        return (
          <NationalOverview
            onNavigate={navigate}
            onSelectProject={handleSelectProject}
          />
        );

      case '/priority-queue':
        return (
          <PriorityQueue
            onSelectProject={handleSelectProject}
          />
        );

      case '/projects':
        return (
          <ProjectExplorer
            onSelectProject={handleSelectProject}
          />
        );

      case '/early-warnings':
        return (
          <EarlyWarningCenter
            onSelectProject={handleSelectProject}
          />
        );

      case '/map':
        return (
          <InteractiveMap
            onSelectProject={handleSelectProject}
          />
        );

      case '/analytics/portfolio':
      case '/analytics/sectors':
        return <SectorAnalytics />;

      case '/analytics/ministries':
        return <MinistryAnalytics onNavigate={navigate} />;

      case '/analytics/benchmarking':
        return <Benchmarking />;

      case '/intelligence/risk-diagnosis':
        return (
          <ProjectExplorer
            onSelectProject={handleSelectProject}
          />
        );

      case '/intelligence/model-health':
        return <ModelHealth />;

      case '/data-quality':
        return <DataQualityCenter />;

      case '/reports':
        return <ReportsCenter />;

      default:
        return (
          <NationalOverview
            onNavigate={navigate}
            onSelectProject={handleSelectProject}
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
      onSearchChange={setSearchTerm}
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
