import React, { useState, useEffect } from 'react';
import { Turbomachine, PeriodReport } from './types/turbomachine';
import { INITIAL_TURBOMACHINES } from './data/initialData';
import { PowerBiHeader } from './components/PowerBiHeader';
import { PowerBiDualView } from './components/PowerBiDualView';
import { TurbineTabs } from './components/TurbineTabs';
import { OrbitOverlayView } from './components/OrbitOverlayView';
import { HistoricalTimeline } from './components/HistoricalTimeline';
import { PresentationMode } from './components/PresentationMode';
import { DidacticOrbitGuide } from './components/DidacticOrbitGuide';
import { MeasurementModal } from './components/MeasurementModal';
import { ExportModal } from './components/ExportModal';
import { TurbineSettingsModal } from './components/TurbineSettingsModal';
import { CreateTurbineWizard } from './components/CreateTurbineWizard';
import { ShareReportModal } from './components/ShareReportModal';
import { ClientReportView } from './components/ClientReportView';
import { 
  getPublishedReportFromCloud, 
  saveTurbomachineCloud, 
  loadTurbomachinesCloud,
  testFirebaseConnection 
} from './services/firebase';

const LOCAL_STORAGE_KEY = 'turbomachine_orbits_app_v1';

export default function App() {
  // Check if current URL is a shared client link (?report=rep-...)
  const [clientModeReport, setClientModeReport] = useState<{
    turbomachine: Turbomachine;
    title: string;
  } | null>(null);
  const [loadingClientReport, setLoadingClientReport] = useState<boolean>(true);

  // Load from LocalStorage or initialize with realistic data
  const [turbines, setTurbines] = useState<Turbomachine[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    return INITIAL_TURBOMACHINES;
  });

  const [activeTurbineId, setActiveTurbineId] = useState<string>('tg4');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overlay' | 'history' | 'presentation' | 'guide'>('dashboard');

  // Modals state
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
  const [presentationOpen, setPresentationOpen] = useState<boolean>(false);
  const [createWizardOpen, setCreateWizardOpen] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  // Test Firebase connection & check for shared link on mount
  useEffect(() => {
    testFirebaseConnection();

    const searchParams = new URLSearchParams(window.location.search);
    const reportId = searchParams.get('report');

    if (reportId) {
      // Fetch report from Firebase Firestore
      getPublishedReportFromCloud(reportId)
        .then((res) => {
          if (res) {
            setClientModeReport({
              turbomachine: res.turbomachine,
              title: res.title,
            });
          } else {
            // Fallback: check if matches any local turbine
            const found = turbines.find((t) => reportId.includes(t.id));
            if (found) {
              setClientModeReport({
                turbomachine: found,
                title: `Reporte de Órbitas - ${found.fullName}`,
              });
            }
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setLoadingClientReport(false));
    } else {
      setLoadingClientReport(false);

      // Attempt to load cloud turbomachines
      loadTurbomachinesCloud().then((cloudList) => {
        if (cloudList && cloudList.length > 0) {
          setTurbines((prev) => {
            const merged = [...prev];
            cloudList.forEach((ct) => {
              const idx = merged.findIndex((m) => m.id === ct.id);
              if (idx >= 0) merged[idx] = ct;
              else merged.push(ct);
            });
            return merged;
          });
        }
      }).catch(() => {});
    }
  }, []);

  // Auto-save to localStorage and cloud
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(turbines));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [turbines]);

  // Current turbine object
  const currentTurbine = turbines.find((t) => t.id === activeTurbineId) || turbines[0];

  // Update current turbine and sync to cloud
  const handleUpdateTurbine = (updated: Turbomachine) => {
    setTurbines((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    saveTurbomachineCloud(updated);
  };

  // Add turbine from wizard
  const handleSaveCreatedTurbine = (newTurbine: Turbomachine) => {
    setTurbines((prev) => [...prev, newTurbine]);
    setActiveTurbineId(newTurbine.id);
    saveTurbomachineCloud(newTurbine);
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

  // Open add new period
  const handleOpenAddPeriod = () => {
    setMeasurementModalState({
      isOpen: true,
      mode: 'add_period',
    });
  };

  // If opening in shared client mode (?report=...)
  if (clientModeReport) {
    return (
      <ClientReportView
        turbomachine={clientModeReport.turbomachine}
        reportTitle={clientModeReport.title}
        onExitToAnalystMode={() => {
          // Clear query param and reload analyst view
          window.history.replaceState({}, '', window.location.pathname);
          setClientModeReport(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Power BI Header & Ribbon */}
      <PowerBiHeader
        currentTurbomachine={currentTurbine}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'presentation') {
            setPresentationOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddPeriod={handleOpenAddPeriod}
        onOpenExport={() => setExportModalOpen(true)}
        onOpenShareLink={() => setShareModalOpen(true)}
        onOpenCreateWizard={() => setCreateWizardOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 md:p-5 max-w-[1600px] w-full mx-auto">
        {activeTab === 'dashboard' && (
          <PowerBiDualView
            turbomachine={currentTurbine}
            onUpdateTurbomachine={handleUpdateTurbine}
            onOpenMeasurementEditor={handleOpenMeasurementEditor}
            onOpenDidacticGuide={() => setActiveTab('guide')}
          />
        )}

        {activeTab === 'overlay' && (
          <OrbitOverlayView turbomachine={currentTurbine} />
        )}

        {activeTab === 'history' && (
          <HistoricalTimeline
            turbomachine={currentTurbine}
            onSelectPeriodChannel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'guide' && <DidacticOrbitGuide />}
      </main>

      {/* Bottom Sheet / Turbine Tabs (Power BI Style) */}
      <TurbineTabs
        turbines={turbines}
        activeTurbineId={activeTurbineId}
        onSelectTurbine={(id) => setActiveTurbineId(id)}
        onAddTurbine={() => setCreateWizardOpen(true)}
      />

      {/* Fullscreen Presentation Mode */}
      {presentationOpen && (
        <PresentationMode
          turbomachine={currentTurbine}
          onClose={() => setPresentationOpen(false)}
        />
      )}

      {/* Wizard to create turbomachine with bearings & proximitors */}
      {createWizardOpen && (
        <CreateTurbineWizard
          onSaveTurbine={handleSaveCreatedTurbine}
          onClose={() => setCreateWizardOpen(false)}
          defaultCompany={currentTurbine.company}
          defaultAnalyst={currentTurbine.analyst}
        />
      )}

      {/* Modal to share open client link via Firebase */}
      {shareModalOpen && (
        <ShareReportModal
          turbomachine={currentTurbine}
          onClose={() => setShareModalOpen(false)}
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

      {/* Export Report Modal */}
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
