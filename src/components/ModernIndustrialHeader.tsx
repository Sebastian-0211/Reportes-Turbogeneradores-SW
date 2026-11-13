import React from 'react';
import { Turbomachine } from '../types/turbomachine';
import { 
  Sparkles, 
  Activity, 
  GitCompare, 
  FileText, 
  BookOpen, 
  Download, 
  Plus, 
  Settings, 
  FolderSync, 
  Cpu, 
  ShieldCheck, 
  Upload,
  Gauge
} from 'lucide-react';

interface ModernIndustrialHeaderProps {
  turbines: Turbomachine[];
  currentTurbomachine: Turbomachine;
  activeTurbineId: string;
  onSelectTurbine: (id: string) => void;
  activeTab: 'cockpit' | 'history' | 'report' | 'guide';
  onSelectTab: (tab: 'cockpit' | 'history' | 'report' | 'guide') => void;
  onOpenSmartUploader: () => void;
  onOpenCreateWizard: () => void;
  onOpenSettings: () => void;
  onOpenSharePointSync: () => void;
  onOpenExportJson: () => void;
  lastSavedText?: string;
}

export const ModernIndustrialHeader: React.FC<ModernIndustrialHeaderProps> = ({
  turbines,
  currentTurbomachine,
  activeTurbineId,
  onSelectTurbine,
  activeTab,
  onSelectTab,
  onOpenSmartUploader,
  onOpenCreateWizard,
  onOpenSettings,
  onOpenSharePointSync,
  onOpenExportJson,
  lastSavedText = 'Modo Local Cifrado · 100% Offline',
}) => {
  const latestPeriod = currentTurbomachine.periods[currentTurbomachine.periods.length - 1];
  const isCritical = latestPeriod?.overallCriticality === 'critico';
  const hasAlert = latestPeriod?.overallCriticality === 'alerta' || latestPeriod?.overallCriticality === 'vigilancia';

  return (
    <header className="bg-slate-950 text-white select-none shadow-xl border-b border-slate-800">
      {/* Top Telemetry & Status Bar */}
      <div className="bg-slate-900/90 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-xs text-white shadow-md">
              Ω
            </div>
            <span className="font-bold text-sm tracking-wide text-white">
              ORBIT-PRO
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium hidden sm:inline">
              Dinámica de Rotores & Turbogeneradores
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {lastSavedText}
            </span>
            <span className="text-slate-600">·</span>
            <span>Analista: <strong className="text-slate-300">{currentTurbomachine.analyst}</strong></span>
          </div>
        </div>

        {/* Machine Switcher & Quick Add */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1 overflow-x-auto max-w-md">
            {turbines.map((t) => {
              const isSelected = t.id === activeTurbineId;
              const tLatest = t.periods[t.periods.length - 1];
              const tCrit = tLatest?.overallCriticality;

              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTurbine(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{t.name}</span>
                  {tCrit === 'critico' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                  {tCrit === 'alerta' && (
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                  )}
                </button>
              );
            })}

            <button
              onClick={onOpenCreateWizard}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Añadir nuevo turbogenerador"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
            title="Configuración de la turbomáquina"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation & Action Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectTab('cockpit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cockpit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Cockpit y Tren Cinemático</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>Historial y Time-Lapse</span>
          </button>

          <button
            onClick={() => onSelectTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Informe Interactivo</span>
          </button>

          <button
            onClick={() => onSelectTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Guía de Patrones de Falla</span>
          </button>
        </nav>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Smart Image Ingestion Button */}
          <button
            onClick={onOpenSmartUploader}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black rounded-lg shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/50 transition-all cursor-pointer animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Cargar Imágenes (IA Local)</span>
          </button>

          {/* Sync / Export */}
          <button
            onClick={onOpenSharePointSync}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 transition-colors"
            title="Sincronizar base de datos con SharePoint o disco local"
          >
            <FolderSync className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">SharePoint / JSON</span>
          </button>

          <button
            onClick={onOpenExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 transition-colors"
            title="Exportar respaldo de datos"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
