import React, { useState, useEffect } from 'react';
import { Turbomachine } from './types/turbomachine';
import { ModernIndustrialHeader } from './components/ModernIndustrialHeader';
import { CockpitDashboard } from './components/CockpitDashboard';
import { ComparativeTimelineView } from './components/ComparativeTimelineView';
import { InteractiveReportGenerator } from './components/InteractiveReportGenerator';
import { DidacticOrbitGuide } from './components/DidacticOrbitGuide';
import { SmartImageUploaderModal } from './components/SmartImageUploaderModal';
import { MeasurementModal } from './components/MeasurementModal';
import { ExportModal } from './components/ExportModal';
import { TurbineSettingsModal } from './components/TurbineSettingsModal';
import { CreateTurbineWizard } from './components/CreateTurbineWizard';
import { SharePointSyncModal } from './components/SharePointSyncModal';
import { ClientReportView } from './components/ClientReportView';
import { 
  loadAllTurbomachines, 
  saveAllTurbomachines 
} from './services/storageService';

export default function App() {
  // Check if current URL is a shared client link (?report=...)
  const [clientModeReport, setClientModeReport] = useState<{
    turbomachine: Turbomachine;
    title: string;
  } | null>(null);

  // Load from LocalStorage or initialize with realistic data
  const [turbines, setTurbines] = useState<Turbomachine[]>(() => {
    return loadAllTurbomachines();
  });

  const [activeTurbineId, setActiveTurbineId] = useState<string>(() => {
    return turbines[0]?.id || 'tg4';
  });

  const [activeTab, setActiveTab] = useState<'cockpit' | 'history' | 'report' | 'guide'>('cockpit');

  // Modals state
  const [smartUploaderOpen, setSmartUploaderOpen] = useState<boolean>(false);
  const [measurementModalState, setMeasurementModalState] = useState<{
    isOpen: boolean;
    mode: 'edit_channel' | 'add_period';
    periodId?: string;
    channelId?: string;
  }>({
    isOpen: false,
    mode: 'edit_channel',
  });

  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [createWizardOpen, setCreateWizardOpen] = useState<boolean>(false);
  const [sharePointModalOpen, setSharePointModalOpen] = useState<boolean>(false);

  // Check URL query parameters on mount (if opened in client mode)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reportId = searchParams.get('report');

    if (reportId) {
      const found = turbines.find((t) => reportId.includes(t.id)) || turbines[0];
      if (found) {
        setClientModeReport({
          turbomachine: found,
          title: `Reporte de Órbitas - ${found.fullName}`,
        });
      }
    }
  }, [turbines]);

  // Auto-save to LocalStorage whenever turbines state changes
  useEffect(() => {
    saveAllTurbomachines(turbines);
  }, [turbines]);

  // Current turbine object
  const currentTurbine = turbines.find((t) => t.id === activeTurbineId) || turbines[0] || {
    id: 'tg-default',
    name: 'TG',
    fullName: 'Turbomáquina',
    tag: 'TG',
    nominalRpm: 3600,
    ratedPowerMW: 10,
    company: 'Empresa',
    analyst: 'Analista',
    periods: [],
  };

  // Update current turbine and persist
  const handleUpdateTurbine = (updated: Turbomachine) => {
    setTurbines((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  // Add turbine from wizard
  const handleSaveCreatedTurbine = (newTurbine: Turbomachine) => {
    setTurbines((prev) => [...prev, newTurbine]);
    setActiveTurbineId(newTurbine.id);
  };

  // Apply measurements from Smart AI Image Ingestion
  const handleApplySmartUploadedMeasurements = (updatedTurbines: Turbomachine[], targetTurbineId: string) => {
    setTurbines(updatedTurbines);
    setActiveTurbineId(targetTurbineId);
    setActiveTab('cockpit');
  };

  // Open editor for specific channel
  const handleOpenMeasurementEditor = (periodId: string, channelId: string) => {
    setMeasurementModalState({
      isOpen: true,
      mode: 'edit_channel',
      periodId,
      channelId,
    });
  };

  // If opening in shared client mode (?report=...)
  if (clientModeReport) {
    return (
      <ClientReportView
        turbomachine={clientModeReport.turbomachine}
        reportTitle={clientModeReport.title}
        onExitToAnalystMode={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setClientModeReport(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Modern High-End Technical Navigation Header */}
      <ModernIndustrialHeader
        turbines={turbines}
        currentTurbomachine={currentTurbine}
        activeTurbineId={activeTurbineId}
        onSelectTurbine={(id) => setActiveTurbineId(id)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenSmartUploader={() => setSmartUploaderOpen(true)}
        onOpenCreateWizard={() => setCreateWizardOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenSharePointSync={() => setSharePointModalOpen(true)}
        onOpenExportJson={() => setExportModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">
        {activeTab === 'cockpit' && (
          <CockpitDashboard
            turbomachine={currentTurbine}
            onUpdateTurbomachine={handleUpdateTurbine}
            onOpenMeasurementEditor={handleOpenMeasurementEditor}
            onOpenSmartUploader={() => setSmartUploaderOpen(true)}
            onOpenDidacticGuide={() => setActiveTab('guide')}
          />
        )}

        {activeTab === 'history' && (
          <ComparativeTimelineView
            turbomachine={currentTurbine}
            onOpenMeasurementEditor={handleOpenMeasurementEditor}
          />
        )}

        {activeTab === 'report' && (
          <InteractiveReportGenerator
            turbomachine={currentTurbine}
          />
        )}

        {activeTab === 'guide' && <DidacticOrbitGuide />}
      </main>

      {/* AI Smart Image Ingestion Modal */}
      <SmartImageUploaderModal
        turbines={turbines}
        activeTurbineId={activeTurbineId}
        isOpen={smartUploaderOpen}
        onClose={() => setSmartUploaderOpen(false)}
        onApplyProcessedMeasurements={handleApplySmartUploadedMeasurements}
      />

      {/* Wizard to create turbomachine with bearings & proximitors */}
      {createWizardOpen && (
        <CreateTurbineWizard
          onSaveTurbine={handleSaveCreatedTurbine}
          onClose={() => setCreateWizardOpen(false)}
          defaultCompany={currentTurbine.company}
          defaultAnalyst={currentTurbine.analyst}
        />
      )}

      {/* Modal for SharePoint & Local Database management */}
      {sharePointModalOpen && (
        <SharePointSyncModal
          turbines={turbines}
          currentTurbomachine={currentTurbine}
          onUpdateTurbines={(updated) => {
            setTurbines(updated);
            if (updated.length > 0) {
              setActiveTurbineId(updated[0].id);
            }
          }}
          onOpenExportHtml={() => setExportModalOpen(true)}
          onClose={() => setSharePointModalOpen(false)}
        />
      )}

      {/* Measurement / Period Modal */}
      {measurementModalState.isOpen && (
        <MeasurementModal
          turbomachine={currentTurbine}
          mode={measurementModalState.mode}
          periodId={measurementModalState.periodId}
          channelId={measurementModalState.channelId}
          onClose={() =>
            setMeasurementModalState({ isOpen: false, mode: 'edit_channel' })
          }
          onSaveTurbomachine={handleUpdateTurbine}
        />
      )}

      {/* Export Report / Backup Modal */}
      {exportModalOpen && (
        <ExportModal
          turbomachine={currentTurbine}
          allTurbines={turbines}
          onImportData={(imported) => {
            setTurbines(imported);
            setActiveTurbineId(imported[0]?.id || 'tg4');
          }}
          onClose={() => setExportModalOpen(false)}
        />
      )}

      {/* Turbine Settings Modal */}
      {settingsModalOpen && (
        <TurbineSettingsModal
          turbomachine={currentTurbine}
          onSave={handleUpdateTurbine}
          onClose={() => setSettingsModalOpen(false)}
        />
      )}
    </div>
  );
}
