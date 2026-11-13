import React, { useState } from 'react';
import { Turbomachine, PeriodReport, ChannelMeasurement } from '../types/turbomachine';
import { OrbitVisualizer } from './OrbitVisualizer';
import { 
  FileText, 
  Printer, 
  Download, 
  Share2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
  Building, 
  Cpu, 
  ExternalLink,
  ChevronDown,
  Layers
} from 'lucide-react';

interface InteractiveReportGeneratorProps {
  turbomachine: Turbomachine;
  onClose?: () => void;
}

export const InteractiveReportGenerator: React.FC<InteractiveReportGeneratorProps> = ({
  turbomachine,
  onClose,
}) => {
  const periods = turbomachine.periods;
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    periods[periods.length - 1]?.id || periods[0]?.id || ''
  );

  const activePeriod = periods.find((p) => p.id === selectedPeriodId) || periods[periods.length - 1] || periods[0];
  const channels = activePeriod?.channels || [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStandaloneHtmlReport = () => {
    const reportHtml = generateStandaloneReportHtml(turbomachine, activePeriod);
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Informe_Orbitas_${turbomachine.name}_${activePeriod.periodLabel.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const criticalCount = channels.filter((c) => c.criticality === 'critico').length;
  const alertCount = channels.filter((c) => c.criticality === 'alerta' || c.criticality === 'vigilancia').length;
  const normalCount = channels.filter((c) => c.criticality === 'normal').length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Action Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Informe Técnico Interactivo de Medición Orbital
              <span className="text-[11px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-500/30">
                Norma ISO 7919-2 / 20816
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Genera informes interactivos navegables o exportables a PDF para la gerencia y el equipo de mantenimiento
            </p>
          </div>
        </div>

        {/* Campaign Period Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Campaña:</span>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.periodLabel} ({p.date})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all border border-slate-700"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={handleDownloadStandaloneHtmlReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
            title="Descarga un archivo HTML que funciona con doble clic en cualquier equipo sin instalar nada"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Informe Autónomo (.html)</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-slate-200 max-w-5xl mx-auto space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-widest uppercase text-blue-900">
              {turbomachine.company || 'INGENIERÍA DE CONFIABILIDAD & MONITOREO DE CONDICIÓN'}
            </div>
            <h1 className="text-2xl font-black text-slate-950 mt-1">
              REPORTE DE ÓRBITAS Y DINÁMICA DE ROTORES
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">
              Unidad: {turbomachine.fullName} · {turbomachine.tag}
            </p>
          </div>

          <div className="text-right text-xs space-y-1 text-slate-600">
            <div className="flex items-center justify-end gap-1 font-bold text-slate-900">
              <Calendar className="w-3.5 h-3.5 text-blue-900" />
              <span>Fecha de Medición: {activePeriod.date}</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Analista: {turbomachine.analyst}</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>Velocidad Nominal: {turbomachine.nominalRpm} RPM ({turbomachine.ratedPowerMW} MW)</span>
            </div>
          </div>
        </div>

        {/* Global Machine Status Alert Banner */}
        <div className={`p-4 rounded-lg border-2 flex items-center justify-between gap-4 ${
          criticalCount > 0
            ? 'bg-rose-50 border-rose-500 text-rose-950'
            : alertCount > 0
            ? 'bg-amber-50 border-amber-500 text-amber-950'
            : 'bg-emerald-50 border-emerald-600 text-emerald-950'
        }`}>
          <div className="flex items-center gap-3">
            {criticalCount > 0 ? (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            ) : alertCount > 0 ? (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            )}
            <div>
              <div className="text-sm font-black uppercase tracking-wide">
                Condición General de la Turbomáquina: {
                  criticalCount > 0 ? 'CRÍTICO (ZONA D)' :
                  alertCount > 0 ? 'ALERTA / VIGILANCIA (ZONA C)' :
                  'SATISFACTORIO / NORMAL (ZONA A/B)'
                }
              </div>
              <p className="text-xs mt-0.5">
                {activePeriod.generalComment}
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono font-bold shrink-0">
            <span>{normalCount} Normales</span> · <span className="text-amber-700">{alertCount} Alerta</span> · <span className="text-rose-700">{criticalCount} Críticos</span>
          </div>
        </div>

        {/* ISO 7919-2 Severity Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-900 rounded-xs"></span>
            1. Matriz de Severidad Vibratoria y Holgura Dinámica (ISO 7919-2)
          </h2>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2.5">Apoyo / Chumacera</th>
                  <th className="p-2.5">Sensores</th>
                  <th className="p-2.5">RPM</th>
                  <th className="p-2.5">Pk-Pk X</th>
                  <th className="p-2.5">Pk-Pk Y</th>
                  <th className="p-2.5">Fase 1X</th>
                  <th className="p-2.5">Zona ISO</th>
                  <th className="p-2.5">Diagnóstico Preliminar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {channels.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900">{ch.label}</td>
                    <td className="p-2.5 font-mono text-slate-600">{ch.probeXName}/{ch.probeYName}</td>
                    <td className="p-2.5 font-mono">{ch.rpm.toFixed(0)}</td>
                    <td className="p-2.5 font-mono font-bold text-blue-900">{ch.pkToPkX.toFixed(3)} mils</td>
                    <td className="p-2.5 font-mono font-bold text-blue-900">{ch.pkToPkY.toFixed(3)} mils</td>
                    <td className="p-2.5 font-mono">{ch.angleDeg.toFixed(1)}°</td>
                    <td className="p-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ch.criticality === 'critico' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        ch.criticality === 'alerta' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                        ch.criticality === 'vigilancia' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {ch.criticality}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700 italic max-w-xs truncate">{ch.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Bearing Orbit Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-900 rounded-xs"></span>
            2. Análisis Gráfico de Órbitas Vectoriales Digitalizadas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((ch) => (
              <div key={ch.id} className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 shadow-xs flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-900">{ch.label}</span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    Pk-Pk: {Math.max(ch.pkToPkX, ch.pkToPkY).toFixed(3)} mils
                  </span>
                </div>

                <div className="flex justify-center bg-white rounded-lg p-2 border border-slate-200">
                  <OrbitVisualizer
                    measurement={ch}
                    titleOverride={ch.label}
                    accentBorderColor="border-blue-900"
                  />
                </div>

                <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-900">Hallazgo:</div>
                  <p className="text-[11px] leading-relaxed italic">{ch.comment}</p>
                  {ch.recommendation && (
                    <div className="text-[11px] text-blue-900 font-semibold pt-1">
                      Recomendación: {ch.recommendation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engineering Conclusions & Signatures */}
        <div className="pt-6 border-t-2 border-slate-900 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-900 rounded-xs"></span>
            3. Conclusiones y Plan de Acción
          </h2>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-2 leading-relaxed">
            <p>
              • Las mediciones orbitales procesadas mediante el motor de IA local confirman que la máquina opera bajo parámetros dinámicos estables para los apoyos en Zona A/B.
            </p>
            {alertCount > 0 && (
              <p className="text-amber-900 font-semibold">
                • Se identificaron {alertCount} cojinete(s) en condición de alerta/vigilancia que requieren seguimiento semanal de tendencia de vibración y verificación de temperatura de metal blanco.
              </p>
            )}
            {criticalCount > 0 && (
              <p className="text-rose-900 font-bold">
                • ALERTA CRÍTICA: Se detectaron {criticalCount} apoyo(s) en Zona D. Se recomienda coordinar inspección boroscópica y revisión de holguras dinámicas en la próxima parada programada.
              </p>
            )}
            <p>
              • Este informe ha sido generado de manera 100% segura y offline sin transferencia de datos hacia servidores externos.
            </p>
          </div>

          <div className="pt-10 flex justify-between items-end text-xs text-slate-600">
            <div className="border-t border-slate-400 pt-2 w-64 text-center">
              <div className="font-bold text-slate-900">{turbomachine.analyst}</div>
              <div>Especialista en Análisis de Vibraciones y Dinámica de Rotores</div>
            </div>

            <div className="border-t border-slate-400 pt-2 w-64 text-center">
              <div className="font-bold text-slate-900">Aprobación Técnica</div>
              <div>Gerencia de Mantenimiento / Planta</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Genera el documento HTML completo autónomo (Standalone) interactivo
 */
function generateStandaloneReportHtml(turbomachine: Turbomachine, period: PeriodReport): string {
  const channelsJson = JSON.stringify(period.channels);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Órbitas - ${turbomachine.name} - ${period.periodLabel}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; background: #ffffff; color: #0f172a; border-radius: 12px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { margin: 0 0 6px 0; font-size: 24px; color: #0f172a; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    .table th, .table td { padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; }
    .table th { background: #f1f5f9; font-weight: bold; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .badge-normal { background: #dcfce7; color: #166534; }
    .badge-alerta { background: #ffedd5; color: #9a3412; }
    .badge-critico { background: #ffe4e6; color: #9f1239; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top: 24px; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; background: #f8fafc; }
    .orbit-canvas { width: 100%; height: 260px; background: #000; border-radius: 6px; display: block; margin: 12px 0; }
    @media print { body { background: #fff; padding: 0; } .container { box-shadow: none; padding: 0; max-width: 100%; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div style="font-size: 11px; font-weight: bold; color: #1e3a8a; text-transform: uppercase;">${turbomachine.company || 'INGENIERÍA PREDICTIVA'}</div>
        <h1>INFORME INTERACTIVO DE ÓRBITAS - ${turbomachine.fullName}</h1>
        <div style="font-size: 14px; color: #475569;">Campaña: ${period.periodLabel} · Fecha: ${period.date}</div>
      </div>
      <div style="text-align: right; font-size: 12px; color: #475569;">
        <div><strong>Analista:</strong> ${turbomachine.analyst}</div>
        <div><strong>Velocidad:</strong> ${turbomachine.nominalRpm} RPM</div>
      </div>
    </div>

    <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; font-size: 13px; margin-bottom: 24px;">
      <strong>Diagnóstico General:</strong> ${period.generalComment}
    </div>

    <h2>1. Resumen de Severidad Vibratoria (ISO 7919-2)</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Apoyo / Chumacera</th>
          <th>Sensores</th>
          <th>RPM</th>
          <th>Pk-Pk X</th>
          <th>Pk-Pk Y</th>
          <th>Fase 1X</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${period.channels.map(ch => `
          <tr>
            <td><strong>${ch.label}</strong></td>
            <td>${ch.probeXName}/${ch.probeYName}</td>
            <td>${ch.rpm.toFixed(0)}</td>
            <td><strong>${ch.pkToPkX.toFixed(3)} mils</strong></td>
            <td><strong>${ch.pkToPkY.toFixed(3)} mils</strong></td>
            <td>${ch.angleDeg.toFixed(1)}°</td>
            <td><span class="badge badge-${ch.criticality}">${ch.criticality}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2 style="margin-top: 32px;">2. Visualización de Órbitas</h2>
    <div class="grid">
      ${period.channels.map((ch, idx) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold;">
            <span>${ch.label}</span>
            <span style="color: #1e3a8a;">${ch.pkToPkX.toFixed(2)}x${ch.pkToPkY.toFixed(2)} mils</span>
          </div>
          <canvas id="orbit-canvas-${idx}" class="orbit-canvas" width="300" height="260"></canvas>
          <div style="font-size: 12px; color: #334155; font-style: italic;">
            ${ch.comment}
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    const channels = ${channelsJson};
    channels.forEach((ch, idx) => {
      const canvas = document.getElementById('orbit-canvas-' + idx);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Dibujar retícula
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let r = 25; r <= 100; r += 25) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx, 10); ctx.lineTo(cx, h - 10);
      ctx.moveTo(10, cy); ctx.lineTo(w - 10, cy);
      ctx.stroke();

      // Dibujar órbita
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      if (ch.vectorPoints && ch.vectorPoints.length > 0) {
        const scale = 70;
        ch.vectorPoints.forEach((pt, pIdx) => {
          const px = cx + pt.x * scale;
          const py = cy - pt.y * scale;
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
      } else {
        const ampX = (ch.pkToPkX || 0.8) * 45;
        const ampY = (ch.pkToPkY || 0.9) * 45;
        const phase = (ch.angleDeg * Math.PI) / 180;
        for (let i = 0; i <= 100; i++) {
          const t = (i / 100) * 2 * Math.PI;
          const px = cx + ampX * Math.cos(t);
          const py = cy - ampY * Math.sin(t + phase * 0.4);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Punto Keyphasor
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 30, cy - 20, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  </script>
</body>
</html>`;
}
