import React, { useState, useRef } from 'react';
import { Turbomachine, ChannelMeasurement, PeriodReport } from '../types/turbomachine';
import { processOrbitImage, ProcessedOrbitResult } from '../services/orbitImageProcessor';
import { 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Cpu, 
  Layers, 
  ArrowRight,
  Eye,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';

interface SmartImageUploaderModalProps {
  turbines: Turbomachine[];
  activeTurbineId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyProcessedMeasurements: (updatedTurbines: Turbomachine[], targetTurbineId: string) => void;
}

export const SmartImageUploaderModal: React.FC<SmartImageUploaderModalProps> = ({
  turbines,
  activeTurbineId,
  isOpen,
  onClose,
  onApplyProcessedMeasurements,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<ProcessedOrbitResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  
  // Period configuration
  const [periodMode, setPeriodMode] = useState<'new' | 'existing'>('new');
  const [periodLabel, setPeriodLabel] = useState<string>(
    `Campaña ${new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' })}`
  );
  const [periodDate, setPeriodDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedExistingPeriodId, setSelectedExistingPeriodId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentTurbine = turbines.find((t) => t.id === activeTurbineId) || turbines[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    setProcessing(true);
    const newResults: ProcessedOrbitResult[] = [];

    for (const file of files) {
      try {
        const res = await processOrbitImage(file, turbines);
        // Si no empató con ninguna turbina, asignar la activa
        if (!res.matchedTurbineId) {
          res.matchedTurbineId = activeTurbineId;
        }
        newResults.push(res);
      } catch (err) {
        console.error('Error procesando imagen de órbita:', file.name, err);
      }
    }

    setResults((prev) => [...prev, ...newResults]);
    setProcessing(false);
  };

  const handleUpdateResultTurbine = (index: number, turbineId: string) => {
    setResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, matchedTurbineId: turbineId } : r))
    );
  };

  const handleUpdateResultBearing = (index: number, bearingName: string) => {
    setResults((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              measurement: { ...r.measurement, label: bearingName },
              extraction: { ...r.extraction, detectedBearingName: bearingName },
            }
          : r
      )
    );
  };

  const handleRemoveResult = (index: number) => {
    setResults((prev) => prev.filter((_, i) => i !== index));
    if (selectedResultIndex >= results.length - 1) {
      setSelectedResultIndex(Math.max(0, results.length - 2));
    }
  };

  const handleApplyAll = () => {
    if (results.length === 0) return;

    // Agrupar resultados por turbina de destino
    const updatedTurbines = [...turbines];

    results.forEach((res) => {
      const targetTurbineId = res.matchedTurbineId || activeTurbineId;
      const tIndex = updatedTurbines.findIndex((t) => t.id === targetTurbineId);
      if (tIndex === -1) return;

      const turbine = { ...updatedTurbines[tIndex] };
      const fullMeasurement: ChannelMeasurement = {
        id: `C-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code: res.measurement.code || `${turbine.tag}-ORBIT-${periodDate}`,
        label: res.measurement.label || 'Chumacera',
        probeXName: res.measurement.probeXName || '1TX',
        probeYName: res.measurement.probeYName || '1TY',
        unit: res.measurement.unit || 'mils',
        dateStr: `${periodDate} ${new Date().toLocaleTimeString('es-CO')}`,
        rpm: res.measurement.rpm || turbine.nominalRpm,
        freqHz: res.measurement.freqHz || +(turbine.nominalRpm / 60).toFixed(2),
        loadPct: res.measurement.loadPct || 100,
        xDiff: +(res.measurement.pkToPkX || 0.8).toFixed(3),
        yDiff: +(res.measurement.pkToPkY || 0.9).toFixed(3),
        pkToPkX: res.measurement.pkToPkX || 0.85,
        pkToPkY: res.measurement.pkToPkY || 0.91,
        pkPlusX: +((res.measurement.pkToPkX || 0.85) / 2).toFixed(3),
        pkMinusX: +((res.measurement.pkToPkX || 0.85) / 2).toFixed(3),
        crestX: 1.55,
        pkPlusY: +((res.measurement.pkToPkY || 0.91) / 2).toFixed(3),
        pkMinusY: +((res.measurement.pkToPkY || 0.91) / 2).toFixed(3),
        crestY: 1.58,
        rev: 0.35,
        valX: 0.36,
        valY: 0.25,
        angleDeg: res.measurement.angleDeg || 55,
        criticality: res.measurement.criticality || 'normal',
        patternType: res.measurement.patternType || '1X_normal',
        comment: res.measurement.comment || 'Medición orbital procesada.',
        recommendation: res.measurement.recommendation,
        imageUrl: res.measurement.imageUrl,
        vectorPoints: res.measurement.vectorPoints,
        keyphasorPoint: res.measurement.keyphasorPoint,
        aiExtraction: res.extraction,
      };

      if (periodMode === 'new') {
        // Buscar si ya creamos el nuevo período en este ciclo
        let targetPeriod = turbine.periods.find((p) => p.date === periodDate && p.periodLabel === periodLabel);
        if (!targetPeriod) {
          targetPeriod = {
            id: `period-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            periodLabel,
            displayTitle: `Orbitas ${turbine.name} ${periodLabel}`,
            date: periodDate,
            generalComment: `Campaña generada automáticamente mediante reconocimiento inteligente de capturas orbitales.`,
            selectedChannelId: fullMeasurement.id,
            overallCriticality: res.measurement.criticality || 'normal',
            channels: [fullMeasurement],
          };
          turbine.periods = [...turbine.periods, targetPeriod];
        } else {
          targetPeriod.channels.push(fullMeasurement);
        }
      } else {
        // Incorporar en período existente seleccionado
        const pIndex = turbine.periods.findIndex((p) => p.id === selectedExistingPeriodId);
        if (pIndex !== -1) {
          turbine.periods[pIndex].channels.push(fullMeasurement);
        } else {
          // Si no existe, agregar al último
          turbine.periods[turbine.periods.length - 1].channels.push(fullMeasurement);
        }
      }

      updatedTurbines[tIndex] = turbine;
    });

    onApplyProcessedMeasurements(updatedTurbines, activeTurbineId);
    onClose();
  };

  const selectedResult = results[selectedResultIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Carga Inteligente de Órbitas por IA (Offline)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  100% Local · Confidencial
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Arrastra las capturas de pantalla del analizador. El sistema reconocerá la turbina, el apoyo y digitalizará la órbita.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-slate-800 rounded-full text-blue-400 ring-4 ring-slate-800/80">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-white">Haz clic para seleccionar imágenes</span> o arrástralas aquí
              </div>
              <p className="text-xs text-slate-400">
                Admite capturas de System 1, CSI 2140, ADRE, SKF, Bently Nevada (.png, .jpg, .bmp)
              </p>
            </div>
          </div>

          {/* Processing Indicator */}
          {processing && (
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-950/40 border border-blue-800/50 rounded-lg text-blue-300 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Analizando geometrías de órbita y leyendo metadatos de las capturas...</span>
            </div>
          )}

          {/* Results List and Detailed Preview */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Imágenes Reconocidas ({results.length})
                </h3>
                <span className="text-xs text-slate-400">
                  Revisa y ajusta las asignaciones antes de confirmar
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Thumbnails List */}
                <div className="lg:col-span-5 space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {results.map((res, idx) => {
                    const isSelected = idx === selectedResultIndex;
                    const turbine = turbines.find((t) => t.id === res.matchedTurbineId);

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedResultIndex(idx)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={res.annotatedPreviewUrl || res.measurement.imageUrl}
                            alt="Órbita"
                            className="w-12 h-12 object-cover rounded border border-slate-600 bg-black shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {res.extraction.detectedBearingName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="text-blue-400 font-semibold">{turbine?.name || 'TG'}</span>
                              <span>·</span>
                              <span>{res.extraction.detectedPkToPkX?.toFixed(2)}x{res.extraction.detectedPkToPkY?.toFixed(2)} mils</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] bg-slate-700/80 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                                {res.extraction.pointsCount} pts vectoriales
                              </span>
                              <span className="text-[10px] bg-emerald-900/40 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                                {res.extraction.confidence}% Confianza
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveResult(idx);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Eliminar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Item Editor */}
                {selectedResult && (
                  <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-semibold text-slate-300">
                        Detalle y Validación del Cojinete
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {selectedResult.extraction.sourceFileName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Image Preview */}
                      <div className="flex flex-col items-center justify-center bg-black/60 rounded-lg p-2 border border-slate-800">
                        <img
                          src={selectedResult.annotatedPreviewUrl}
                          alt="Detección de Órbita"
                          className="max-h-48 object-contain rounded"
                        />
                        <span className="text-[10px] text-emerald-400 mt-1 font-mono">
                          ✓ Traza vectorizada en verde superpuesta
                        </span>
                      </div>

                      {/* Form Fields */}
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-slate-400 font-medium block mb-1">
                            Turbogenerador Asignado:
                          </label>
                          <select
                            value={selectedResult.matchedTurbineId}
                            onChange={(e) =>
                              handleUpdateResultTurbine(selectedResultIndex, e.target.value)
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                          >
                            {turbines.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} - {t.fullName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 font-medium block mb-1">
                            Apoyo / Chumacera:
                          </label>
                          <input
                            type="text"
                            value={selectedResult.extraction.detectedBearingName}
                            onChange={(e) =>
                              handleUpdateResultBearing(selectedResultIndex, e.target.value)
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 block">Pk-Pk X (mils):</span>
                            <span className="font-mono font-bold text-white">
                              {selectedResult.extraction.detectedPkToPkX?.toFixed(3)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Pk-Pk Y (mils):</span>
                            <span className="font-mono font-bold text-white">
                              {selectedResult.extraction.detectedPkToPkY?.toFixed(3)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Fase 1X:</span>
                            <span className="font-mono font-bold text-white">
                              {selectedResult.extraction.detectedPhaseAngle}°
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Velocidad:</span>
                            <span className="font-mono font-bold text-white">
                              {selectedResult.extraction.detectedRpm} RPM
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-slate-400 block text-[11px] mb-1">Diagnóstico Automático:</span>
                          <p className="text-[11px] text-slate-300 italic bg-slate-800/40 p-2 rounded">
                            "{selectedResult.measurement.comment}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Destination Campaign Settings */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Campaña o Período de Destino:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Nombre de la Campaña:</label>
                    <input
                      type="text"
                      value={periodLabel}
                      onChange={(e) => setPeriodLabel(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                      placeholder="Ej: Mayo 2026"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Fecha de Medición:</label>
                    <input
                      type="date"
                      value={periodDate}
                      onChange={(e) => setPeriodDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <span className="text-[11px] text-slate-400">
                      Se generará o actualizará el período con las órbitas vectorizadas interactivas.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleApplyAll}
            disabled={results.length === 0}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              results.length > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Incorporar {results.length} Órbita(s) a la Base de Datos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
