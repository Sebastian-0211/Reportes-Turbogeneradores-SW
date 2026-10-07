import React from 'react';
import { Turbomachine } from '../types/turbomachine';
import { 
  BarChart3, 
  Presentation, 
  History, 
  BookOpen, 
  Download, 
  PlusCircle, 
  Settings, 
  Share2,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

interface PowerBiHeaderProps {
  currentTurbomachine: Turbomachine;
  activeTab: 'dashboard' | 'overlay' | 'history' | 'presentation' | 'guide';
  onSelectTab: (tab: 'dashboard' | 'overlay' | 'history' | 'presentation' | 'guide') => void;
  onOpenAddPeriod: () => void;
  onOpenExport: () => void;
  onOpenShareLink: () => void;
  onOpenCreateWizard: () => void;
  onOpenSettings: () => void;
  lastSavedText?: string;
}

export const PowerBiHeader: React.FC<PowerBiHeaderProps> = ({
  currentTurbomachine,
  activeTab,
  onSelectTab,
  onOpenAddPeriod,
  onOpenExport,
  onOpenShareLink,
  onOpenCreateWizard,
  onOpenSettings,
  lastSavedText = 'Conectado a Firebase Cloud',
}) => {
  return (
    <header className="bg-slate-900 text-white select-none shadow-md">
      {/* Upper Window Title Bar matching Power BI style */}
      <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-3.5 h-3.5 rounded-xs bg-amber-500 flex items-center justify-center font-black text-[9px] text-black">
            P
          </div>
          <span className="font-semibold text-white tracking-wide">
            Reporte de Orbitas Turbogeneradores SW
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
            {lastSavedText} - {currentTurbomachine.analyst}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShareLink}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors shadow-xs"
            title="Genera un enlace abierto en Firebase para que los clientes interactúen con el informe en modo lectura"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Generar Enlace para Cliente</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors"
          >
            <span>Descargar / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Ribbon / Navigation Bar */}
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs (Dashboard, Overlay, History, Presentation, Guide) */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard Comparativo</span>
          </button>

          <button
            onClick={() => onSelectTab('overlay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'overlay'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-300" />
            <span>Sobreposición de Órbitas</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico & Derivas</span>
          </button>

          <button
            onClick={() => onSelectTab('presentation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'presentation'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Presentation className="w-3.5 h-3.5 text-purple-300" />
            <span>Modo Presentación</span>
          </button>

          <button
            onClick={() => onSelectTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Guía Didáctica</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-600 text-white rounded-md transition-colors shadow-xs"
            title="Crea un turbogenerador definiendo número de apoyos y proximitores"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Crear Turbina con Apoyos</span>
          </button>

          <button
            onClick={onOpenAddPeriod}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 border border-slate-700 rounded-md transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nuevo Mes / Campaña</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Configuración de Máquina y Parámetros"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
