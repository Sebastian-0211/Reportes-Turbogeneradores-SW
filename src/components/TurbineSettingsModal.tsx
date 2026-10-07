import React, { useState } from 'react';
import { Turbomachine } from '../types/turbomachine';
import { Settings, Save, X, Building, User, Gauge, Zap } from 'lucide-react';

interface TurbineSettingsModalProps {
  turbomachine: Turbomachine;
  onSave: (updated: Turbomachine) => void;
  onClose: () => void;
}

export const TurbineSettingsModal: React.FC<TurbineSettingsModalProps> = ({
  turbomachine,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState<string>(turbomachine.name);
  const [fullName, setFullName] = useState<string>(turbomachine.fullName);
  const [tag, setTag] = useState<string>(turbomachine.tag);
  const [company, setCompany] = useState<string>(turbomachine.company);
  const [analyst, setAnalyst] = useState<string>(turbomachine.analyst);
  const [nominalRpm, setNominalRpm] = useState<number>(turbomachine.nominalRpm);
  const [ratedPowerMW, setRatedPowerMW] = useState<number>(turbomachine.ratedPowerMW);

  const handleSave = () => {
    onSave({
      ...turbomachine,
      name,
      fullName,
      tag,
      company,
      analyst,
      nominalRpm,
      ratedPowerMW,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto select-none">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Configuración de Turbogenerador & Datos de Planta
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nombre Corto (Pestaña):</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-blue-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tag Identificador:</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Descripción Completa del Equipo:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Empresa / Planta Industrial:</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Especialista / Analista:</label>
              <input
                type="text"
                value={analyst}
                onChange={(e) => setAnalyst(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Velocidad Nominal (RPM):</label>
              <input
                type="number"
                value={nominalRpm}
                onChange={(e) => setNominalRpm(parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Potencia Eléctrica (MW):</label>
              <input
                type="number"
                step="0.1"
                value={ratedPowerMW}
                onChange={(e) => setRatedPowerMW(parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Ajustes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
