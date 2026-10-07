import { ChannelMeasurement, OrbitPattern } from '../types/turbomachine';

export interface Point2D {
  x: number;
  y: number;
}

export interface WaveformData {
  revolutions: number[]; // e.g. 0 to 720 deg in fractions
  xWave: Point2D[];
  yWave: Point2D[];
}

export interface OrbitData {
  points: Point2D[];
  keyphasorPoint: Point2D;
  keyphasorAngle: number;
  maxRadius: number;
}

/**
 * Generates synthetic orbit Lissajous points and waveform curves based on channel telemetry.
 * If an uploaded image exists, the user can toggle between the real photo and the calibrated vector simulation.
 */
export function generateOrbitAndWaveform(
  ch: ChannelMeasurement,
  numPoints: number = 240
): { orbit: OrbitData; waveform: WaveformData } {
  const points: Point2D[] = [];
  const xWave: Point2D[] = [];
  const yWave: Point2D[] = [];
  const revolutions: number[] = [];

  const ampX = Math.max(0.01, ch.pkToPkX / 2);
  const ampY = Math.max(0.01, ch.pkToPkY / 2);
  const phaseShift = (ch.angleDeg * Math.PI) / 180;
  const pattern = ch.patternType;

  // Keyphasor dot location
  const kpTheta = 0;
  let kpX = 0;
  let kpY = 0;

  let maxR = 0;

  for (let i = 0; i < numPoints; i++) {
    const t = (i / (numPoints - 1)) * 4 * Math.PI; // 2 full revolutions (720 deg)
    const revFrac = t / (2 * Math.PI); // 0 to 2 revs

    let xVal = 0;
    let yVal = 0;

    switch (pattern) {
      case '1X_normal':
      case 'unbalance_1X':
        // Pure or slightly elliptical 1X
        xVal = ampX * Math.cos(t);
        yVal = ampY * Math.sin(t + phaseShift * 0.4);
        break;

      case 'misalignment_2X':
        // Figure-eight or banana shaped orbit with 2X harmonic
        xVal = ampX * Math.cos(t) + (ampX * 0.45) * Math.cos(2 * t + 0.3);
        yVal = ampY * Math.sin(t + phaseShift) + (ampY * 0.35) * Math.sin(2 * t + 0.5);
        break;

      case 'oil_whirl_sub':
        // Subsynchronous swirl (~0.44X inside loop)
        xVal = ampX * Math.cos(t) + (ampX * 0.55) * Math.cos(0.44 * t);
        yVal = ampY * Math.sin(t + phaseShift) + (ampY * 0.55) * Math.sin(0.44 * t + 0.4);
        break;

      case 'rubbing_contact':
        // Truncated / clipped orbit with high frequency bounce
        xVal = ampX * Math.cos(t);
        yVal = ampY * Math.sin(t + phaseShift);
        if (yVal > ampY * 0.5) {
          yVal = ampY * 0.5 + 0.05 * Math.sin(8 * t);
        }
        break;

      case 'sensor_defect':
        // Distorted spiral or corrupted loop like in the user's February screenshot
        const spiralDecay = 1.0 - 0.35 * Math.sin(t * 0.5);
        xVal = ampX * Math.cos(t * 0.85) * spiralDecay + 0.1 * Math.sin(3 * t);
        yVal = ampY * Math.sin(t * 1.1 + phaseShift) * spiralDecay;
        break;

      case 'mechanical_looseness':
      default:
        // Multi-frequency harmonic distortion
        xVal = ampX * Math.cos(t) + (ampX * 0.3) * Math.cos(2 * t) + (ampX * 0.15) * Math.cos(3 * t);
        yVal = ampY * Math.sin(t + phaseShift) + (ampY * 0.25) * Math.sin(2 * t);
        break;
    }

    const r = Math.sqrt(xVal * xVal + yVal * yVal);
    if (r > maxR) maxR = r;

    // We only record first revolution (0 to 2*PI) for orbit clean closed loop
    if (t <= 2 * Math.PI + 0.05) {
      points.push({ x: xVal, y: yVal });
    }

    if (i === 0) {
      kpX = xVal;
      kpY = yVal;
    }

    // Waveforms (recorded across 2 revs or 0-360)
    revolutions.push(revFrac);
    xWave.push({ x: revFrac, y: xVal });
    yWave.push({ x: revFrac, y: yVal });
  }

  return {
    orbit: {
      points,
      keyphasorPoint: { x: kpX, y: kpY },
      keyphasorAngle: ch.angleDeg,
      maxRadius: Math.max(maxR, ampX, ampY) * 1.35,
    },
    waveform: {
      revolutions,
      xWave,
      yWave,
    },
  };
}

export interface DeltaComparison {
  deltaPkToPkX: number; // absolute difference
  deltaPkToPkY: number;
  pctChangeX: number; // percentage change
  pctChangeY: number;
  hasIncreased: boolean;
  status: 'elevado' | 'estable' | 'disminuyo' | 'critico';
  message: string;
}

export function calculateDelta(
  prev: ChannelMeasurement | undefined,
  curr: ChannelMeasurement
): DeltaComparison {
  if (!prev) {
    return {
      deltaPkToPkX: 0,
      deltaPkToPkY: 0,
      pctChangeX: 0,
      pctChangeY: 0,
      hasIncreased: false,
      status: 'estable',
      message: 'Período base (sin medición previa).',
    };
  }

  // Convert to same unit if needed for comparison (1 mil = 25.4 microns)
  const normPrevX = prev.unit === curr.unit ? prev.pkToPkX : (prev.unit === 'mils' ? prev.pkToPkX * 25.4 : prev.pkToPkX / 25.4);
  const normCurrX = curr.pkToPkX;
  const normPrevY = prev.unit === curr.unit ? prev.pkToPkY : (prev.unit === 'mils' ? prev.pkToPkY * 25.4 : prev.pkToPkY / 25.4);
  const normCurrY = curr.pkToPkY;

  const deltaX = Number((normCurrX - normPrevX).toFixed(3));
  const deltaY = Number((normCurrY - normPrevY).toFixed(3));

  const pctX = normPrevX > 0 ? Number((((normCurrX - normPrevX) / normPrevX) * 100).toFixed(1)) : 0;
  const pctY = normPrevY > 0 ? Number((((normCurrY - normPrevY) / normPrevY) * 100).toFixed(1)) : 0;

  const maxPct = Math.max(pctX, pctY);
  const hasIncreased = maxPct > 10;

  let status: DeltaComparison['status'] = 'estable';
  let message = 'Vibración estable dentro de tolerancias operativas.';

  if (curr.criticality === 'critico' || maxPct > 70) {
    status = 'critico';
    message = `Alerta severa: Incremento significativo de vibración (+${maxPct}%). Requiere inspección inmediata.`;
  } else if (hasIncreased || curr.criticality === 'alerta' || curr.criticality === 'vigilancia') {
    status = 'elevado';
    message = `Incremento detectado (+${maxPct}% en eje predominante). Observar evolución y verificar lubricación.`;
  } else if (maxPct < -10) {
    status = 'disminuyo';
    message = `Disminución de vibración (${maxPct}%). Comportamiento favorable.`;
  }

  return {
    deltaPkToPkX: deltaX,
    deltaPkToPkY: deltaY,
    pctChangeX: pctX,
    pctChangeY: pctY,
    hasIncreased,
    status,
    message,
  };
}

export function formatUnit(val: number, unit: 'mils' | 'microns'): string {
  return `${val.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${unit}`;
}
