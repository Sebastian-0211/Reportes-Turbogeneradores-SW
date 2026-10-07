import React, { useState } from 'react';
import { Turbomachine, ChannelMeasurement, PeriodReport } from '../types/turbomachine';
import { calculateDelta } from '../utils/orbitMath';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Eye, 
  Activity,
  Layers
} from 'lucide-react';

interface HistoricalTimelineProps {
  turbomachine: Turbomachine;
  onSelectPeriodChannel: (periodId: string, channelId: string) => void;
}

export const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({
  turbomachine,
  onSelectPeriodChannel,
}) => {
  const periods = turbomachine.periods;
  const [selectedChannelCode, setSelectedChannelCode] = useState<string>('all');

  // Extract all unique channels by id (e.g. C1, C2, C3...)
  const channelList = periods[0]?.channels || [];

  // Build trend points for chart
  // For each period and each channel, get the max Pk-Pk vibration (or normalized mils)
  const chartWidth = 720;
  const chartHeight = 260;
  const paddingLeft = 50;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 30;

  const innerW = chartWidth - paddingLeft - paddingRight;
  const innerH = chartHeight - paddingTop - paddingBottom;

  // Maximum vibration value to scale Y axis (at least 5 mils or 25 um)
  const allValues = periods.flatMap((p) =>
    p.channels.map((c) => Math.max(c.pkToPkX, c.pkToPkY))
  );
  const maxVal = Math.max(...allValues, 3.5) * 1.25;

  // Channel color map
  const channelColors: Record<string, string> = {
    C1: '#2563eb', // blue
    C2: '#0891b2', // cyan
    C3: '#059669', // emerald
    C4: '#d97706', // amber
    C5: '#7c3aed', // violet
    C6: '#db2777', // pink
    C7: '#ea580c', // orange
    C8: '#475569', // slate
  };

  // Build historical change logs comparing consecutive months
  const historicalChanges: Array<{
    periodFrom: string;
    periodTo: string;
    date: string;
    channel: ChannelMeasurement;
    delta: ReturnType<typeof calculateDelta>;
    comment: string;
    periodToId: string;
  }> = [];

  for (let i = 1; i < periods.length; i++) {
    const prevP = periods[i - 1];
    const currP = periods[i];

    currP.channels.forEach((currCh) => {
      const prevCh = prevP.channels.find((c) => c.id === currCh.id);
      const delta = calculateDelta(prevCh, currCh);
      historicalChanges.push({
        periodFrom: prevP.periodLabel,
        periodTo: currP.periodLabel,
        date: currP.date,
        channel: currCh,
        delta,
        comment: currCh.comment || currP.generalComment,
        periodToId: currP.id,
      });
    });
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Períodos Registrados
          </div>
          <div className="text-2xl font-black text-slate-900">{periods.length} Meses</div>
          <div className="text-xs text-slate-500 mt-1">
            Desde {periods[0]?.periodLabel} hasta {periods[periods.length - 1]?.periodLabel}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Cojinetes Monitoreados
          </div>
          <div className="text-2xl font-black text-blue-900">{channelList.length} Puntos (X-Y)</div>
          <div className="text-xs text-slate-500 mt-1">Sondas de proximidad eddy current</div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Velocidad & Potencia Nominal
          </div>
          <div className="text-2xl font-black text-slate-900">
            {turbomachine.nominalRpm.toLocaleString()} <span className="text-sm font-normal text-slate-500">RPM</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Potencia: {turbomachine.ratedPowerMW} MW</div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Estado de Condición Global
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-lg font-bold text-slate-900">Operativo Confiable</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Límites conforme a ISO 7919-2</div>
        </div>
      </div>

      {/* Vibration Historical Trend Chart */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Tendencia Histórica de Vibración Pk-to-Pk por Cojinete</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evolución temporal de la amplitud vibratoria a lo largo de las campañas de medición.
            </p>
          </div>

          {/* Filter by channel */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-500 font-medium">Filtrar:</span>
            <button
              onClick={() => setSelectedChannelCode('all')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedChannelCode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los canales
            </button>
            {channelList.slice(0, 4).map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannelCode(ch.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedChannelCode === ch.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ch.probeXName}/{ch.probeYName}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Multi-month Trend Plot */}
        <div className="overflow-x-auto">
          <svg className="w-full min-w-[640px] h-[280px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Background ISO severity zones */}
            {(() => {
              // ISO 7919-2 for turbomachinery: Zone A (<2.5 mils), Zone B (2.5 - 4.5 mils), Zone C (>4.5 mils)
              const yZoneA = chartHeight - paddingBottom - (2.5 / maxVal) * innerH;
              const yZoneB = chartHeight - paddingBottom - (4.5 / maxVal) * innerH;
              return (
                <g>
                  {/* Zone A: Good condition */}
                  <rect
                    x={paddingLeft}
                    y={Math.max(paddingTop, yZoneA)}
                    width={innerW}
                    height={chartHeight - paddingBottom - Math.max(paddingTop, yZoneA)}
                    fill="#10b981"
                    fillOpacity="0.05"
                  />
                  {/* Zone B: Acceptable */}
                  {yZoneB < yZoneA && (
                    <rect
                      x={paddingLeft}
                      y={Math.max(paddingTop, yZoneB)}
                      width={innerW}
                      height={yZoneA - Math.max(paddingTop, yZoneB)}
                      fill="#f59e0b"
                      fillOpacity="0.05"
                    />
                  )}
                  {/* Alarm threshold line at 2.5 mils */}
                  <line
                    x1={paddingLeft}
                    y1={yZoneA}
                    x2={chartWidth - paddingRight}
                    y2={yZoneA}
                    stroke="#10b981"
                    strokeDasharray="4,3"
                    strokeWidth="1.2"
                  />
                  <text
                    x={chartWidth - paddingRight - 4}
                    y={yZoneA - 4}
                    textAnchor="end"
                    fill="#059669"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    Límite Zona A (2.5 mils)
                  </text>
                </g>
              );
            })()}

            {/* Grid & Axes */}
            <line
              x1={paddingLeft}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingRight}
              y2={chartHeight - paddingBottom}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={chartHeight - paddingBottom}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />

            {/* Y Axis Ticks */}
            {[0, 1, 2, 3, 4, 5].map((tick) => {
              if (tick > maxVal) return null;
              const y = chartHeight - paddingBottom - (tick / maxVal) * innerH;
              return (
                <g key={tick}>
                  <line x1={paddingLeft - 4} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                    {tick} mils
                  </text>
                </g>
              );
            })}

            {/* X Axis Points (Periods) */}
            {periods.map((p, idx) => {
              const x = paddingLeft + (idx / Math.max(1, periods.length - 1)) * innerW;
              return (
                <g key={p.id}>
                  <line x1={x} y1={chartHeight - paddingBottom} x2={x} y2={chartHeight - paddingBottom + 5} stroke="#64748b" />
                  <text
                    x={x}
                    y={chartHeight - paddingBottom + 18}
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {p.periodLabel}
                  </text>
                  <text
                    x={x}
                    y={chartHeight - paddingBottom + 30}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {p.date}
                  </text>
                </g>
              );
            })}

            {/* Series Lines for Channels */}
            {channelList.map((refCh) => {
              if (selectedChannelCode !== 'all' && selectedChannelCode !== refCh.id) return null;
              const color = channelColors[refCh.id] || '#2563eb';

              const points = periods.map((p, idx) => {
                const ch = p.channels.find((c) => c.id === refCh.id) || refCh;
                const val = Math.max(ch.pkToPkX, ch.pkToPkY);
                const x = paddingLeft + (idx / Math.max(1, periods.length - 1)) * innerW;
                const y = chartHeight - paddingBottom - (val / maxVal) * innerH;
                return { x, y, val, ch, p };
              });

              const pathD = points.reduce((acc, pt, idx) => {
                return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`;
              }, '');

              return (
                <g key={refCh.id}>
                  <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="#ffffff"
                        stroke={color}
                        strokeWidth="2.5"
                        className="cursor-pointer hover:r-6 transition-all"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 8}
                        textAnchor="middle"
                        fill={color}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {pt.val.toFixed(2)}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
          {channelList.slice(0, 6).map((ch) => (
            <div key={ch.id} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: channelColors[ch.id] || '#2563eb' }} />
              <span className="text-slate-700 font-medium">{ch.label.split(' - ')[0]} ({ch.label.split(' - ')[1] || ''})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Increases and Changes Table */}
      <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Registro Histórico de Aumentos, Variaciones y Cambios Morfológicos</span>
            </h3>
            <p className="text-xs text-slate-500">
              Diferenciales mes a mes calculados automáticamente para detección temprana de derivas.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {historicalChanges.length} comparaciones registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Período Comparado</th>
                <th className="py-2.5 px-3">Cojinete / Canal</th>
                <th className="py-2.5 px-3">Pk-to-Pk Actual</th>
                <th className="py-2.5 px-3">$\Delta$ Variación (%)</th>
                <th className="py-2.5 px-3">Estado / Criticidad</th>
                <th className="py-2.5 px-3">Observación Técnica</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-sans">
              {historicalChanges.map((item, idx) => {
                const isIncrease = item.delta.hasIncreased;
                const isDrop = item.delta.status === 'disminuyo';

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      <span>{item.periodFrom}</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <strong className="text-blue-900">{item.periodTo}</strong>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                      <span className="font-bold text-slate-800">{item.channel.probeXName}/{item.channel.probeYName}</span>
                      <span className="text-slate-400 block text-[10px]">{item.channel.code}</span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                      <div>X: {item.channel.pkToPkX.toFixed(3)} {item.channel.unit}</div>
                      <div>Y: {item.channel.pkToPkY.toFixed(3)} {item.channel.unit}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {isIncrease ? (
                          <span className="flex items-center text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <TrendingUp className="w-3 h-3 mr-0.5" />
                            +{item.delta.pctChangeX}% / +{item.delta.pctChangeY}%
                          </span>
                        ) : isDrop ? (
                          <span className="flex items-center text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <TrendingDown className="w-3 h-3 mr-0.5" />
                            {item.delta.pctChangeX}% / {item.delta.pctChangeY}%
                          </span>
                        ) : (
                          <span className="flex items-center text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Minus className="w-3 h-3 mr-0.5 text-slate-400" />
                            Estable
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {item.channel.criticality === 'critico' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Crítico
                        </span>
                      )}
                      {item.channel.criticality === 'vigilancia' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Vigilancia
                        </span>
                      )}
                      {item.channel.criticality === 'alerta' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          <AlertTriangle className="w-3 h-3" /> Alerta
                        </span>
                      )}
                      {item.channel.criticality === 'normal' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Normal
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-600" title={item.comment}>
                      {item.comment}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectPeriodChannel(item.periodToId, item.channel.id)}
                        className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Órbita</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
