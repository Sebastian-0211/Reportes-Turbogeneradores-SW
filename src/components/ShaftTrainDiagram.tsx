import React from 'react';
import { Turbomachine, ChannelMeasurement, CriticalityLevel } from '../types/turbomachine';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';

interface ShaftTrainDiagramProps {
  turbomachine: Turbomachine;
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  activePeriodId?: string;
}

export const ShaftTrainDiagram: React.FC<ShaftTrainDiagramProps> = ({
  turbomachine,
  selectedChannelId,
  onSelectChannel,
  activePeriodId,
}) => {
  const activePeriod = turbomachine.periods.find((p) => p.id === activePeriodId) || turbomachine.periods[turbomachine.periods.length - 1];
  const channels = activePeriod?.channels || [];

  const getCriticalityColor = (level: CriticalityLevel) => {
    switch (level) {
      case 'critico':
        return {
          bg: 'bg-rose-500',
          border: 'border-rose-500',
          ring: 'ring-rose-500/40',
          text: 'text-rose-400',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
        };
      case 'alerta':
        return {
          bg: 'bg-orange-500',
          border: 'border-orange-500',
          ring: 'ring-orange-500/40',
          text: 'text-orange-400',
          badge: 'bg-orange-950/80 text-orange-300 border-orange-800',
        };
      case 'vigilancia':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-500',
          ring: 'ring-amber-500/40',
          text: 'text-amber-400',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-800',
        };
      case 'normal':
      default:
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-500',
          ring: 'ring-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-white">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Tren Cinemático y Monitoreo de Chumaceras
              <span className="text-[11px] font-mono font-normal text-slate-400">
                ({turbomachine.name} · {channels.length} Apoyos Instrumentados)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Haz clic en cualquier chumacera para inspeccionar su órbita y comportamiento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Zona A/B (Normal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Vigilancia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>Zona C (Alerta)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Zona D (Crítico)</span>
          </div>
        </div>
      </div>

      {/* Schematic Diagram */}
      <div className="relative overflow-x-auto py-6 px-4 bg-slate-950/60 rounded-lg border border-slate-800/80">
        <div className="min-w-[800px] flex items-center justify-between relative">
          {/* Continuous Centerline Shaft (Eje del tren) */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 rounded-full shadow-inner z-0 border border-slate-500/50"></div>

          {/* Machine Sections: Turbina, Reductor, Generador */}
          <div className="relative z-10 w-full flex items-center justify-between gap-4">
            {/* 1. SECCIÓN TURBINA */}
            <div className="flex-1 max-w-[260px] bg-gradient-to-b from-blue-950/80 to-slate-900/90 border border-blue-500/30 rounded-xl p-3 relative shadow-md">
              <div className="text-[10px] uppercase tracking-wider font-bold text-blue-400 text-center mb-2">
                Turbina de Vapor
              </div>
              <div className="flex items-center justify-around gap-2">
                {/* Apoyos de la turbina (C1 y C2 típicamente) */}
                {channels.slice(0, 2).map((ch, idx) => {
                  const isSelected = ch.id === selectedChannelId;
                  const colors = getCriticalityColor(ch.criticality);
                  const maxPkToPk = Math.max(ch.pkToPkX, ch.pkToPkY);

                  return (
                    <button
                      key={ch.id}
                      onClick={() => onSelectChannel(ch.id)}
                      className={`relative flex flex-col items-center p-2 rounded-lg transition-all text-center group cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 ring-2 ring-blue-400 scale-105 shadow-lg'
                          : 'bg-slate-800/80 hover:bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 ${colors.border} flex items-center justify-center font-bold text-xs text-white bg-slate-950 shadow-md ${isSelected ? colors.ring + ' ring-4' : ''}`}>
                        {idx + 1}
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 mt-1 max-w-[90px] truncate">
                        {ch.probeXName}/{ch.probeYName}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                        {idx === 0 ? 'L. Libre' : 'L. Acople'}
                      </span>
                      <div className={`mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded border ${colors.badge}`}>
                        {maxPkToPk.toFixed(2)} mils
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Acople Flexible 1 */}
            <div className="w-10 flex flex-col items-center justify-center z-10 text-slate-500 text-[9px] font-mono">
              <div className="w-4 h-8 bg-slate-700 border border-slate-500 rounded-sm shadow-sm flex items-center justify-center">
                <div className="w-1 h-6 bg-amber-400/60 rounded"></div>
              </div>
              <span>Acople</span>
            </div>

            {/* 2. SECCIÓN CAJA REDUCTORA */}
            <div className="flex-1 max-w-[260px] bg-gradient-to-b from-amber-950/40 to-slate-900/90 border border-amber-500/30 rounded-xl p-3 relative shadow-md">
              <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400 text-center mb-2">
                Caja Reductora
              </div>
              <div className="flex items-center justify-around gap-2">
                {channels.slice(2, 4).map((ch, idx) => {
                  const isSelected = ch.id === selectedChannelId;
                  const colors = getCriticalityColor(ch.criticality);
                  const maxPkToPk = Math.max(ch.pkToPkX, ch.pkToPkY);

                  return (
                    <button
                      key={ch.id}
                      onClick={() => onSelectChannel(ch.id)}
                      className={`relative flex flex-col items-center p-2 rounded-lg transition-all text-center group cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600/20 ring-2 ring-amber-400 scale-105 shadow-lg'
                          : 'bg-slate-800/80 hover:bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 ${colors.border} flex items-center justify-center font-bold text-xs text-white bg-slate-950 shadow-md ${isSelected ? colors.ring + ' ring-4' : ''}`}>
                        {idx + 3}
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 mt-1 max-w-[90px] truncate">
                        {ch.probeXName}/{ch.probeYName}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                        {idx === 0 ? 'Entrada Red' : 'Salida Red'}
                      </span>
                      <div className={`mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded border ${colors.badge}`}>
                        {maxPkToPk.toFixed(2)} mils
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Acople Flexible 2 */}
            <div className="w-10 flex flex-col items-center justify-center z-10 text-slate-500 text-[9px] font-mono">
              <div className="w-4 h-8 bg-slate-700 border border-slate-500 rounded-sm shadow-sm flex items-center justify-center">
                <div className="w-1 h-6 bg-cyan-400/60 rounded"></div>
              </div>
              <span>Acople</span>
            </div>

            {/* 3. SECCIÓN GENERADOR */}
            <div className="flex-1 max-w-[260px] bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border border-cyan-500/30 rounded-xl p-3 relative shadow-md">
              <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 text-center mb-2">
                Generador Eléctrico
              </div>
              <div className="flex items-center justify-around gap-2">
                {channels.slice(4, 6).map((ch, idx) => {
                  const isSelected = ch.id === selectedChannelId;
                  const colors = getCriticalityColor(ch.criticality);
                  const maxPkToPk = Math.max(ch.pkToPkX, ch.pkToPkY);

                  return (
                    <button
                      key={ch.id}
                      onClick={() => onSelectChannel(ch.id)}
                      className={`relative flex flex-col items-center p-2 rounded-lg transition-all text-center group cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-600/20 ring-2 ring-cyan-400 scale-105 shadow-lg'
                          : 'bg-slate-800/80 hover:bg-slate-700/80'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 ${colors.border} flex items-center justify-center font-bold text-xs text-white bg-slate-950 shadow-md ${isSelected ? colors.ring + ' ring-4' : ''}`}>
                        {idx + 5}
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 mt-1 max-w-[90px] truncate">
                        {ch.probeXName}/{ch.probeYName}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                        {idx === 0 ? 'L. Acople Gen' : 'L. Libre Gen'}
                      </span>
                      <div className={`mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded border ${colors.badge}`}>
                        {maxPkToPk.toFixed(2)} mils
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
