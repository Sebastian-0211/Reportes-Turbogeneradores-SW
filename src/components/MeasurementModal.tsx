import React, { useState } from 'react';
import { Turbomachine, ChannelMeasurement, PeriodReport, CriticalityLevel, OrbitPattern } from '../types/turbomachine';
import { X, Upload, Camera, Save, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MeasurementModalProps {
  turbomachine: Turbomachine;
  mode: 'edit_channel' | 'add_period';
  periodId?: string;
  channelId?: string;
  onClose: () => void;
  onSaveTurbomachine: (updated: Turbomachine) => void;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({
  turbomachine,
  mode,
  periodId,
  channelId,
  onClose,
  onSaveTurbomachine,
}) => {
  // If mode is 'add_period'
  const [newPeriodLabel, setNewPeriodLabel] = useState<string>('Abril 2026');
  const [newPeriodDate, setNewPeriodDate] = useState<string>('2026-04-10');
  const [newPeriodComment, setNewPeriodComment] = useState<string>(
    'Campaña de medición mensual. Todos los cojinetes dentro de tolerancias operativas.'
  );

  // If mode is 'edit_channel'
  const activePeriod = turbomachine.periods.find((p) => p.id === periodId) || turbomachine.periods[0];
  const activeChannel = activePeriod?.channels.find((c) => c.id === channelId) || activePeriod?.channels[0];

  const [code, setCode] = useState<string>(activeChannel?.code || '');
  const [label, setLabel] = useState<string>(activeChannel?.label || '');
  const [probeX, setProbeX] = useState<string>(activeChannel?.probeXName || '1TX');
  const [probeY, setProbeY] = useState<string>(activeChannel?.probeYName || '1TY');
  const [unit, setUnit] = useState<'mils' | 'microns'>(activeChannel?.unit || 'mils');
  const [rpm, setRpm] = useState<number>(activeChannel?.rpm || 7080);
  const [loadPct, setLoadPct] = useState<number>(activeChannel?.loadPct || 100);
  const [pkToPkX, setPkToPkX] = useState<number>(activeChannel?.pkToPkX || 0.85);
  const [pkToPkY, setPkToPkY] = useState<number>(activeChannel?.pkToPkY || 0.91);
  const [angleDeg, setAngleDeg] = useState<number>(activeChannel?.angleDeg || 55);
  const [criticality, setCriticality] = useState<CriticalityLevel>(activeChannel?.criticality || 'normal');
  const [patternType, setPatternType] = useState<OrbitPattern>(activeChannel?.patternType || '1X_normal');
  const [comment, setComment] = useState<string>(activeChannel?.comment || '');
  const [recommendation, setRecommendation] = useState<string>(activeChannel?.recommendation || '');
  const [imageUrl, setImageUrl] = useState<string | undefined>(activeChannel?.imageUrl);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (mode === 'add_period') {
      // Clone base channels from latest period with new dates and reset values
      const basePeriod = turbomachine.periods[turbomachine.periods.length - 1] || turbomachine.periods[0];
      const newChannels: ChannelMeasurement[] = basePeriod.channels.map((ch) => ({
        ...ch,
        code: `${turbomachine.tag}-${ch.id}-${newPeriodDate.split('-').reverse().join('-')}`,
        dateStr: `${newPeriodDate} 10:00:00 a. m.`,
        comment: 'Medición registrada para el período.',
        imageUrl: undefined,
      }));

      const newP: PeriodReport = {
        id: `period-${Date.now()}`,
        periodLabel: newPeriodLabel,
        displayTitle: `Orbitas ${turbomachine.name} ${newPeriodLabel}`,
        date: newPeriodDate,
        generalComment: newPeriodComment,
        selectedChannelId: newChannels[0]?.id || 'C1',
        overallCriticality: 'normal',
        channels: newChannels,
      };

      const updated = {
        ...turbomachine,
        periods: [...turbomachine.periods, newP],
      };
      onSaveTurbomachine(updated);
      onClose();
    } else {
      // Edit channel
      if (!activePeriod || !activeChannel) return;

      const updatedPeriods = turbomachine.periods.map((p) => {
        if (p.id === activePeriod.id) {
          const updatedChannels = p.channels.map((ch) => {
            if (ch.id === activeChannel.id) {
              return {
                ...ch,
                code,
                label,
                probeXName: probeX,
                probeYName: probeY,
                unit,
                rpm,
                loadPct,
                pkToPkX,
                pkToPkY,
                angleDeg,
                criticality,
                patternType,
                comment,
                recommendation,
                imageUrl,
              };
            }
            return ch;
          });
          return { ...p, channels: updatedChannels };
        }
        return p;
      });

      onSaveTurbomachine({ ...turbomachine, periods: updatedPeriods });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm tracking-wide">
              {mode === 'add_period' ? 'Agregar Nueva Campaña / Mes de Órbitas' : `Editar Medición: ${activeChannel?.label || ''}`}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {mode === 'add_period' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre / Etiqueta del Mes:</label>
                <input
                  type="text"
                  value={newPeriodLabel}
                  onChange={(e) => setNewPeriodLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="ej. Abril 2026"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fecha de Medición:</label>
                <input
                  type="date"
                  value={newPeriodDate}
                  onChange={(e) => setNewPeriodDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Comentario General del Reporte:</label>
                <textarea
                  value={newPeriodComment}
                  onChange={(e) => setNewPeriodComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 font-sans"
                  placeholder="Observaciones generales sobre la condición del turbogenerador..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900 text-xs">
                Se creará automáticamente la plantilla de canales (C1 a C8) para el turbogenerador <strong>{turbomachine.name}</strong>, permitiendo cargar las imágenes y valores correspondientes para este nuevo mes.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Código de Medición (Slicer Name):</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ubicación / Cojinete:</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Sondas X & Y, Unidades, RPM */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Sonda X:</label>
                  <input
                    type="text"
                    value={probeX}
                    onChange={(e) => setProbeX(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Sonda Y:</label>
                  <input
                    type="text"
                    value={probeY}
                    onChange={(e) => setProbeY(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Unidades:</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'mils' | 'microns')}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-medium"
                  >
                    <option value="mils">mils (milésimas de pulgada)</option>
                    <option value="microns">microns (µm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">RPM de Operación:</label>
                  <input
                    type="number"
                    value={rpm}
                    onChange={(e) => setRpm(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              {/* Amplitudes Pk-to-Pk */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pk-to-Pk Sonda X ({unit}):</label>
                  <input
                    type="number"
                    step="0.001"
                    value={pkToPkX}
                    onChange={(e) => setPkToPkX(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pk-to-Pk Sonda Y ({unit}):</label>
                  <input
                    type="number"
                    step="0.001"
                    value={pkToPkY}
                    onChange={(e) => setPkToPkY(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ángulo Fase (Keyphasor):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={angleDeg}
                    onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              {/* Criticidad y Patrón de Órbita */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nivel de Criticidad (ISO 7919-2):</label>
                  <select
                    value={criticality}
                    onChange={(e) => setCriticality(e.target.value as CriticalityLevel)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold text-xs"
                  >
                    <option value="normal">🟢 Normal - Zona A (Excelente)</option>
                    <option value="alerta">🟡 Alerta - Zona B (Operación aceptable)</option>
                    <option value="vigilancia">🟠 Vigilancia - Zona C (Alarma / Seguimiento)</option>
                    <option value="critico">🔴 Crítico - Zona D (Peligro de daño)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Morfología de Órbita:</label>
                  <select
                    value={patternType}
                    onChange={(e) => setPatternType(e.target.value as OrbitPattern)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium text-xs"
                  >
                    <option value="1X_normal">Elíptica Sincrónica 1X (Normal)</option>
                    <option value="unbalance_1X">Circular 1X Alta (Desbalance)</option>
                    <option value="misalignment_2X">Figura en Ocho 2X (Desalineación)</option>
                    <option value="oil_whirl_sub">Lazo Subsincrónico (Oil Whirl/Whip)</option>
                    <option value="rubbing_contact">Órbita Truncada (Roce Mecánico)</option>
                    <option value="sensor_defect">Defecto de toma / Ruido en Cable</option>
                  </select>
                </div>
              </div>

              {/* Upload image capture */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Imagen Capturada de Órbita (Bently Nevada / System 1):
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded p-4 text-center hover:border-blue-500 transition-colors bg-slate-50">
                  {imageUrl ? (
                    <div className="space-y-2">
                      <img src={imageUrl} alt="Captura de órbita" className="max-h-36 mx-auto rounded shadow-sm object-contain" />
                      <div className="flex justify-center gap-2">
                        <label className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold cursor-pointer hover:bg-blue-700">
                          Cambiar Imagen
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => setImageUrl(undefined)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-semibold hover:bg-rose-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-1">
                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-blue-700">Haz clic para cargar imagen o arrástrala aquí</span>
                      <p className="text-[10px] text-slate-500">Soporta PNG, JPG, JPEG o capturas de pantalla de osciloscopio</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Comments & Recommendations */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Comentario Técnico:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-sans"
                  placeholder="Detalla la condición observada en la órbita..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Recomendación para Confiabilidad:</label>
                <textarea
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-sans"
                  placeholder="Acciones preventivas, revisión de gap o inspección..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{mode === 'add_period' ? 'Crear Período' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
