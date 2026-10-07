import React, { useState } from 'react';
import { Turbomachine, BearingSupportConfig, ChannelMeasurement, PeriodReport } from '../types/turbomachine';
import { X, Plus, Trash2, Cpu, CheckCircle2, ChevronRight, ChevronLeft, Upload, Camera } from 'lucide-react';

interface CreateTurbineWizardProps {
  onSaveTurbine: (turbine: Turbomachine) => void;
  onClose: () => void;
  defaultCompany: string;
  defaultAnalyst: string;
}

export const CreateTurbineWizard: React.FC<CreateTurbineWizardProps> = ({
  onSaveTurbine,
  onClose,
  defaultCompany,
  defaultAnalyst,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Basic Machine Info
  const [name, setName] = useState<string>('TG5');
  const [fullName, setFullName] = useState<string>('Turbogenerador TG5 (Turbina a Vapor)');
  const [tag, setTag] = useState<string>('TG5-1X');
  const [nominalRpm, setNominalRpm] = useState<number>(7080);
  const [ratedPowerMW, setRatedPowerMW] = useState<number>(30.0);
  const [company, setCompany] = useState<string>(defaultCompany);
  const [analyst, setAnalyst] = useState<string>(defaultAnalyst);

  // Step 2: Bearing Supports & Proximitors
  const [supports, setSupports] = useState<BearingSupportConfig[]>([
    {
      id: 'A1',
      number: 1,
      name: 'Apoyo 1 - L. Libre Turbina',
      shaftSection: 'turbina',
      proximitorsCount: 2,
      probeXName: '1TX',
      probeYName: '1TY',
    },
    {
      id: 'A2',
      number: 2,
      name: 'Apoyo 2 - L. Acople Turbina',
      shaftSection: 'turbina',
      proximitorsCount: 2,
      probeXName: '2TX',
      probeYName: '2TY',
    },
    {
      id: 'A3',
      number: 3,
      name: 'Apoyo 3 - L. Acople Generador',
      shaftSection: 'generador',
      proximitorsCount: 2,
      probeXName: '3TX',
      probeYName: '3TY',
    },
    {
      id: 'A4',
      number: 4,
      name: 'Apoyo 4 - L. Libre Generador',
      shaftSection: 'generador',
      proximitorsCount: 2,
      probeXName: '4TX',
      probeYName: '4TY',
    },
  ]);

  // Step 3: Initial Period
  const [periodLabel, setPeriodLabel] = useState<string>('Octubre 2026');
  const [periodDate, setPeriodDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [supportImages, setSupportImages] = useState<Record<string, string>>({});

  // Add support handler
  const handleAddSupport = () => {
    const nextNum = supports.length + 1;
    const newSupport: BearingSupportConfig = {
      id: `A${nextNum}`,
      number: nextNum,
      name: `Apoyo ${nextNum} - Cojinete Eje`,
      shaftSection: 'turbina',
      proximitorsCount: 2,
      probeXName: `${nextNum}TX`,
      probeYName: `${nextNum}TY`,
    };
    setSupports([...supports, newSupport]);
  };

  // Remove support handler
  const handleRemoveSupport = (id: string) => {
    if (supports.length <= 1) return;
    setSupports(supports.filter((s) => s.id !== id));
  };

  // Update support
  const handleUpdateSupport = (id: string, field: keyof BearingSupportConfig, val: any) => {
    setSupports(
      supports.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: val };
        }
        return s;
      })
    );
  };

  // Image upload handler for step 3
  const handleImageFile = (supportId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSupportImages((prev) => ({ ...prev, [supportId]: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Finish and build turbomachine
  const handleFinish = () => {
    const turbomachineId = name.toLowerCase().replace(/\s+/g, '-');

    const channels: ChannelMeasurement[] = supports.map((s) => ({
      id: `C${s.number}`,
      bearingId: s.id,
      code: `${tag}-C${s.number}-${periodDate.split('-').reverse().join('-')}`,
      label: `${s.probeXName}/${s.probeYName} - ${s.name.toUpperCase()}`,
      probeXName: s.probeXName,
      probeYName: s.probeYName,
      unit: 'mils',
      dateStr: `${periodDate} 10:00:00 a. m.`,
      rpm: nominalRpm,
      freqHz: +(nominalRpm / 60).toFixed(2),
      loadPct: 100.0,
      xDiff: 0.85,
      yDiff: 0.89,
      pkToPkX: 0.82,
      pkToPkY: 0.88,
      pkPlusX: 0.43,
      pkMinusX: 0.39,
      crestX: 1.55,
      pkPlusY: 0.45,
      pkMinusY: 0.43,
      crestY: 1.58,
      rev: 0.35,
      valX: 0.36,
      valY: 0.25,
      angleDeg: 52.0,
      criticality: 'normal',
      patternType: '1X_normal',
      comment: `Línea base para ${s.name}. Amplitudes dentro de tolerancia.`,
      imageUrl: supportImages[s.id],
    }));

    const initialPeriod: PeriodReport = {
      id: `period-${Date.now()}`,
      periodLabel,
      displayTitle: `Orbitas ${name} ${periodLabel}`,
      date: periodDate,
      selectedChannelId: channels[0]?.id || 'C1',
      overallCriticality: 'normal',
      generalComment: `Campaña inicial registrada para la unidad ${name} con ${supports.length} apoyos inspeccionados.`,
      channels,
    };

    const newTurbomachine: Turbomachine = {
      id: turbomachineId,
      name,
      fullName,
      tag,
      nominalRpm,
      ratedPowerMW,
      company,
      analyst,
      bearingSupports: supports,
      periods: [initialPeriod],
    };

    onSaveTurbine(newTurbomachine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto select-none">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden my-4">
        {/* Wizard Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Asistente de Creación de Turbogenerador
              </h3>
              <p className="text-[11px] text-slate-400">
                Paso {step} de 3 · Configuración de apoyos, proximitores y carga de imágenes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Steps */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-semibold ${step === 1 ? 'text-blue-900' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'}`}>1</span>
            <span>Datos Generales</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 font-semibold ${step === 2 ? 'text-blue-900' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'}`}>2</span>
            <span>Apoyos & Proximitores</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 font-semibold ${step === 3 ? 'text-blue-900' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'}`}>3</span>
            <span>Carga de Órbitas</span>
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* STEP 1: General Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nombre / Identificador Corto:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setTag(`${e.target.value.toUpperCase()}-1X`);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-blue-900 text-sm"
                    placeholder="ej. TG5 o TV1"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tag del Tren de Máquinas:</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs"
                    placeholder="ej. TG5-1X"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descripción Completa del Turbogenerador:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  placeholder="ej. Turbogenerador TG5 (Turbina a Vapor de Extracción)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Velocidad Nominal de Giro (RPM):</label>
                  <input
                    type="number"
                    value={nominalRpm}
                    onChange={(e) => setNominalRpm(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Potencia Eléctrica Nominal (MW):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ratedPowerMW}
                    onChange={(e) => setRatedPowerMW(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Empresa / Planta:</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Analista de Vibraciones:</label>
                  <input
                    type="text"
                    value={analyst}
                    onChange={(e) => setAnalyst(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Bearings & Proximitors Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Apoyos (Chumaceras) y Proximitores del Eje
                  </h4>
                  <p className="text-slate-500 text-xs">
                    Define cada punto de apoyo y sus pares de sensores ortogonales X e Y.
                  </p>
                </div>
                <button
                  onClick={handleAddSupport}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Apoyo</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {supports.map((sup, idx) => (
                  <div key={sup.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>

                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-[10px] text-slate-500 font-semibold">Nombre del Apoyo / Cojinete:</label>
                      <input
                        type="text"
                        value={sup.name}
                        onChange={(e) => handleUpdateSupport(sup.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-medium"
                      />
                    </div>

                    <div className="w-32">
                      <label className="block text-[10px] text-slate-500 font-semibold">Sección del Eje:</label>
                      <select
                        value={sup.shaftSection}
                        onChange={(e) => handleUpdateSupport(sup.id, 'shaftSection', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      >
                        <option value="turbina">Turbina</option>
                        <option value="reductor">Caja Reductora</option>
                        <option value="generador">Generador</option>
                        <option value="auxiliar">Auxiliar / Excitatriz</option>
                      </select>
                    </div>

                    <div className="w-20">
                      <label className="block text-[10px] text-slate-500 font-semibold">Sonda X:</label>
                      <input
                        type="text"
                        value={sup.probeXName}
                        onChange={(e) => handleUpdateSupport(sup.id, 'probeXName', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-xs font-bold text-blue-900"
                      />
                    </div>

                    <div className="w-20">
                      <label className="block text-[10px] text-slate-500 font-semibold">Sonda Y:</label>
                      <input
                        type="text"
                        value={sup.probeYName}
                        onChange={(e) => handleUpdateSupport(sup.id, 'probeYName', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-mono text-xs font-bold text-blue-900"
                      />
                    </div>

                    {supports.length > 1 && (
                      <button
                        onClick={() => handleRemoveSupport(sup.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors self-end mb-0.5"
                        title="Eliminar este apoyo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Initial Period & Orbit Images per Support */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nombre de la Campaña / Mes:</label>
                  <input
                    type="text"
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold text-xs"
                    placeholder="ej. Octubre 2026"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha de Toma:</label>
                  <input
                    type="date"
                    value={periodDate}
                    onChange={(e) => setPeriodDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold text-xs"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  Carga de Imágenes de Órbitas por Cada Apoyo
                </h4>
                <p className="text-slate-500 text-xs mb-3">
                  Puedes cargar ahora las capturas de Bently Nevada / System 1 para cada apoyo creado, o hacerlo más adelante desde la vista principal.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supports.map((sup) => (
                    <div key={sup.id} className="p-3 border border-slate-200 rounded bg-white shadow-2xs space-y-2">
                      <div className="flex items-center justify-between font-semibold text-xs text-slate-800">
                        <span>{sup.name}</span>
                        <span className="font-mono text-blue-900 font-bold">{sup.probeXName}/{sup.probeYName}</span>
                      </div>

                      {supportImages[sup.id] ? (
                        <div className="relative rounded overflow-hidden border border-slate-200 bg-black">
                          <img
                            src={supportImages[sup.id]}
                            alt={sup.name}
                            className="max-h-28 w-full object-contain mx-auto"
                          />
                          <button
                            onClick={() =>
                              setSupportImages((prev) => {
                                const next = { ...prev };
                                delete next[sup.id];
                                return next;
                              })
                            }
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded text-[10px] hover:bg-rose-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
                          <Camera className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-[11px] font-semibold text-blue-700">Subir Captura de Órbita</span>
                          <span className="text-[9px] text-slate-400">PNG, JPG de Bently Nevada</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageFile(sup.id, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Crear Turbogenerador</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
