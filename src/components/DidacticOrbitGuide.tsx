import React, { useState } from 'react';
import { DIDACTIC_GUIDE } from '../data/initialData';
import { OrbitPattern } from '../types/turbomachine';
import { BookOpen, AlertCircle, CheckCircle2, Sliders, Play, RotateCcw } from 'lucide-react';

export const DidacticOrbitGuide: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<OrbitPattern>('1X_normal');

  // Interactive Sandbox Simulator State
  const [harmonic1X, setHarmonic1X] = useState<number>(1.0);
  const [harmonic2X, setHarmonic2X] = useState<number>(0.0);
  const [subHarmonic, setSubHarmonic] = useState<number>(0.0);
  const [phaseDiffDeg, setPhaseDiffDeg] = useState<number>(90);
  const [rubClipping, setRubClipping] = useState<boolean>(false);

  const selectedItem = DIDACTIC_GUIDE.find((item) => item.id === selectedPattern) || DIDACTIC_GUIDE[0];

  // Quick preset loader
  const loadPreset = (pattern: OrbitPattern) => {
    setSelectedPattern(pattern);
    switch (pattern) {
      case '1X_normal':
        setHarmonic1X(0.8);
        setHarmonic2X(0.0);
        setSubHarmonic(0.0);
        setPhaseDiffDeg(90);
        setRubClipping(false);
        break;
      case 'unbalance_1X':
        setHarmonic1X(1.6);
        setHarmonic2X(0.05);
        setSubHarmonic(0.0);
        setPhaseDiffDeg(90);
        setRubClipping(false);
        break;
      case 'misalignment_2X':
        setHarmonic1X(0.9);
        setHarmonic2X(0.55);
        setSubHarmonic(0.0);
        setPhaseDiffDeg(120);
        setRubClipping(false);
        break;
      case 'oil_whirl_sub':
        setHarmonic1X(0.6);
        setHarmonic2X(0.0);
        setSubHarmonic(0.7);
        setPhaseDiffDeg(90);
        setRubClipping(false);
        break;
      case 'rubbing_contact':
        setHarmonic1X(1.1);
        setHarmonic2X(0.3);
        setSubHarmonic(0.0);
        setPhaseDiffDeg(90);
        setRubClipping(true);
        break;
      case 'sensor_defect':
        setHarmonic1X(0.7);
        setHarmonic2X(0.2);
        setSubHarmonic(0.4);
        setPhaseDiffDeg(45);
        setRubClipping(false);
        break;
      default:
        break;
    }
  };

  // Generate sandbox SVG orbit points
  const numPts = 300;
  const cx = 140;
  const cy = 140;
  const maxR = 90;
  const points: { x: number; y: number }[] = [];
  const phaseRad = (phaseDiffDeg * Math.PI) / 180;

  for (let i = 0; i < numPts; i++) {
    // 2 revolutions
    const t = (i / (numPts - 1)) * 4 * Math.PI;

    let x =
      harmonic1X * Math.cos(t) +
      harmonic2X * Math.cos(2 * t) +
      subHarmonic * Math.cos(0.43 * t);

    let y =
      harmonic1X * Math.sin(t + phaseRad) +
      harmonic2X * Math.sin(2 * t + phaseRad * 0.7) +
      subHarmonic * Math.sin(0.43 * t + 0.3);

    // Rub clipping
    if (rubClipping && y > 0.65) {
      y = 0.65 + 0.05 * Math.sin(8 * t);
    }

    const scale = maxR / 2.2;
    points.push({
      x: cx + x * scale,
      y: cy - y * scale,
    });
  }

  const orbitPathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, '');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Manual Didáctico Interactivo de Interpretación de Órbitas</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Diagnóstico de Turbomaquinaria mediante Patrones de Lissajous
        </h2>
        <p className="text-slate-300 text-sm max-w-3xl mt-2 leading-relaxed">
          Las órbitas representan la trayectoria bidimensional del centro del eje dentro del cojinete hidrodinámico
          en un plano transversal. Conoce las anomalías mecánicas más frecuentes y simúlalas en tiempo real.
        </p>
      </div>

      {/* Main Grid: Selector & Details + Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pattern Selector Tabs */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Patrones de Órbita Típicos
          </div>
          {DIDACTIC_GUIDE.map((item) => {
            const isSelected = item.id === selectedPattern;
            return (
              <button
                key={item.id}
                onClick={() => loadPreset(item.id)}
                className={`w-full text-left p-3 rounded border transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.id === '1X_normal' && '1X'}
                    {item.id === 'misalignment_2X' && '1X + 2X'}
                    {item.id === 'oil_whirl_sub' && '<0.5X'}
                    {item.id === 'rubbing_contact' && 'Impacto'}
                    {item.id === 'sensor_defect' && 'Ruido'}
                    {item.id === 'unbalance_1X' && '1X Alta'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 line-clamp-1">{item.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Center / Right Column: Detailed Card & Simulator Sandbox */}
        <div className="lg:col-span-8 space-y-4">
          {/* Detailed Diagnosis Card */}
          <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedItem.title}</h3>
                <p className="text-xs text-blue-700 font-medium">{selectedItem.subtitle}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {selectedItem.severityNote}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                  Geometría de la Órbita
                </span>
                <p className="text-slate-700 leading-relaxed">{selectedItem.orbitDescription}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                  Forma de Onda en el Tiempo (X-Y)
                </span>
                <p className="text-slate-700 leading-relaxed">{selectedItem.waveformDescription}</p>
              </div>
            </div>

            {/* Causes and Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 block">
                  Causas Típicas en Planta:
                </span>
                <ul className="space-y-1 text-slate-600">
                  {selectedItem.commonCauses.map((cause, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 block">
                  Recomendación para Confiabilidad:
                </span>
                <ul className="space-y-1 text-slate-600">
                  {selectedItem.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Simulator Sandbox */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Simulador de Órbita en Tiempo Real (Sandbox Dinámico)
                </h4>
              </div>
              <button
                onClick={() => loadPreset(selectedPattern)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer Preset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Simulator Controls */}
              <div className="md:col-span-7 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Componente 1X (Velocidad Sincrónica):</span>
                    <span className="font-mono text-blue-400">{harmonic1X.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={harmonic1X}
                    onChange={(e) => setHarmonic1X(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Componente 2X (Desalineación / Armónico 2):</span>
                    <span className="font-mono text-blue-400">{harmonic2X.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.2"
                    step="0.05"
                    value={harmonic2X}
                    onChange={(e) => setHarmonic2X(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Componente Subsincrónica 0.43X (Oil Whirl):</span>
                    <span className="font-mono text-blue-400">{subHarmonic.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={subHarmonic}
                    onChange={(e) => setSubHarmonic(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Desfase Ortogonal entre Sondas:</span>
                    <span className="font-mono text-blue-400">{phaseDiffDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={phaseDiffDeg}
                    onChange={(e) => setPhaseDiffDeg(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={rubClipping}
                      onChange={(e) => setRubClipping(e.target.checked)}
                      className="rounded accent-blue-500"
                    />
                    <span className="font-medium text-xs">Simular Roce con Sellos / Cojinete (Truncamiento)</span>
                  </label>
                </div>
              </div>

              {/* Live Canvas / SVG Display */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-[240px] h-[240px] bg-slate-950 rounded border border-slate-800 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 280 280">
                    {/* Concentric rings */}
                    {[30, 60, 90].map((r, i) => (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke="#334155"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    ))}

                    {/* Axes */}
                    <line x1={cx - 105} y1={cy} x2={cx + 105} y2={cy} stroke="#475569" strokeWidth="1" />
                    <line x1={cx} y1={cy - 105} x2={cx} y2={cy + 105} stroke="#475569" strokeWidth="1" />

                    {/* Lissajous path */}
                    <path
                      d={orbitPathD}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Keyphasor dot */}
                    {points[0] && (
                      <circle
                        cx={points[0].x}
                        cy={points[0].y}
                        r="3.5"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    )}
                  </svg>
                  <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
                    Live Lissajous
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
