import React, { useState } from 'react';
import { Turbomachine } from '../types/turbomachine';
import { Download, FileCode, Printer, FileJson, Check, X, Share2, Sparkles } from 'lucide-react';

interface ExportModalProps {
  turbomachine: Turbomachine;
  allTurbines: Turbomachine[];
  onImportData: (data: Turbomachine[]) => void;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  turbomachine,
  allTurbines,
  onImportData,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Generate self-contained standalone interactive HTML report
  const handleExportInteractiveHtml = () => {
    const dataJson = JSON.stringify(turbomachine, null, 2);

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Interactivo de Órbitas - ${turbomachine.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; }
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 font-sans min-h-screen">
  <!-- Top Bar -->
  <header class="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 flex items-center justify-between no-print">
    <div class="flex items-center gap-3">
      <div class="w-6 h-6 rounded bg-amber-500 flex items-center justify-center font-black text-xs text-black">P</div>
      <div>
        <h1 class="font-bold text-sm leading-tight">${turbomachine.fullName}</h1>
        <p class="text-[11px] text-slate-400">Reporte Interactivo Autónomo de Órbitas · ${turbomachine.company}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded border border-slate-700">Imprimir / PDF</button>
      <span class="text-xs text-slate-400 font-mono">Especialista: ${turbomachine.analyst}</span>
    </div>
  </header>

  <main class="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
    <!-- Header Card -->
    <div class="bg-white border border-slate-300 rounded p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div>
        <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">Presentación Dinámica de Vibraciones</span>
        <h2 class="text-2xl font-black text-slate-900 mt-1">${turbomachine.fullName}</h2>
        <p class="text-xs text-slate-500 mt-1">Velocidad: ${turbomachine.nominalRpm} RPM | Potencia: ${turbomachine.ratedPowerMW} MW | Campaña: ${turbomachine.periods.length} períodos</p>
      </div>
      <div class="p-3 bg-slate-50 border border-slate-200 rounded text-right">
        <div class="text-xs font-bold text-slate-800">${turbomachine.company}</div>
        <div class="text-[11px] text-slate-500">Conforme a norma ISO 7919-2</div>
      </div>
    </div>

    <!-- Slicer & Period Display Section -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Period Selector Tabs -->
      <div class="lg:col-span-12 flex items-center gap-2 bg-white p-2 border border-slate-300 rounded overflow-x-auto no-print">
        <span class="text-xs font-bold text-slate-500 px-2 uppercase">Período:</span>
        <div id="period-tabs" class="flex gap-2"></div>
      </div>

      <!-- Channel List Slicer -->
      <div class="lg:col-span-4 bg-white border border-slate-300 rounded p-4 shadow-sm space-y-4">
        <h3 class="font-bold text-xs uppercase text-slate-700 tracking-wider">Sondeo de Canales (Name)</h3>
        <div id="channel-list" class="space-y-1 max-h-72 overflow-y-auto"></div>

        <div class="mt-4 pt-3 border-t border-slate-200">
          <div class="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-t">Comentario del Período</div>
          <div id="period-comment" class="bg-blue-50 border border-blue-200 rounded-b p-3 text-xs text-slate-800 leading-relaxed min-h-[60px]"></div>
        </div>
      </div>

      <!-- Orbit and Telemetry View -->
      <div class="lg:col-span-8 bg-white border-2 border-blue-900 rounded shadow-sm p-4 space-y-4">
        <div class="border-b border-slate-200 pb-2 flex items-center justify-between">
          <h3 id="current-channel-title" class="font-bold text-base text-slate-900"></h3>
          <span id="current-date" class="text-xs font-mono text-slate-500"></span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div class="md:col-span-7 space-y-3">
            <div class="border border-slate-200 rounded p-2 bg-slate-50">
              <div class="flex justify-between text-xs font-semibold text-blue-900">
                <span id="label-x"></span>
                <span class="text-slate-500 font-mono text-[10px]" id="unit-x"></span>
              </div>
              <div id="telemetry-x" class="mt-2 text-xs font-mono grid grid-cols-2 gap-1 text-slate-700"></div>
            </div>

            <div class="border border-slate-200 rounded p-2 bg-slate-50">
              <div class="flex justify-between text-xs font-semibold text-blue-900">
                <span id="label-y"></span>
                <span class="text-slate-500 font-mono text-[10px]" id="unit-y"></span>
              </div>
              <div id="telemetry-y" class="mt-2 text-xs font-mono grid grid-cols-2 gap-1 text-slate-700"></div>
            </div>
          </div>

          <div class="md:col-span-5 flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded">
            <svg id="orbit-svg" class="w-56 h-56" viewBox="0 0 240 240"></svg>
            <div id="orbit-notes" class="text-[11px] font-mono text-center text-slate-600 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    const data = ${dataJson};
    let activePeriodIdx = 0;
    let activeChannelIdx = 0;

    function render() {
      const period = data.periods[activePeriodIdx];
      const channel = period.channels[activeChannelIdx];

      // Tabs
      const tabsEl = document.getElementById('period-tabs');
      tabsEl.innerHTML = data.periods.map((p, idx) => \`
        <button onclick="setPeriod(\${idx})" class="px-3 py-1 text-xs font-semibold rounded \${idx === activePeriodIdx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">\${p.periodLabel}</button>
      \`).join('');

      // Channels
      const chListEl = document.getElementById('channel-list');
      chListEl.innerHTML = period.channels.map((ch, idx) => \`
        <div onclick="setChannel(\${idx})" class="p-2 rounded text-xs font-mono cursor-pointer flex items-center justify-between \${idx === activeChannelIdx ? 'bg-blue-100 text-blue-900 font-bold border-l-2 border-blue-600' : 'hover:bg-slate-100 text-slate-700'}">
          <span class="truncate">\${ch.code}</span>
          <span class="text-[10px] text-slate-500">\${ch.pkToPkX.toFixed(2)} / \${ch.pkToPkY.toFixed(2)}</span>
        </div>
      \`).join('');

      // Period comment
      document.getElementById('period-comment').textContent = period.generalComment;

      // Channel details
      document.getElementById('current-channel-title').textContent = channel.label;
      document.getElementById('current-date').textContent = channel.dateStr;

      document.getElementById('label-x').textContent = channel.probeXName;
      document.getElementById('unit-x').textContent = 'Pk-to-Pk: ' + channel.pkToPkX.toFixed(3) + ' ' + channel.unit;
      document.getElementById('telemetry-x').innerHTML = \`
        <div>RPM: <strong>\${channel.rpm.toFixed(1)}</strong></div>
        <div>LOAD: <strong>\${channel.loadPct.toFixed(1)}%</strong></div>
        <div>Pk(+): <strong>\${channel.pkPlusX.toFixed(3)}</strong></div>
        <div>Crest: <strong>\${channel.crestX.toFixed(3)}</strong></div>
      \`;

      document.getElementById('label-y').textContent = channel.probeYName;
      document.getElementById('unit-y').textContent = 'Pk-to-Pk: ' + channel.pkToPkY.toFixed(3) + ' ' + channel.unit;
      document.getElementById('telemetry-y').innerHTML = \`
        <div>Rev: <strong>\${channel.rev.toFixed(3)}</strong></div>
        <div>Angl: <strong>\${channel.angleDeg.toFixed(2)}°</strong></div>
        <div>Pk(-): <strong>\${channel.pkMinusY.toFixed(3)}</strong></div>
        <div>Crest: <strong>\${channel.crestY.toFixed(3)}</strong></div>
      \`;

      // Orbit render
      renderOrbitSvg(channel);
    }

    function renderOrbitSvg(ch) {
      const svg = document.getElementById('orbit-svg');
      const cx = 120, cy = 120, r = 85;
      let pathD = '';
      const numPts = 180;
      const ampX = ch.pkToPkX * 35;
      const ampY = ch.pkToPkY * 35;
      const phase = (ch.angleDeg * Math.PI) / 180;

      for (let i = 0; i < numPts; i++) {
        const t = (i / (numPts - 1)) * 2 * Math.PI;
        const x = cx + ampX * Math.cos(t);
        const y = cy - ampY * Math.sin(t + phase * 0.4);
        pathD += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
      }

      svg.innerHTML = \`
        <circle cx="\${cx}" cy="\${cy}" r="\${r*0.33}" fill="none" stroke="#cbd5e1" stroke-dasharray="2,2"/>
        <circle cx="\${cx}" cy="\${cy}" r="\${r*0.66}" fill="none" stroke="#cbd5e1" stroke-dasharray="2,2"/>
        <circle cx="\${cx}" cy="\${cy}" r="\${r}" fill="none" stroke="#cbd5e1"/>
        <line x1="\${cx-r*1.1}" y1="\${cy}" x2="\${cx+r*1.1}" y2="\${cy}" stroke="#94a3b8"/>
        <line x1="\${cx}" y1="\${cy-r*1.1}" x2="\${cx}" y2="\${cy+r*1.1}" stroke="#94a3b8"/>
        <text x="\${cx}" y="\${cy-r*1.15}" font-size="8" text-anchor="middle" fill="#64748b">0°</text>
        <text x="\${cx+r*1.2}" y="\${cy+3}" font-size="8" text-anchor="start" fill="#64748b">90°</text>
        <path d="\${pathD}" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="\${cx + ampX}" cy="\${cy}" r="3" fill="#dc2626"/>
      \`;

      document.getElementById('orbit-notes').innerHTML = \`
        <div>Units = \${ch.unit} | LOAD = \${ch.loadPct.toFixed(1)}%</div>
        <div class="font-bold text-blue-900">\${ch.rpm.toFixed(1)} RPM | Angl: \${ch.angleDeg}°</div>
      \`;
    }

    function setPeriod(idx) {
      activePeriodIdx = idx;
      activeChannelIdx = 0;
      render();
    }

    function setChannel(idx) {
      activeChannelIdx = idx;
      render();
    }

    render();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Orbitas_${turbomachine.name}_Interactivo.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Reporte HTML Interactivo generado con éxito.');
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const dataJson = JSON.stringify(allTurbines, null, 2);
    const blob = new Blob([dataJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orbitas_Turbogeneradores_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Archivo JSON de datos exportado.');
  };

  // Import JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (Array.isArray(parsed) && parsed[0]?.periods) {
            onImportData(parsed);
            setDownloadSuccess('Datos importados correctamente.');
          } else {
            alert('El archivo no contiene un formato de turbomáquinas válido.');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto select-none">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Exportar Reporte Didáctico de Órbitas
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Option 1: Standalone HTML (Like Power BI interactive report) */}
          <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-lg hover:border-blue-400 transition-all space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 font-bold text-blue-900 text-sm">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Reporte HTML Autónomo Interactivo</span>
                </span>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  Genera un único archivo <strong>.html</strong> que contiene todos los meses, órbitas, comentarios y el visualizador interactivo. Cualquier usuario final (gerentes, clientes, mecánicos) puede abrirlo en cualquier navegador web sin necesidad de tener la app instalada, tal como un informe de Power BI publicado.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportInteractiveHtml}
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo HTML Interactivo (.html)</span>
            </button>
          </div>

          {/* Option 2: Print / PDF Report */}
          <div className="p-4 border border-slate-200 bg-slate-50 rounded-lg hover:border-slate-300 transition-all space-y-2">
            <div>
              <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-sm">
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Imprimir / Exportar a PDF</span>
              </span>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                Abre la vista de impresión del navegador formateada para generar un reporte ejecutivo en formato PDF con encabezado, gráficos y firmas de auditoría.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir o Guardar como PDF</span>
            </button>
          </div>

          {/* Option 3: JSON Data backup */}
          <div className="p-4 border border-slate-200 bg-white rounded-lg hover:border-slate-300 transition-all space-y-2">
            <div>
              <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-sm">
                <FileJson className="w-4 h-4 text-amber-600" />
                <span>Copia de Seguridad de Datos (JSON)</span>
              </span>
              <p className="text-slate-600 text-xs mt-1">
                Exporta o restaura todo el histórico de mediciones, imágenes cargadas y configuraciones de turbogeneradores.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportJson}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded border border-slate-300 flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
              <label className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded border border-slate-300 flex items-center justify-center gap-1 cursor-pointer">
                <span>Importar JSON</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
