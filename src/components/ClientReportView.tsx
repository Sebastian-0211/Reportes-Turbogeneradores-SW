import React, { useState } from 'react';
import { Turbomachine, ChannelMeasurement, PeriodReport } from '../types/turbomachine';
import { OrbitVisualizer } from './OrbitVisualizer';
import { OrbitOverlayView } from './OrbitOverlayView';
import { HistoricalTimeline } from './HistoricalTimeline';
import { DidacticOrbitGuide } from './DidacticOrbitGuide';
import { PresentationMode } from './PresentationMode';
import { calculateDelta } from '../utils/orbitMath';
import { 
  BarChart3, 
  Layers, 
  History, 
  BookOpen, 
  Presentation, 
  ShieldCheck, 
  Printer, 
  Lock, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Cpu,
  HelpCircle
} from 'lucide-react';

interface ClientReportViewProps {
  turbomachine: Turbomachine;
  reportTitle?: string;
  onExitToAnalystMode?: () => void;
}

export const ClientReportView: React.FC<ClientReportViewProps> = ({
  turbomachine,
  reportTitle,
  onExitToAnalystMode,
}) => {
  const periods = turbomachine.periods;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overlay' | 'history' | 'guide'>('dashboard');
  const [presentationOpen, setPresentationOpen] = useState<boolean>(false);

  // Slicer states for Dual View
  const [periodAId, setPeriodAId] = useState<string>(periods[0]?.id || '');
  const [periodBId, setPeriodBId] = useState<string>(periods[1]?.id || periods[0]?.id || '');

  const periodA = periods.find((p) => p.id === periodAId) || periods[0];
  const periodB = periods.find((p) => p.id === periodBId) || periods[1] || periods[0];

  const [channelAId, setChannelAId] = useState<string>(periodA?.channels[0]?.id || 'C1');
  const [channelBId, setChannelBId] = useState<string>(periodB?.channels[0]?.id || 'C1');

  const channelA = periodA?.channels.find((c) => c.id === channelAId) || periodA?.channels[0];
  const channelB = periodB?.channels.find((c) => c.id === channelBId) || periodB?.channels[0];

  const delta = calculateDelta(channelA, channelB);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Client Header Bar */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="bg-slate-950 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-xs bg-amber-500 flex items-center justify-center font-black text-xs text-black">
              P
            </div>
            <div>
              <span className="font-bold text-white text-xs">
                {reportTitle || `Reporte de Órbitas - ${turbomachine.fullName}`}
              </span>
              <span className="text-slate-500 mx-2">·</span>
              <span className="text-slate-400 text-[11px]">{turbomachine.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Modo Consulta Cliente (Solo Lectura)</span>
            </div>

            <button
              onClick={() => window.print()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            {onExitToAnalystMode && (
              <button
                onClick={onExitToAnalystMode}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Modo Analista
              </button>
            )}
          </div>
        </div>

        {/* Navigation Ribbon for Client */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard Interactivo</span>
            </button>

            <button
              onClick={() => setActiveTab('overlay')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'overlay'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sobreposición de Órbitas</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico de Tendencias</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Guía Didáctica</span>
            </button>
          </div>

          <button
            onClick={() => setPresentationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors shadow-xs"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Modo Presentación</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 md:p-5 max-w-[1600px] w-full mx-auto space-y-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Control Strip & Delta Analysis Alert */}
            <div className="bg-white border border-slate-200 rounded p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-semibold text-slate-700">Períodos a Comparar:</span>
                <select
                  value={periodAId}
                  onChange={(e) => setPeriodAId(e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-blue-900"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>Panel Sup: {p.periodLabel}</option>
                  ))}
                </select>
                <span className="text-slate-400">vs</span>
                <select
                  value={periodBId}
                  onChange={(e) => setPeriodBId(e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-blue-900"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>Panel Inf: {p.periodLabel}</option>
                  ))}
                </select>
              </div>

              {/* Delta Tag */}
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium border ${
                  delta.status === 'critico'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : delta.status === 'elevado'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {delta.hasIncreased ? (
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>
                  $\Delta$ Variación: <strong>{delta.pctChangeX >= 0 ? `+${delta.pctChangeX}%` : `${delta.pctChangeX}%`}</strong> (X)
                </span>
                <span className="hidden md:inline text-[11px] text-slate-500">· {delta.message}</span>
              </div>
            </div>

            {/* Slicers & Orbit Displays */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Upper Section */}
              <div className="lg:col-span-4 bg-white border border-slate-300 rounded p-3.5 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1 flex justify-between">
                    <span>Name</span>
                    <span className="text-[10px] text-slate-400">Sondeo de Cojinetes</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded p-1.5 space-y-0.5 bg-slate-50/50">
                    {periodA?.channels.map((ch) => (
                      <label
                        key={ch.id}
                        onClick={() => setChannelAId(ch.id)}
                        className={`flex items-center gap-2 px-1.5 py-1 rounded text-[11px] font-mono cursor-pointer ${
                          ch.id === channelAId
                            ? 'bg-blue-100 text-blue-900 font-semibold border-l-2 border-blue-600'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="client-radio-a"
                          checked={ch.id === channelAId}
                          onChange={() => setChannelAId(ch.id)}
                          className="text-blue-600 h-3 w-3"
                        />
                        <span className="truncate">{ch.code}</span>
                      </label>
                    ))}
                  </div>

                  <div className="my-2">
                    <h2 className="text-2xl font-black text-blue-600 leading-tight">
                      {periodA?.displayTitle || `Orbitas ${turbomachine.name} ${periodA?.periodLabel}`}
                    </h2>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {turbomachine.company} · Analista: {turbomachine.analyst}
                    </div>
                  </div>
                </div>

                {/* Readonly Comment */}
                <div className="mt-2">
                  <div className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-t">
                    Comentario Técnico
                  </div>
                  <div className="bg-blue-50/70 border border-blue-200 rounded-b p-2.5 text-xs text-slate-800 leading-relaxed min-h-[55px]">
                    {periodA?.generalComment || 'Sin observaciones registradas.'}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                {channelA && (
                  <OrbitVisualizer
                    measurement={channelA}
                    accentBorderColor="border-blue-900"
                  />
                )}
              </div>

              {/* Lower Section */}
              <div className="lg:col-span-4 bg-white border border-slate-300 rounded p-3.5 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1 flex justify-between">
                    <span>Name</span>
                    <span className="text-[10px] text-slate-400">Sondeo de Cojinetes</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded p-1.5 space-y-0.5 bg-slate-50/50">
                    {periodB?.channels.map((ch) => (
                      <label
                        key={ch.id}
                        onClick={() => setChannelBId(ch.id)}
                        className={`flex items-center gap-2 px-1.5 py-1 rounded text-[11px] font-mono cursor-pointer ${
                          ch.id === channelBId
                            ? 'bg-blue-100 text-blue-900 font-semibold border-l-2 border-blue-600'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="client-radio-b"
                          checked={ch.id === channelBId}
                          onChange={() => setChannelBId(ch.id)}
                          className="text-blue-600 h-3 w-3"
                        />
                        <span className="truncate">{ch.code}</span>
                      </label>
                    ))}
                  </div>

                  <div className="my-2">
                    <h2 className="text-2xl font-black text-blue-600 leading-tight">
                      {periodB?.displayTitle || `Orbitas ${turbomachine.name} ${periodB?.periodLabel}`}
                    </h2>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {turbomachine.company} · Analista: {turbomachine.analyst}
                    </div>
                  </div>
                </div>

                {/* Readonly Comment */}
                <div className="mt-2">
                  <div className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-t">
                    Comentario Técnico
                  </div>
                  <div className="bg-blue-50/70 border border-blue-200 rounded-b p-2.5 text-xs text-slate-800 leading-relaxed min-h-[55px]">
                    {periodB?.generalComment || 'Sin observaciones registradas.'}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                {channelB && (
                  <OrbitVisualizer
                    measurement={channelB}
                    accentBorderColor="border-blue-900"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overlay' && (
          <OrbitOverlayView turbomachine={turbomachine} />
        )}

        {activeTab === 'history' && (
          <HistoricalTimeline
            turbomachine={turbomachine}
            onSelectPeriodChannel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'guide' && <DidacticOrbitGuide />}
      </main>

      {/* Presentation Mode */}
      {presentationOpen && (
        <PresentationMode
          turbomachine={turbomachine}
          onClose={() => setPresentationOpen(false)}
        />
      )}
    </div>
  );
};
