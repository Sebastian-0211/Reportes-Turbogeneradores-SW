import React, { useState, useMemo } from 'react';
import { Turbomachine, ChannelMeasurement, PeriodReport } from '../types/turbomachine';
import { generateOrbitAndWaveform, calculateDelta } from '../utils/orbitMath';
import { Layers, Eye, EyeOff, Sliders, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface OrbitOverlayViewProps {
  turbomachine: Turbomachine;
}

export const OrbitOverlayView: React.FC<OrbitOverlayViewProps> = ({ turbomachine }) => {
  const periods = turbomachine.periods;

  // Selected period and channel for Orbit A (Base)
  const [periodAId, setPeriodAId] = useState<string>(periods[0]?.id || '');
  const periodA = periods.find((p) => p.id === periodAId) || periods[0];
  const [channelAId, setChannelAId] = useState<string>(periodA?.channels[0]?.id || 'C1');

  // Selected period and channel for Orbit B (Comparison)
  const [periodBId, setPeriodBId] = useState<string>(periods[1]?.id || periods[0]?.id || '');
  const periodB = periods.find((p) => p.id === periodBId) || periods[1] || periods[0];
  const [channelBId, setChannelBId] = useState<string>(periodB?.channels[0]?.id || 'C1');

  // Display toggles and opacity
  const [showOrbitA, setShowOrbitA] = useState<boolean>(true);
  const [showOrbitB, setShowOrbitB] = useState<boolean>(true);
  const [opacityA, setOpacityA] = useState<number>(0.85);
  const [opacityB, setOpacityB] = useState<number>(0.95);
  const [viewType, setViewType] = useState<'vector' | 'image_blend'>('vector');

  const channelA = periodA?.channels.find((c) => c.id === channelAId) || periodA?.channels[0];
  const channelB = periodB?.channels.find((c) => c.id === channelBId) || periodB?.channels[0];

  // Mathematical generation
  const orbitAData = useMemo(() => {
    return channelA ? generateOrbitAndWaveform(channelA) : null;
  }, [channelA]);

  const orbitBData = useMemo(() => {
    return channelB ? generateOrbitAndWaveform(channelB) : null;
  }, [channelB]);

  const delta = calculateDelta(channelA, channelB);

  // SVG coordinate calculations
  const cx = 150;
  const cy = 150;
  const radiusPx = 110;
  const maxScaleVal = Math.max(
    orbitAData?.orbit.maxRadius || 1,
    orbitBData?.orbit.maxRadius || 1,
    1.0
  );
  const scale = radiusPx / maxScaleVal;

  const orbitAPathD = useMemo(() => {
    if (!orbitAData?.orbit.points.length) return '';
    return orbitAData.orbit.points.reduce((acc, pt, idx) => {
      const px = cx + pt.x * scale;
      const py = cy - pt.y * scale;
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)},${py.toFixed(1)}`;
    }, '');
  }, [orbitAData, scale]);

  const orbitBPathD = useMemo(() => {
    if (!orbitBData?.orbit.points.length) return '';
    return orbitBData.orbit.points.reduce((acc, pt, idx) => {
      const px = cx + pt.x * scale;
      const py = cy - pt.y * scale;
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)},${py.toFixed(1)}`;
    }, '');
  }, [orbitBData, scale]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Módulo de Sobreposición Orbital (Superposición y Diff Visual)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compara dos estados operacionales superponiendo sus trayectorias Lissajous en el mismo plano polar para detectar derivas y distorsiones.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded">
          <button
            onClick={() => setViewType('vector')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              viewType === 'vector' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Vector Calibrado
          </button>
          <button
            onClick={() => setViewType('image_blend')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              viewType === 'image_blend' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Fusión de Fotos Capturadas
          </button>
        </div>
      </div>

      {/* Main Comparison Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Selectors and Delta Analysis */}
        <div className="lg:col-span-5 space-y-3">
          {/* Orbit A Selector (Base) */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span>Órbita A (Línea Base / Referencia)</span>
              </span>
              <button
                onClick={() => setShowOrbitA(!showOrbitA)}
                className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                {showOrbitA ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                <span>{showOrbitA ? 'Visible' : 'Oculta'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Período:</label>
                <select
                  value={periodAId}
                  onChange={(e) => setPeriodAId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{p.periodLabel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Cojinete / Canal:</label>
                <select
                  value={channelAId}
                  onChange={(e) => setChannelAId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                >
                  {periodA?.channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.code}</option>
                  ))}
                </select>
              </div>
            </div>

            {channelA && (
              <div className="text-[11px] font-mono text-slate-700 bg-white/80 p-2 rounded border border-blue-100 flex justify-between">
                <span>Pk-Pk: <strong>{channelA.pkToPkX.toFixed(3)} / {channelA.pkToPkY.toFixed(3)} {channelA.unit}</strong></span>
                <span>Fase: <strong>{channelA.angleDeg.toFixed(1)}°</strong></span>
              </div>
            )}
          </div>

          {/* Orbit B Selector (Comparison) */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
                <span>Órbita B (Condición a Comparar)</span>
              </span>
              <button
                onClick={() => setShowOrbitB(!showOrbitB)}
                className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                {showOrbitB ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                <span>{showOrbitB ? 'Visible' : 'Oculta'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Período:</label>
                <select
                  value={periodBId}
                  onChange={(e) => setPeriodBId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{p.periodLabel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Cojinete / Canal:</label>
                <select
                  value={channelBId}
                  onChange={(e) => setChannelBId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                >
                  {periodB?.channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>{ch.code}</option>
                  ))}
                </select>
              </div>
            </div>

            {channelB && (
              <div className="text-[11px] font-mono text-slate-700 bg-white/80 p-2 rounded border border-amber-100 flex justify-between">
                <span>Pk-Pk: <strong>{channelB.pkToPkX.toFixed(3)} / {channelB.pkToPkY.toFixed(3)} {channelB.unit}</strong></span>
                <span>Fase: <strong>{channelB.angleDeg.toFixed(1)}°</strong></span>
              </div>
            )}
          </div>

          {/* Delta Statistics Box */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Diferencial Calculado ($\Delta$ de Órbitas)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-500 block">Variación Sonda X:</span>
                <span className={`font-mono font-bold text-sm ${delta.pctChangeX > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {delta.pctChangeX >= 0 ? `+${delta.pctChangeX}%` : `${delta.pctChangeX}%`}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-500 block">Variación Sonda Y:</span>
                <span className={`font-mono font-bold text-sm ${delta.pctChangeY > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {delta.pctChangeY >= 0 ? `+${delta.pctChangeY}%` : `${delta.pctChangeY}%`}
                </span>
              </div>
            </div>

            <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-700 border border-slate-100 leading-relaxed">
              {delta.message}
            </div>
          </div>
        </div>

        {/* Right Column: High Resolution Superimposed Polar Canvas */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-[420px]">
          {viewType === 'vector' ? (
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 300 300">
                {/* Concentric clearance rings */}
                {[0.25, 0.5, 0.75, 1.0].map((frac, i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={radiusPx * frac}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={i === 3 ? 'none' : '2,2'}
                  />
                ))}

                {/* Axes */}
                <line x1={cx - radiusPx * 1.15} y1={cy} x2={cx + radiusPx * 1.15} y2={cy} stroke="#94a3b8" strokeWidth="1" />
                <line x1={cx} y1={cy - radiusPx * 1.15} x2={cx} y2={cy + radiusPx * 1.15} stroke="#94a3b8" strokeWidth="1" />

                <text x={cx} y={cy - radiusPx * 1.2} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">0°</text>
                <text x={cx + radiusPx * 1.25} y={cy + 3} textAnchor="start" fill="#64748b" fontSize="9" fontWeight="bold">90°</text>
                <text x={cx} y={cy + radiusPx * 1.26} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">180°</text>
                <text x={cx - radiusPx * 1.25} y={cy + 3} textAnchor="end" fill="#64748b" fontSize="9" fontWeight="bold">270°</text>

                {/* Orbit A (Solid / Semi-transparent Blue) */}
                {showOrbitA && orbitAPathD && (
                  <g opacity={opacityA}>
                    <path
                      d={orbitAPathD}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="4,2"
                    />
                    {orbitAData && (
                      <circle
                        cx={cx + orbitAData.orbit.keyphasorPoint.x * scale}
                        cy={cy - orbitAData.orbit.keyphasorPoint.y * scale}
                        r="3.5"
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                )}

                {/* Orbit B (Solid Amber/Red) */}
                {showOrbitB && orbitBPathD && (
                  <g opacity={opacityB}>
                    <path
                      d={orbitBPathD}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                    {orbitBData && (
                      <circle
                        cx={cx + orbitBData.orbit.keyphasorPoint.x * scale}
                        cy={cy - orbitBData.orbit.keyphasorPoint.y * scale}
                        r="4"
                        fill="#dc2626"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                )}
              </svg>

              {/* Legend Tag in Canvas */}
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs p-2 rounded border border-slate-200 text-[10px] space-y-1 shadow-xs pointer-events-none">
                <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                  <span className="w-3 h-0.5 bg-blue-600 border-t border-dashed" />
                  <span>Órbita A: {periodA?.periodLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                  <span className="w-3 h-0.5 bg-amber-600" />
                  <span>Órbita B: {periodB?.periodLabel}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Image Blend Mode */
            <div className="relative w-full max-w-[420px] aspect-4/3 bg-black rounded overflow-hidden flex items-center justify-center">
              {channelA?.imageUrl && (
                <img
                  src={channelA.imageUrl}
                  alt="Captura A"
                  style={{ opacity: showOrbitA ? opacityA : 0 }}
                  className="absolute inset-0 w-full h-full object-contain mix-blend-screen"
                />
              )}
              {channelB?.imageUrl && (
                <img
                  src={channelB.imageUrl}
                  alt="Captura B"
                  style={{ opacity: showOrbitB ? opacityB : 0 }}
                  className="absolute inset-0 w-full h-full object-contain mix-blend-screen"
                />
              )}
              {(!channelA?.imageUrl || !channelB?.imageUrl) && (
                <div className="text-center p-4 text-slate-400 text-xs">
                  Para fusionar fotos capturadas, asegúrate de haber cargado imágenes en ambos meses correspondientes.
                </div>
              )}
            </div>
          )}

          {/* Opacity Sliders */}
          <div className="flex items-center justify-between w-full max-w-sm mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-blue-900 font-semibold">Opacidad Órbita A:</span>
                <span>{Math.round(opacityA * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={opacityA}
                onChange={(e) => setOpacityA(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-amber-900 font-semibold">Opacidad Órbita B:</span>
                <span>{Math.round(opacityB * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={opacityB}
                onChange={(e) => setOpacityB(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
