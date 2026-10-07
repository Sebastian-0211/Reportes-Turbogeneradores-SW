import React, { useState, useMemo } from 'react';
import { ChannelMeasurement } from '../types/turbomachine';
import { generateOrbitAndWaveform, formatUnit } from '../utils/orbitMath';
import { Camera, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface OrbitVisualizerProps {
  measurement: ChannelMeasurement;
  titleOverride?: string;
  onUploadImage?: (file: File) => void;
  accentBorderColor?: string;
}

export const OrbitVisualizer: React.FC<OrbitVisualizerProps> = ({
  measurement,
  titleOverride,
  onUploadImage,
  accentBorderColor = 'border-blue-900',
}) => {
  const [viewMode, setViewMode] = useState<'vector' | 'image'>(
    measurement.imageUrl ? 'image' : 'vector'
  );
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [contrastBoost, setContrastBoost] = useState<boolean>(false);

  // Generate vector orbit & waveform data
  const { orbit, waveform } = useMemo(() => {
    return generateOrbitAndWaveform(measurement);
  }, [measurement]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadImage) {
      onUploadImage(e.target.files[0]);
      setViewMode('image');
    }
  };

  const ringMax = Math.max(orbit.maxRadius, 0.72);
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0].map((f) => +(ringMax * f).toFixed(2));

  // Svg orbit bounds
  const cx = 130;
  const cy = 130;
  const radiusPx = 100;
  const scale = radiusPx / ringMax;

  // Orbit path d string
  const orbitPathD = useMemo(() => {
    if (!orbit.points.length) return '';
    return orbit.points.reduce((acc, pt, idx) => {
      const px = cx + pt.x * scale;
      const py = cy - pt.y * scale; // Invert Y for cartesian
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)},${py.toFixed(1)}`;
    }, '');
  }, [orbit.points, scale]);

  // Waveform SVG path
  const waveWidth = 240;
  const waveHeight = 54;
  const waveMidY = waveHeight / 2;
  const maxWaveAmp = Math.max(measurement.pkToPkX, measurement.pkToPkY, 0.5) / 1.7;

  const xWavePathD = useMemo(() => {
    return waveform.xWave.reduce((acc, pt, idx) => {
      const px = (pt.x / 2) * waveWidth;
      const py = waveMidY - (pt.y / maxWaveAmp) * (waveMidY * 0.85);
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)},${py.toFixed(1)}`;
    }, '');
  }, [waveform.xWave, maxWaveAmp]);

  const yWavePathD = useMemo(() => {
    return waveform.yWave.reduce((acc, pt, idx) => {
      const px = (pt.x / 2) * waveWidth;
      const py = waveMidY - (pt.y / maxWaveAmp) * (waveMidY * 0.85);
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)},${py.toFixed(1)}`;
    }, '');
  }, [waveform.yWave, maxWaveAmp]);

  return (
    <div className={`relative bg-white border-2 ${accentBorderColor} rounded-xs shadow-sm overflow-hidden flex flex-col`}>
      {/* Top Banner matching Power BI card header */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm tracking-wide">
            {titleOverride || measurement.label}
          </span>
          {measurement.criticality === 'critico' && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" /> Peligro Zona D
            </span>
          )}
          {measurement.criticality === 'vigilancia' && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Defecto en toma
            </span>
          )}
          {measurement.criticality === 'alerta' && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
              <AlertTriangle className="w-3 h-3 text-orange-600" /> Alerta Zona C
            </span>
          )}
          {measurement.criticality === 'normal' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Normal Zona A
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-mono text-slate-700">{measurement.dateStr}</span>
          <div className="flex items-center bg-slate-200 rounded p-0.5">
            <button
              onClick={() => setViewMode('vector')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                viewMode === 'vector' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vector
            </button>
            <button
              onClick={() => setViewMode('image')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors flex items-center gap-1 ${
                viewMode === 'image' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3 h-3" />
              Imagen {measurement.imageUrl ? '✓' : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Vector view vs Image view */}
      {viewMode === 'image' ? (
        <div className="p-3 bg-slate-900 text-white min-h-[290px] flex flex-col justify-between">
          <div className="relative overflow-hidden rounded bg-black flex items-center justify-center min-h-[240px]">
            {measurement.imageUrl ? (
              <img
                src={measurement.imageUrl}
                alt={measurement.label}
                style={{
                  transform: `scale(${imageZoom})`,
                  filter: contrastBoost ? 'contrast(135%) brightness(105%)' : 'none',
                }}
                className="max-h-[300px] w-auto object-contain transition-transform duration-150"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-10 h-10 mx-auto mb-2 text-slate-500 opacity-80" />
                <p className="text-sm font-medium text-slate-300">No hay imagen capturada para esta medición</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-3">
                  Carga la captura de pantalla de Bently Nevada / System 1 o software de vibración correspondiente a este cojinete.
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-colors shadow-sm">
                  <span>Cargar Imagen</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                <span>{measurement.imageUrl ? 'Reemplazar imagen' : 'Subir imagen'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {measurement.imageUrl && (
                <button
                  onClick={() => setContrastBoost(!contrastBoost)}
                  className={`text-[11px] px-2 py-0.5 rounded border ${
                    contrastBoost ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-300'
                  }`}
                >
                  Filtro Contraste
                </button>
              )}
            </div>

            {measurement.imageUrl && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setImageZoom((z) => Math.max(0.7, z - 0.2))}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300"
                  title="Alejar"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-400">{Math.round(imageZoom * 100)}%</span>
                <button
                  onClick={() => setImageZoom((z) => Math.min(2.5, z + 0.2))}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300"
                  title="Acercar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setImageZoom(1)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400"
                  title="Reiniciar zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Vector & Waveform view matching user's Power BI layout */
        <div className="p-2.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Left Column: Waveforms (X and Y displacement vs revolutions) */}
          <div className="md:col-span-7 flex flex-col gap-2.5">
            {/* 1st Waveform: Probe X */}
            <div className="border border-slate-200 rounded p-1.5 bg-white">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-0.5 border-b border-slate-100 pb-0.5">
                <span className="text-blue-900 font-bold">{measurement.probeXName}</span>
                <span className="text-[10px] text-slate-500 font-mono">Displacement in {measurement.unit}</span>
              </div>
              
              <div className="grid grid-cols-12 gap-1 items-center">
                {/* Waveform curve */}
                <div className="col-span-7">
                  <div className="relative h-14 bg-slate-50 border border-slate-200 rounded overflow-hidden">
                    <svg className="w-full h-full" viewBox={`0 0 ${waveWidth} ${waveHeight}`} preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1={waveMidY} x2={waveWidth} y2={waveMidY} stroke="#cbd5e1" strokeDasharray="2,2" strokeWidth="1" />
                      {[0, 60, 120, 180, 240, 300, 360, 420].map((deg, i) => (
                        <line
                          key={i}
                          x1={(i / 7) * waveWidth}
                          y1="0"
                          x2={(i / 7) * waveWidth}
                          y2={waveHeight}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Sine waveform path */}
                      <path d={xWavePathD} fill="none" stroke="#2563eb" strokeWidth="1.75" />
                    </svg>
                    <div className="absolute bottom-0 inset-x-0 flex justify-between px-1 text-[8px] text-slate-400 font-mono">
                      <span>0°</span>
                      <span>120°</span>
                      <span>240°</span>
                      <span>360°</span>
                      <span>1 Rev</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-center text-slate-400 mt-0.5 font-sans">Revolutions</div>
                </div>

                {/* Probe X Analyze parameters */}
                <div className="col-span-5 bg-slate-50 rounded p-1 text-[10px] font-mono leading-tight text-slate-700 border border-slate-200/80">
                  <div className="font-sans font-bold text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Analyze</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RPM:</span>
                    <span className="font-semibold">{measurement.rpm.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Freq:</span>
                    <span>{measurement.freqHz.toFixed(1)} Hz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LOAD:</span>
                    <span>{measurement.loadPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-0.5">
                    <span className="text-blue-900 font-semibold">PkToPk:</span>
                    <span className="font-bold text-slate-900">{measurement.pkToPkX.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-slate-500">Pk(+):</span>
                    <span>{measurement.pkPlusX.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-slate-500">Pk(-):</span>
                    <span>{measurement.pkMinusX.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-slate-500">Crest:</span>
                    <span>{measurement.crestX.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2nd Waveform: Probe Y */}
            <div className="border border-slate-200 rounded p-1.5 bg-white">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-0.5 border-b border-slate-100 pb-0.5">
                <span className="text-blue-900 font-bold">{measurement.probeYName}</span>
                <span className="text-[10px] text-slate-500 font-mono">Displacement in {measurement.unit}</span>
              </div>

              <div className="grid grid-cols-12 gap-1 items-center">
                {/* Waveform curve */}
                <div className="col-span-7">
                  <div className="relative h-14 bg-slate-50 border border-slate-200 rounded overflow-hidden">
                    <svg className="w-full h-full" viewBox={`0 0 ${waveWidth} ${waveHeight}`} preserveAspectRatio="none">
                      <line x1="0" y1={waveMidY} x2={waveWidth} y2={waveMidY} stroke="#cbd5e1" strokeDasharray="2,2" strokeWidth="1" />
                      {[0, 60, 120, 180, 240, 300, 360, 420].map((deg, i) => (
                        <line
                          key={i}
                          x1={(i / 7) * waveWidth}
                          y1="0"
                          x2={(i / 7) * waveWidth}
                          y2={waveHeight}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                      ))}
                      <path d={yWavePathD} fill="none" stroke="#0284c7" strokeWidth="1.75" />
                    </svg>
                    <div className="absolute bottom-0 inset-x-0 flex justify-between px-1 text-[8px] text-slate-400 font-mono">
                      <span>0°</span>
                      <span>120°</span>
                      <span>240°</span>
                      <span>360°</span>
                      <span>1 Rev</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-center text-slate-400 mt-0.5 font-sans">Revolutions</div>
                </div>

                {/* Probe Y Analyze parameters */}
                <div className="col-span-5 bg-slate-50 rounded p-1 text-[10px] font-mono leading-tight text-slate-700 border border-slate-200/80">
                  <div className="font-sans font-bold text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Analyze</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RPM:</span>
                    <span className="font-semibold">{measurement.rpm.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LOAD:</span>
                    <span>{measurement.loadPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-0.5">
                    <span className="text-blue-900 font-semibold">PkToPk:</span>
                    <span className="font-bold text-slate-900">{measurement.pkToPkY.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-slate-500">Pk(+):</span>
                    <span>{measurement.pkPlusY.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-slate-500">Pk(-):</span>
                    <span>{measurement.pkMinusY.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-slate-500">Crest:</span>
                    <span>{measurement.crestY.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Polar Orbit Chart + Telemetry parameters */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[260px] aspect-square flex items-center justify-center bg-white">
              <svg className="w-full h-full" viewBox="0 0 260 260">
                {/* Concentric clearance rings */}
                {rings.map((rVal, idx) => {
                  const rPx = rVal * scale;
                  return (
                    <g key={idx}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={rPx}
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray={idx === rings.length - 1 ? 'none' : '2,2'}
                      />
                      {/* Radius scale number */}
                      <text
                        x={cx + 3}
                        y={cy - rPx + 4}
                        fill="#64748b"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {rVal}
                      </text>
                    </g>
                  );
                })}

                {/* Axes lines (0°, 90°, 180°, 270°) */}
                <line x1={cx - radiusPx * 1.15} y1={cy} x2={cx + radiusPx * 1.15} y2={cy} stroke="#94a3b8" strokeWidth="1" />
                <line x1={cx} y1={cy - radiusPx * 1.15} x2={cx} y2={cy + radiusPx * 1.15} stroke="#94a3b8" strokeWidth="1" />

                {/* Angular labels */}
                <text x={cx} y={cy - radiusPx * 1.18} textAnchor="middle" fill="#334155" fontSize="9" fontWeight="bold">0°</text>
                <text x={cx + radiusPx * 1.25} y={cy + 3} textAnchor="start" fill="#334155" fontSize="9" fontWeight="bold">90°</text>
                <text x={cx} y={cy + radiusPx * 1.26} textAnchor="middle" fill="#334155" fontSize="9" fontWeight="bold">180°</text>
                <text x={cx - radiusPx * 1.25} y={cy + 3} textAnchor="end" fill="#334155" fontSize="9" fontWeight="bold">270°</text>

                {/* Keyphasor radial reference line */}
                {(() => {
                  const rad = (measurement.angleDeg * Math.PI) / 180;
                  const kx = cx + Math.cos(rad) * radiusPx * 0.95;
                  const ky = cy - Math.sin(rad) * radiusPx * 0.95;
                  return (
                    <g>
                      <line x1={cx} y1={cy} x2={kx} y2={ky} stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,2" />
                      <circle cx={kx} cy={ky} r="2.5" fill="#ef4444" />
                    </g>
                  );
                })()}

                {/* Lissajous Orbit trajectory */}
                <path
                  d={orbitPathD}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Keyphasor blanking / trigger dot */}
                {(() => {
                  const kpPx = cx + orbit.keyphasorPoint.x * scale;
                  const kpPy = cy - orbit.keyphasorPoint.y * scale;
                  return (
                    <g>
                      <circle cx={kpPx} cy={kpPy} r="3.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  );
                })()}
              </svg>

              {/* Polar Parameters Summary box (matching user's Power BI layout on bottom right of the orbit) */}
              <div className="absolute top-1 right-1 text-[9px] font-mono leading-tight text-slate-600 bg-white/90 backdrop-blur-xs p-1 rounded border border-slate-200 shadow-xs pointer-events-none">
                <div>Units = {measurement.unit}</div>
                <div>X Diff = {measurement.xDiff.toFixed(3)}</div>
                <div>Y Diff = {measurement.yDiff.toFixed(3)}</div>
                <div>LOAD = {measurement.loadPct.toFixed(1)}</div>
                <div className="font-semibold text-slate-800">{measurement.rpm.toFixed(1)} Rpm</div>
              </div>

              <div className="absolute bottom-1 right-1 text-[9px] font-mono leading-tight text-rose-700 bg-rose-50/90 p-1 rounded border border-rose-200 pointer-events-none text-right">
                <div>Rev: {measurement.rev.toFixed(3)}</div>
                <div>{measurement.probeXName}: {measurement.valX.toFixed(3)}</div>
                <div>{measurement.probeYName}: {measurement.valY.toFixed(3)}</div>
                <div className="font-bold">Angl: {measurement.angleDeg.toFixed(2)}°</div>
              </div>
            </div>

            {/* Orbit Pattern classification tag */}
            <div className="mt-1 text-center">
              <span className="text-[10px] text-slate-500 font-medium">
                Morfología: <strong className="text-slate-800">
                  {measurement.patternType === '1X_normal' && 'Elíptica Sincrónica 1X'}
                  {measurement.patternType === 'sensor_defect' && 'Deformación / Defecto Transitorio'}
                  {measurement.patternType === 'misalignment_2X' && 'Lazo en Ocho 2X (Desalineación)'}
                  {measurement.patternType === 'oil_whirl_sub' && 'Lazo Subsincrónico (Oil Whirl)'}
                  {measurement.patternType === 'rubbing_contact' && 'Órbita Truncada (Roce Mecánico)'}
                  {measurement.patternType === 'unbalance_1X' && 'Circular 1X (Desbalance)'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
