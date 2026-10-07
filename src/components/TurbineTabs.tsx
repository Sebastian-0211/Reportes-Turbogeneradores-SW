import React from 'react';
import { Turbomachine } from '../types/turbomachine';
import { Plus, Cpu } from 'lucide-react';

interface TurbineTabsProps {
  turbines: Turbomachine[];
  activeTurbineId: string;
  onSelectTurbine: (id: string) => void;
  onAddTurbine: () => void;
}

export const TurbineTabs: React.FC<TurbineTabsProps> = ({
  turbines,
  activeTurbineId,
  onSelectTurbine,
  onAddTurbine,
}) => {
  return (
    <div className="bg-slate-200 border-t border-slate-300 px-3 py-1 flex items-center gap-1 overflow-x-auto shadow-inner select-none">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 hidden sm:block">
        Unidades:
      </div>

      <div className="flex items-center gap-1">
        {turbines.map((t) => {
          const isActive = t.id === activeTurbineId;
          const latestPeriod = t.periods[t.periods.length - 1];
          const hasAlert = latestPeriod?.overallCriticality === 'alerta' || latestPeriod?.overallCriticality === 'vigilancia';
          const isCritical = latestPeriod?.overallCriticality === 'critico';

          return (
            <button
              key={t.id}
              onClick={() => onSelectTurbine(t.id)}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-all ${
                isActive
                  ? 'bg-white text-slate-900 border-slate-300 shadow-xs relative top-[1px]'
                  : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{t.name}</span>
              {isCritical && (
                <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200" title="Alarma crítica" />
              )}
              {hasAlert && !isCritical && (
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200" title="Alerta o vigilancia" />
              )}
            </button>
          );
        })}

        <button
          onClick={onAddTurbine}
          className="p-1.5 rounded hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-colors ml-1"
          title="Agregar nuevo turbogenerador"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="ml-auto text-[11px] text-slate-500 hidden md:block">
        ISO 7919-2 / ISO 10816-3 · Sensores de Proximidad Ortogonales X-Y
      </div>
    </div>
  );
};
