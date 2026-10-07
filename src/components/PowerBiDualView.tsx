import React, { useState } from 'react';
import { Turbomachine, PeriodReport, ChannelMeasurement, CriticalityLevel } from '../types/turbomachine';
import { OrbitVisualizer } from './OrbitVisualizer';
import { calculateDelta } from '../utils/orbitMath';
import { 
  Building2, 
  Edit3, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Link2, 
  Unlink, 
  Upload, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface PowerBiDualViewProps {
  turbomachine: Turbomachine;
  onUpdateTurbomachine: (updated: Turbomachine) => void;
  onOpenMeasurementEditor: (periodId: string, channelId: string) => void;
  onOpenDidacticGuide: () => void;
}

export const PowerBiDualView: React.FC<PowerBiDualViewProps> = ({
  turbomachine,
  onUpdateTurbomachine,
  onOpenMeasurementEditor,
  onOpenDidacticGuide,
}) => {
  // We allow selecting which period is upper and which is lower
  const periods = turbomachine.periods;
  const [periodAId, setPeriodAId] = useState<string>(periods[0]?.id || '');
  const [periodBId, setPeriodBId] = useState<string>(periods[1]?.id || periods[0]?.id || '');

  // Slicer selected channel for period A and period B
  const [channelAId, setChannelAId] = useState<string>(
    periods[0]?.selectedChannelId || periods[0]?.channels[0]?.id || 'C2'
  );
  const [channelBId, setChannelBId] = useState<string>(
    periods[1]?.selectedChannelId || periods[1]?.channels[0]?.id || 'C1'
  );

  // Synchronize channel selection option
  const [syncChannels, setSyncChannels] = useState<boolean>(false);

  // Editable comment state
  const [editingCommentA, setEditingCommentA] = useState<boolean>(false);
  const [commentAText, setCommentAText] = useState<string>('');

  const [editingCommentB, setEditingCommentB] = useState<boolean>(false);
  const [commentBText, setCommentBText] = useState<string>('');

  const periodA = periods.find((p) => p.id === periodAId) || periods[0];
  const periodB = periods.find((p) => p.id === periodBId) || periods[1] || periods[0];

  const channelA = periodA?.channels.find((c) => c.id === channelAId) || periodA?.channels[0];
  const channelB = periodB?.channels.find((c) => c.id === (syncChannels ? channelAId : channelBId)) || periodB?.channels[0];

  const handleSelectChannelA = (chId: string) => {
    setChannelAId(chId);
    if (syncChannels) {
      setChannelBId(chId);
    }
  };

  const handleSelectChannelB = (chId: string) => {
    setChannelBId(chId);
  };

  const handleToggleSync = () => {
    const nextSync = !syncChannels;
    setSyncChannels(nextSync);
    if (nextSync) {
      setChannelBId(channelAId);
    }
  };

  // Delta between upper and lower channels (or between period A and B for same channel)
  const delta = calculateDelta(channelA, channelB);

  // Save comment A
  const handleSaveCommentA = () => {
    if (!periodA) return;
    const updatedPeriods = turbomachine.periods.map((p) => {
      if (p.id === periodA.id) {
        return { ...p, generalComment: commentAText };
      }
      return p;
    });
    onUpdateTurbomachine({ ...turbomachine, periods: updatedPeriods });
    setEditingCommentA(false);
  };

  // Save comment B
  const handleSaveCommentB = () => {
    if (!periodB) return;
    const updatedPeriods = turbomachine.periods.map((p) => {
      if (p.id === periodB.id) {
        return { ...p, generalComment: commentBText };
      }
      return p;
    });
    onUpdateTurbomachine({ ...turbomachine, periods: updatedPeriods });
    setEditingCommentB(false);
  };

  // Upload image handler
  const handleUploadImage = (periodId: string, channelId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const updatedPeriods = turbomachine.periods.map((p) => {
        if (p.id === periodId) {
          const updatedChannels = p.channels.map((ch) => {
            if (ch.id === channelId) {
              return { ...ch, imageUrl: base64 };
            }
            return ch;
          });
          return { ...p, channels: updatedChannels };
        }
        return p;
      });
      onUpdateTurbomachine({ ...turbomachine, periods: updatedPeriods });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Control Strip & Delta Analysis Alert */}
      <div className="bg-white border border-slate-200 rounded p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span>Comparando Períodos:</span>
            <select
              value={periodAId}
              onChange={(e) => setPeriodAId(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-blue-900 focus:outline-blue-500"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  Panel Superior: {p.periodLabel}
                </option>
              ))}
            </select>
            <span className="text-slate-400">vs</span>
            <select
              value={periodBId}
              onChange={(e) => setPeriodBId(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-blue-900 focus:outline-blue-500"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  Panel Inferior: {p.periodLabel}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleToggleSync}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              syncChannels
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Al activar, seleccionar un canal en el panel superior seleccionará automáticamente el mismo canal en el inferior para comparar la evolución del cojinete"
          >
            {syncChannels ? <Link2 className="w-3.5 h-3.5 text-blue-600" /> : <Unlink className="w-3.5 h-3.5" />}
            <span>{syncChannels ? 'Canales Sincronizados (1:1)' : 'Sincronizar Canales'}</span>
          </button>
        </div>

        {/* Delta Analysis Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium border ${
              delta.status === 'critico'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : delta.status === 'elevado'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : delta.status === 'disminuyo'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {delta.hasIncreased ? (
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            ) : delta.status === 'disminuyo' ? (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>
              $\Delta$ Vibración: <strong>{delta.pctChangeX >= 0 ? `+${delta.pctChangeX}%` : `${delta.pctChangeX}%`}</strong> (X) /{' '}
              <strong>{delta.pctChangeY >= 0 ? `+${delta.pctChangeY}%` : `${delta.pctChangeY}%`}</strong> (Y)
            </span>
            <span className="hidden md:inline text-[11px] text-slate-500">· {delta.message}</span>
          </div>

          <button
            onClick={onOpenDidacticGuide}
            className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guía Didáctica</span>
          </button>
        </div>
      </div>

      {/* Main Dual View Grid: Replicating & perfecting user's Power BI layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ========================================================= */}
        {/* UPPER ROW: Period A */}
        {/* ========================================================= */}
        {/* Left Column A: Slicer, Title, Brand & Comment */}
        <div className="lg:col-span-4 bg-white border border-slate-300 rounded shadow-xs p-3.5 flex flex-col justify-between min-h-[340px]">
          <div>
            {/* Slicer: Name list with radio buttons */}
            <div className="mb-3">
              <div className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Name</span>
                <span className="text-[10px] text-slate-400 font-normal">Sondeo de Cojinetes</span>
              </div>
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded p-1.5 space-y-0.5 bg-slate-50/50">
                {periodA?.channels.map((ch) => {
                  const isSelected = ch.id === channelAId;
                  return (
                    <label
                      key={ch.id}
                      onClick={() => handleSelectChannelA(ch.id)}
                      className={`flex items-center gap-2 px-1.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-100/70 text-blue-900 font-semibold border-l-2 border-blue-600'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`slicer-periodA-${periodA.id}`}
                        checked={isSelected}
                        onChange={() => handleSelectChannelA(ch.id)}
                        className="text-blue-600 focus:ring-blue-500 h-3 w-3"
                      />
                      <span className="truncate" title={ch.code}>
                        {ch.code}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Large Period Title & Logo */}
            <div className="flex items-center justify-between gap-2 my-2 py-1">
              <div>
                <h2 className="text-2xl font-black text-blue-600 leading-tight tracking-tight">
                  {periodA?.displayTitle || `Orbitas ${turbomachine.name} ${periodA?.periodLabel}`}
                </h2>
                <div className="text-[11px] text-slate-500 font-medium">
                  {turbomachine.fullName} · {turbomachine.analyst}
                </div>
              </div>

              {/* Corporate Logo (Smurfit Westrock default from screenshot) */}
              <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-200 rounded shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white font-black text-xs shadow-inner">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                      <path d="M3 7c3-3 6-3 9 0s6 3 9 0" />
                      <path d="M3 12c3-3 6-3 9 0s6 3 9 0" />
                      <path d="M3 17c3-3 6-3 9 0s6 3 9 0" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black text-sky-800 leading-none">Smurfit</div>
                    <div className="text-[11px] font-black text-blue-950 leading-none">Westrock</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Box (Styled like the prominent blue header box in Power BI) */}
          <div className="mt-3">
            <div className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-t flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Comentario</span>
              </span>
              <button
                onClick={() => {
                  if (editingCommentA) {
                    handleSaveCommentA();
                  } else {
                    setCommentAText(periodA?.generalComment || '');
                    setEditingCommentA(true);
                  }
                }}
                className="text-[10px] bg-blue-700 hover:bg-blue-800 px-1.5 py-0.5 rounded text-white flex items-center gap-1 transition-colors"
              >
                {editingCommentA ? <Check className="w-2.5 h-2.5" /> : <Edit3 className="w-2.5 h-2.5" />}
                <span>{editingCommentA ? 'Guardar' : 'Editar'}</span>
              </button>
            </div>
            <div className="bg-blue-50/70 border border-blue-200 rounded-b p-2 text-xs text-slate-800 min-h-[60px] flex flex-col justify-between">
              {editingCommentA ? (
                <div className="space-y-1.5">
                  <textarea
                    value={commentAText}
                    onChange={(e) => setCommentAText(e.target.value)}
                    className="w-full text-xs p-1.5 border border-blue-300 rounded bg-white text-slate-900 focus:outline-blue-500 font-sans"
                    rows={3}
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEditingCommentA(false)}
                      className="px-2 py-0.5 text-[10px] text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveCommentA}
                      className="px-2 py-0.5 text-[10px] font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Guardar Comentario
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-sans leading-relaxed text-slate-800">
                  {periodA?.generalComment || 'Sin observaciones registradas.'}
                </p>
              )}

              {/* Sub-note for active channel */}
              {channelA && (
                <div className="mt-2 pt-1.5 border-t border-blue-200/60 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                  <span>
                    Canal: <strong>{channelA.probeXName}/{channelA.probeYName}</strong>
                  </span>
                  <span>
                    Pk-Pk: <strong>{channelA.pkToPkX.toFixed(3)} / {channelA.pkToPkY.toFixed(3)} {channelA.unit}</strong>
                  </span>
                  <button
                    onClick={() => onOpenMeasurementEditor(periodA.id, channelA.id)}
                    className="text-blue-700 hover:underline font-sans font-medium"
                  >
                    Detalles / Editar datos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column A: Orbit Visualizer Card */}
        <div className="lg:col-span-8">
          {channelA ? (
            <OrbitVisualizer
              measurement={channelA}
              onUploadImage={(file) => handleUploadImage(periodA.id, channelA.id, file)}
              accentBorderColor="border-blue-900"
            />
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded">
              Seleccione un canal para visualizar
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* LOWER ROW: Period B */}
        {/* ========================================================= */}
        {/* Left Column B: Slicer, Title, Brand & Comment */}
        <div className="lg:col-span-4 bg-white border border-slate-300 rounded shadow-xs p-3.5 flex flex-col justify-between min-h-[340px]">
          <div>
            {/* Slicer: Name list with radio buttons */}
            <div className="mb-3">
              <div className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Name</span>
                <span className="text-[10px] text-slate-400 font-normal">Sondeo de Cojinetes</span>
              </div>
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded p-1.5 space-y-0.5 bg-slate-50/50">
                {periodB?.channels.map((ch) => {
                  const isSelected = ch.id === channelBId;
                  return (
                    <label
                      key={ch.id}
                      onClick={() => handleSelectChannelB(ch.id)}
                      className={`flex items-center gap-2 px-1.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-100/70 text-blue-900 font-semibold border-l-2 border-blue-600'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`slicer-periodB-${periodB.id}`}
                        checked={isSelected}
                        onChange={() => handleSelectChannelB(ch.id)}
                        className="text-blue-600 focus:ring-blue-500 h-3 w-3"
                      />
                      <span className="truncate" title={ch.code}>
                        {ch.code}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Large Period Title & Logo */}
            <div className="flex items-center justify-between gap-2 my-2 py-1">
              <div>
                <h2 className="text-2xl font-black text-blue-600 leading-tight tracking-tight">
                  {periodB?.displayTitle || `Orbitas ${turbomachine.name} ${periodB?.periodLabel}`}
                </h2>
                <div className="text-[11px] text-slate-500 font-medium">
                  {turbomachine.fullName} · {turbomachine.analyst}
                </div>
              </div>

              {/* Corporate Logo */}
              <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-200 rounded shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white font-black text-xs shadow-inner">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                      <path d="M3 7c3-3 6-3 9 0s6 3 9 0" />
                      <path d="M3 12c3-3 6-3 9 0s6 3 9 0" />
                      <path d="M3 17c3-3 6-3 9 0s6 3 9 0" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black text-sky-800 leading-none">Smurfit</div>
                    <div className="text-[11px] font-black text-blue-950 leading-none">Westrock</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Box */}
          <div className="mt-3">
            <div className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-t flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Comentario</span>
              </span>
              <button
                onClick={() => {
                  if (editingCommentB) {
                    handleSaveCommentB();
                  } else {
                    setCommentBText(periodB?.generalComment || '');
                    setEditingCommentB(true);
                  }
                }}
                className="text-[10px] bg-blue-700 hover:bg-blue-800 px-1.5 py-0.5 rounded text-white flex items-center gap-1 transition-colors"
              >
                {editingCommentB ? <Check className="w-2.5 h-2.5" /> : <Edit3 className="w-2.5 h-2.5" />}
                <span>{editingCommentB ? 'Guardar' : 'Editar'}</span>
              </button>
            </div>
            <div className="bg-blue-50/70 border border-blue-200 rounded-b p-2 text-xs text-slate-800 min-h-[60px] flex flex-col justify-between">
              {editingCommentB ? (
                <div className="space-y-1.5">
                  <textarea
                    value={commentBText}
                    onChange={(e) => setCommentBText(e.target.value)}
                    className="w-full text-xs p-1.5 border border-blue-300 rounded bg-white text-slate-900 focus:outline-blue-500 font-sans"
                    rows={3}
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEditingCommentB(false)}
                      className="px-2 py-0.5 text-[10px] text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveCommentB}
                      className="px-2 py-0.5 text-[10px] font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Guardar Comentario
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-sans leading-relaxed text-slate-800">
                  {periodB?.generalComment || 'Sin observaciones registradas.'}
                </p>
              )}

              {/* Sub-note for active channel */}
              {channelB && (
                <div className="mt-2 pt-1.5 border-t border-blue-200/60 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                  <span>
                    Canal: <strong>{channelB.probeXName}/{channelB.probeYName}</strong>
                  </span>
                  <span>
                    Pk-Pk: <strong>{channelB.pkToPkX.toFixed(3)} / {channelB.pkToPkY.toFixed(3)} {channelB.unit}</strong>
                  </span>
                  <button
                    onClick={() => onOpenMeasurementEditor(periodB.id, channelB.id)}
                    className="text-blue-700 hover:underline font-sans font-medium"
                  >
                    Detalles / Editar datos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column B: Orbit Visualizer Card */}
        <div className="lg:col-span-8">
          {channelB ? (
            <OrbitVisualizer
              measurement={channelB}
              onUploadImage={(file) => handleUploadImage(periodB.id, channelB.id, file)}
              accentBorderColor="border-blue-900"
            />
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded">
              Seleccione un canal para visualizar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
