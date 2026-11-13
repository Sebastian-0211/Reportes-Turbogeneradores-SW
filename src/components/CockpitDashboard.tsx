import React, { useState } from 'react';
import { Turbomachine, ChannelMeasurement, PeriodReport } from '../types/turbomachine';
import { ShaftTrainDiagram } from './ShaftTrainDiagram';
import { OrbitVisualizer } from './OrbitVisualizer';
import { 
  Activity, 
  Calendar, 
  Edit3, 
  Upload, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Plus, 
  Camera,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface CockpitDashboardProps {
  turbomachine: Turbomachine;
  onUpdateTurbomachine: (updated: Turbomachine) => void;
  onOpenMeasurementEditor: (periodId: string, channelId: string) => void;
  onOpenSmartUploader: () => void;
  onOpenDidacticGuide: () => void;
}

export const CockpitDashboard: React.FC<CockpitDashboardProps> = ({
  turbomachine,
  onUpdateTurbomachine,
  onOpenMeasurementEditor,
  onOpenSmartUploader,
  onOpenDidacticGuide,
}) => {
  const periods = turbomachine.periods;
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    periods[periods.length - 1]?.id || periods[0]?.id || ''
  );

  const activePeriod = periods.find((p) => p.id === selectedPeriodId) || periods[periods.length - 1] || periods[0];
  const channels = activePeriod?.channels || [];

  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    channels[0]?.id || 'C1'
  );

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const handleSelectChannel = (chId: string) => {
    setSelectedChannelId(chId);
  };

  return (
    <div className="space-y-6 text-white">
      {/* 1. KINEMATIC SHAFT TRAIN SYNOPTIC */}
      <ShaftTrainDiagram
        turbomachine={turbomachine}
        selectedChannelId={selectedChannelId}
        onSelectChannel={handleSelectChannel}
        activePeriodId={activePeriod?.id}
      />

      {/* 2. CAMPAIGN PERIOD SELECTOR & METRICS SUMMARY */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-400" />
          <div>
            <span className="text-xs text-slate-400 block">Campaña de Medición Activa:</span>
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriodId}
                onChange={(e) => {
                  setSelectedPeriodId(e.target.value);
                  const p = periods.find((x) => x.id === e.target.value);
                  if (p && p.channels.length > 0) {
                    setSelectedChannelId(p.channels[0].id);
                  }
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.periodLabel} ({p.date})
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500">· {channels.length} mediciones registradas</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSmartUploader}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Cargar Capturas de Órbitas</span>
          </button>

          <button
            onClick={() => onOpenMeasurementEditor(activePeriod.id, activeChannel?.id || 'C1')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Cojinete</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN ORBIT FOCUS CARD & TELEMETRY */}
      {activeChannel && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Visualizer */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <h3 className="text-sm font-bold text-white">
                  {activeChannel.label} · Inspección Detallada
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-slate-400">{activeChannel.dateStr}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  activeChannel.criticality === 'critico' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  activeChannel.criticality === 'alerta' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                  activeChannel.criticality === 'vigilancia' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {activeChannel.criticality}
                </span>
              </div>
            </div>

            <OrbitVisualizer
              measurement={activeChannel}
              titleOverride={activeChannel.label}
              accentBorderColor="border-blue-700"
            />

            {/* AI Diagnostics Banner */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-400" />
                  Diagnóstico Técnico:
                </span>
                <button
                  onClick={onOpenDidacticGuide}
                  className="text-[11px] text-blue-400 hover:text-blue-300 underline"
                >
                  Consultar guía de causas comunes
                </button>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{activeChannel.comment}"
              </p>
              {activeChannel.recommendation && (
                <div className="text-xs text-emerald-400 font-semibold pt-1">
                  Recomendación: {activeChannel.recommendation}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Telemetry Specs & Other Bearings in this Period */}
          <div className="lg:col-span-4 space-y-4">
            {/* Telemetry card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Telemetría Dinámica del Cojinete
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pk-Pk X ({activeChannel.unit}):</span>
                  <span className="text-base font-bold font-mono text-blue-400">
                    {activeChannel.pkToPkX.toFixed(3)}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pk-Pk Y ({activeChannel.unit}):</span>
                  <span className="text-base font-bold font-mono text-blue-400">
                    {activeChannel.pkToPkY.toFixed(3)}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Fase 1X:</span>
                  <span className="text-base font-bold font-mono text-white">
                    {activeChannel.angleDeg.toFixed(1)}°
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Velocidad:</span>
                  <span className="text-base font-bold font-mono text-white">
                    {activeChannel.rpm.toFixed(0)} RPM
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Frecuencia:</span>
                  <span className="text-base font-bold font-mono text-slate-300">
                    {activeChannel.freqHz.toFixed(1)} Hz
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Carga:</span>
                  <span className="text-base font-bold font-mono text-slate-300">
                    {activeChannel.loadPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Switcher of Bearings in this Period */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                Chumaceras en esta Campaña ({channels.length})
              </h4>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {channels.map((ch, idx) => {
                  const isSelected = ch.id === selectedChannelId;
                  const maxPkToPk = Math.max(ch.pkToPkX, ch.pkToPkY);

                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChannel(ch.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border border-blue-500 shadow-sm text-white font-bold'
                          : 'bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-400">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="truncate max-w-[170px]">{ch.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {ch.probeXName}/{ch.probeYName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-blue-400">{maxPkToPk.toFixed(2)} mils</div>
                        <span className={`text-[9px] uppercase px-1 rounded ${
                          ch.criticality === 'critico' ? 'text-rose-400' :
                          ch.criticality === 'alerta' ? 'text-orange-400' :
                          ch.criticality === 'vigilancia' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>
                          {ch.criticality}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
