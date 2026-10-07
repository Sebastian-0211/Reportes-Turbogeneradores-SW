import React, { useState, useEffect } from 'react';
import { Turbomachine, ChannelMeasurement, PeriodReport } from '../types/turbomachine';
import { OrbitVisualizer } from './OrbitVisualizer';
import { calculateDelta } from '../utils/orbitMath';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  X, 
  Lightbulb, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  MousePointer2
} from 'lucide-react';

interface PresentationModeProps {
  turbomachine: Turbomachine;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  turbomachine,
  onClose,
}) => {
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [laserActive, setLaserActive] = useState<boolean>(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // For interactive slides
  const periods = turbomachine.periods;
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(periods.length - 1);
  const currentPeriod = periods[selectedPeriodIndex] || periods[0];
  const [selectedChannelId, setSelectedChannelId] = useState<string>(currentPeriod?.channels[0]?.id || 'C1');

  const selectedChannel = currentPeriod?.channels.find((c) => c.id === selectedChannelId) || currentPeriod?.channels[0];

  // Previous period for delta
  const prevPeriod = selectedPeriodIndex > 0 ? periods[selectedPeriodIndex - 1] : undefined;
  const prevChannel = prevPeriod?.channels.find((c) => c.id === selectedChannelId);
  const delta = calculateDelta(prevChannel, selectedChannel);

  const totalSlides = 4;

  const handlePrevSlide = () => {
    setSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (laserActive) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col select-none overflow-hidden"
    >
      {/* Laser pointer circle */}
      {laserActive && (
        <div
          className="pointer-events-none fixed z-50 w-6 h-6 rounded-full bg-rose-500/80 shadow-[0_0_15px_#f43f5e] -translate-x-1/2 -translate-y-1/2"
          style={{ left: laserPos.x, top: laserPos.y }}
        />
      )}

      {/* Top Presentation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wider text-amber-400 uppercase text-[11px]">
            Presentación Interactiva de Órbitas
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-semibold">{turbomachine.fullName}</span>
          <span className="text-slate-500 hidden md:inline">· {turbomachine.company}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Laser Pointer */}
          <button
            onClick={() => setLaserActive(!laserActive)}
            className={`p-1.5 rounded transition-colors ${
              laserActive ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Puntero Láser Virtual"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>

          {/* Presenter Notes */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              showNotes
                ? 'bg-blue-900/60 border-blue-500 text-blue-300'
                : 'border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Notas Técnicas
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close presentation */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-900/50 rounded transition-colors"
            title="Salir del modo presentación (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-radial from-slate-900 to-slate-950">
        <div className="w-full max-w-6xl">
          {/* SLIDE 0: Cover / Resumen Ejecutivo */}
          {slideIndex === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 md:p-12 shadow-2xl text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950 border border-blue-700 rounded text-xs font-semibold text-blue-300 tracking-wide uppercase">
                Informe Diagnóstico de Turbomaquinaria
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Análisis de Órbitas y Dinámica de Rotor
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
                Evaluación cinemática y de vibración de cojinetes de película de aceite para{' '}
                <strong className="text-blue-400">{turbomachine.fullName}</strong>
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-800 text-left">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Empresa / Planta</span>
                  <div className="font-bold text-slate-200 mt-0.5">{turbomachine.company}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Especialista</span>
                  <div className="font-bold text-slate-200 mt-0.5">{turbomachine.analyst}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Velocidad Nominal</span>
                  <div className="font-bold text-slate-200 mt-0.5">{turbomachine.nominalRpm} RPM</div>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Campaña Temporal</span>
                  <div className="font-bold text-slate-200 mt-0.5">{periods.length} Meses Registrados</div>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleNextSlide}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded shadow-lg transition-transform hover:scale-105"
                >
                  Iniciar Presentación Técnica →
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 1: Interfaz Didáctica Interactiva (Power BI Experience) */}
          {slideIndex === 1 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Inspección por Mes:
                  </span>
                  <div className="flex items-center gap-1">
                    {periods.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPeriodIndex(idx)}
                        className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                          selectedPeriodIndex === idx
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {p.periodLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Canal:</span>
                  <select
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs font-semibold text-white focus:outline-blue-500"
                  >
                    {currentPeriod?.channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.code} ({ch.label})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Orbit Visualizer Card inside Slide */}
              <div className="bg-white rounded text-slate-900 shadow-xl overflow-hidden">
                {selectedChannel && (
                  <OrbitVisualizer
                    measurement={selectedChannel}
                    accentBorderColor="border-blue-900"
                  />
                )}
              </div>
            </div>
          )}

          {/* SLIDE 2: Comparación Cara a Cara de Períodos (Deltas & Aumentos) */}
          {slideIndex === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded border border-slate-800 text-center">
                <h2 className="text-xl font-bold text-white">
                  Comparativa de Evolución Temporal ({periods[0]?.periodLabel} vs {periods[periods.length - 1]?.periodLabel})
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Variación de amplitudes de vibración y verificación de estabilidad geométrica de la órbita.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Period 1 card */}
                {periods[0] && (
                  <div className="bg-white rounded text-slate-900 shadow-xl">
                    <div className="p-2.5 bg-blue-900 text-white font-bold text-xs flex justify-between">
                      <span>Línea Base: {periods[0].periodLabel}</span>
                      <span>Canal: {selectedChannelId}</span>
                    </div>
                    {periods[0].channels.find((c) => c.id === selectedChannelId) && (
                      <OrbitVisualizer
                        measurement={periods[0].channels.find((c) => c.id === selectedChannelId)!}
                        accentBorderColor="border-blue-700"
                      />
                    )}
                  </div>
                )}

                {/* Period 2 card */}
                {periods[1] && (
                  <div className="bg-white rounded text-slate-900 shadow-xl">
                    <div className="p-2.5 bg-indigo-900 text-white font-bold text-xs flex justify-between">
                      <span>Período Posterior: {periods[1].periodLabel}</span>
                      <span>Canal: {selectedChannelId}</span>
                    </div>
                    {periods[1].channels.find((c) => c.id === selectedChannelId) && (
                      <OrbitVisualizer
                        measurement={periods[1].channels.find((c) => c.id === selectedChannelId)!}
                        accentBorderColor="border-indigo-700"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 3: Conclusiones y Diagnóstico Didáctico */}
          {slideIndex === 3 && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 md:p-10 shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Conclusiones y Recomendaciones de Operación
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dictamen técnico elaborado conforme a criterios de confiabilidad para turbomáquinas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-sm">
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="font-bold text-blue-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Hallazgos Principales</span>
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>
                        En cojinetes de turbina (2TX/2TY) las amplitudes se mantienen dentro de los límites permisibles de la Zona A según ISO 7919-2.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        La anomalía registrada en febrero en el canal 1TX/1TY corresponde a deformación morfológica por ruido en línea de señal / gap y no a falla destructiva del eje.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        En marzo se restableció la geometría de órbita 1X normal tras verificación de borneras.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Plan de Acción Recomendado</span>
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">1.</span>
                      <span>Mantener monitoreo mensual de órbitas de rutina y seguimiento de tendencias.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">2.</span>
                      <span>Revisar apantallamiento de borneras de proximitor durante paradas programadas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">3.</span>
                      <span>Monitorear temperatura de aceite lubricante para evitar variaciones de viscosidad hidrodinámica.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Presenter Notes Bar at Bottom */}
      {showNotes && (
        <div className="bg-slate-900/95 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-[11px] uppercase">Nota del Presentador:</span>
            <span>
              {slideIndex === 0 && 'Presente el equipo, analista y alcance de la campaña de medición de vibración.'}
              {slideIndex === 1 && `Comentario mes actual: "${currentPeriod?.generalComment}"`}
              {slideIndex === 2 && delta.message}
              {slideIndex === 3 && 'Concluya con el plan de acción preventivo y disponibilidad operativa.'}
            </span>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Diapositiva {slideIndex + 1} de {totalSlides}
          </div>
        </div>
      )}

      {/* Bottom Navigation Controls */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center justify-between">
        <button
          onClick={handlePrevSlide}
          disabled={slideIndex === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                slideIndex === idx ? 'bg-blue-500 w-6' : 'bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNextSlide}
          disabled={slideIndex === totalSlides - 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition-colors"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
