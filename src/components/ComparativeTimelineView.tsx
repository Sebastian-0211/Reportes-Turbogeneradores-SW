import React, { useState, useEffect, useMemo } from 'react';
import { Turbomachine, ChannelMeasurement, PeriodReport } from '../types/turbomachine';
import { OrbitVisualizer } from './OrbitVisualizer';
import { calculateDelta } from '../utils/orbitMath';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Calendar, 
  ArrowRight, 
  AlertCircle,
  Sliders,
  Sparkles,
  GitCompare
} from 'lucide-react';

interface ComparativeTimelineViewProps {
  turbomachine: Turbomachine;
  onOpenMeasurementEditor?: (periodId: string, channelId: string) => void;
}

export const ComparativeTimelineView: React.FC<ComparativeTimelineViewProps> = ({
  turbomachine,
  onOpenMeasurementEditor,
}) => {
  const periods = turbomachine.periods;

  // Selected bearing/channel tag to track across time (e.g. "C1" or "1TX/1TY")
  const firstChannel = periods[0]?.channels[0];
  const [selectedChannelLabel, setSelectedChannelLabel] = useState<string>(
    firstChannel?.label || '1TX/1TY - L. LIBRE TURBINA'
  );

  // Periods for side-by-side comparison
  const [basePeriodId, setBasePeriodId] = useState<string>(periods[0]?.id || '');
  const [currentPeriodId, setCurrentPeriodId] = useState<string>(
    periods[periods.length - 1]?.id || periods[0]?.id || ''
  );

  // Time-lapse slider state
  const [activeTimeIndex, setActiveTimeIndex] = useState<number>(periods.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Available unique channel labels across all periods
  const uniqueChannelLabels = useMemo(() => {
    const set = new Set<string>();
    periods.forEach((p) => {
      p.channels.forEach((c) => set.add(c.label));
    });
    return Array.from(set);
  }, [periods]);

  // Animation player for time-lapse
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveTimeIndex((prev) => {
          if (prev >= periods.length - 1) return 0;
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, periods.length]);

  const basePeriod = periods.find((p) => p.id === basePeriodId) || periods[0];
  const currentPeriod = periods.find((p) => p.id === currentPeriodId) || periods[periods.length - 1];

  const baseChannel = basePeriod?.channels.find((c) => c.label === selectedChannelLabel) || basePeriod?.channels[0];
  const currentChannel = currentPeriod?.channels.find((c) => c.label === selectedChannelLabel) || currentPeriod?.channels[0];

  const activeTimelapsePeriod = periods[activeTimeIndex] || periods[0];
  const activeTimelapseChannel = activeTimelapsePeriod?.channels.find((c) => c.label === selectedChannelLabel) || activeTimelapsePeriod?.channels[0];

  const delta = calculateDelta(baseChannel, currentChannel);

  // Historical trend data for the selected bearing
  const historyTrend = useMemo(() => {
    return periods.map((p) => {
      const ch = p.channels.find((c) => c.label === selectedChannelLabel);
      return {
        periodLabel: p.periodLabel,
        date: p.date,
        pkToPkX: ch?.pkToPkX || 0,
        pkToPkY: ch?.pkToPkY || 0,
        angleDeg: ch?.angleDeg || 0,
        criticality: ch?.criticality || 'normal',
      };
    });
  }, [periods, selectedChannelLabel]);

  return (
    <div className="space-y-6 text-white">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <GitCompare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Historial Comparativo y Seguimiento Temporal
            </h2>
            <p className="text-xs text-slate-400">
              Analiza la evolución de la órbita de cada chumacera a lo largo del tiempo ({periods.length} mediciones registradas)
            </p>
          </div>
        </div>

        {/* Bearing Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Chumacera:</span>
          <select
            value={selectedChannelLabel}
            onChange={(e) => setSelectedChannelLabel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {uniqueChannelLabels.map((lbl) => (
              <option key={lbl} value={lbl}>
                {lbl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time-Lapse Player Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Reproductor Time-Lapse de Órbita
            </h3>
            <span className="text-[11px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
              Animación Cronológica
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar' : 'Reproducir Evolución'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveTimeIndex(0);
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              title="Reiniciar a Línea Base"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Slider and Markers */}
        <div className="space-y-2 pt-2">
          <input
            type="range"
            min={0}
            max={periods.length - 1}
            value={activeTimeIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setActiveTimeIndex(parseInt(e.target.value));
            }}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 px-1">
            {periods.map((p, idx) => (
              <span
                key={p.id}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveTimeIndex(idx);
                }}
                className={`cursor-pointer transition-colors ${
                  idx === activeTimeIndex ? 'text-blue-400 font-bold scale-110' : 'hover:text-slate-200'
                }`}
              >
                {p.periodLabel}
              </span>
            ))}
          </div>
        </div>

        {/* Current Timelapse Card */}
        {activeTimelapseChannel && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm">
                <OrbitVisualizer
                  measurement={activeTimelapseChannel}
                  titleOverride={`${activeTimelapseChannel.label} · ${activeTimelapsePeriod.periodLabel}`}
                  accentBorderColor="border-blue-600"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Estado en {activeTimelapsePeriod.periodLabel} ({activeTimelapsePeriod.date})
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  activeTimelapseChannel.criticality === 'critico' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                  activeTimelapseChannel.criticality === 'alerta' ? 'bg-orange-950 text-orange-300 border-orange-800' :
                  activeTimelapseChannel.criticality === 'vigilancia' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                  'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  Zona {activeTimelapseChannel.criticality.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pk-Pk X:</span>
                  <span className="text-base font-bold font-mono text-white">
                    {activeTimelapseChannel.pkToPkX.toFixed(3)} mils
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pk-Pk Y:</span>
                  <span className="text-base font-bold font-mono text-white">
                    {activeTimelapseChannel.pkToPkY.toFixed(3)} mils
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Fase 1X:</span>
                  <span className="text-base font-bold font-mono text-white">
                    {activeTimelapseChannel.angleDeg.toFixed(1)}°
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Velocidad:</span>
                  <span className="text-base font-bold font-mono text-white">
                    {activeTimelapseChannel.rpm.toFixed(0)} RPM
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                <span className="font-semibold text-blue-400 block mb-1">Diagnóstico Registrado:</span>
                <p className="italic">{activeTimelapseChannel.comment}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparative Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Comparación Diferencial Directa (Línea Base vs. Condición Actual)
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Referencia:</span>
              <select
                value={basePeriodId}
                onChange={(e) => setBasePeriodId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.periodLabel}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500" />

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Actual:</span>
              <select
                value={currentPeriodId}
                onChange={(e) => setCurrentPeriodId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.periodLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visualizers Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {baseChannel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Condición de Referencia: {basePeriod.periodLabel}</span>
                <span className="font-mono text-slate-400">{baseChannel.pkToPkX}x{baseChannel.pkToPkY} mils</span>
              </div>
              <OrbitVisualizer
                measurement={baseChannel}
                titleOverride={`${baseChannel.label} (Base - ${basePeriod.periodLabel})`}
                accentBorderColor="border-slate-600"
              />
            </div>
          )}

          {currentChannel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Condición Actual: {currentPeriod.periodLabel}</span>
                <span className="font-mono text-blue-400">{currentChannel.pkToPkX}x{currentChannel.pkToPkY} mils</span>
              </div>
              <OrbitVisualizer
                measurement={currentChannel}
                titleOverride={`${currentChannel.label} (Actual - ${currentPeriod.periodLabel})`}
                accentBorderColor="border-blue-600"
              />
            </div>
          )}
        </div>

        {/* Delta Analysis Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Variación Diferencial de Vibración:
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              delta.hasIncreased ? 'bg-amber-950/80 text-amber-300' : 'bg-emerald-950/80 text-emerald-300'
            }`}>
              {delta.hasIncreased ? `Incremento +${delta.pctChangeX.toFixed(1)}%` : 'Comportamiento Estable'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Δ Amplitud Eje X:</span>
              <span className="font-mono font-bold text-white text-sm">
                {delta.deltaPkToPkX > 0 ? '+' : ''}{delta.deltaPkToPkX.toFixed(3)} mils ({delta.pctChangeX.toFixed(1)}%)
              </span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Δ Amplitud Eje Y:</span>
              <span className="font-mono font-bold text-white text-sm">
                {delta.deltaPkToPkY > 0 ? '+' : ''}{delta.deltaPkToPkY.toFixed(3)} mils ({delta.pctChangeY.toFixed(1)}%)
              </span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Desplazamiento Angular:</span>
              <span className="font-mono font-bold text-white text-sm">
                {((currentChannel?.angleDeg || 0) - (baseChannel?.angleDeg || 0)).toFixed(1)}°
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 italic pt-1">
            "{delta.message}"
          </p>
        </div>
      </div>
    </div>
  );
};
