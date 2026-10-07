export type CriticalityLevel = 'normal' | 'alerta' | 'vigilancia' | 'critico';

export type OrbitPattern = 
  | '1X_normal'
  | 'unbalance_1X'
  | 'misalignment_2X'
  | 'oil_whirl_sub'
  | 'rubbing_contact'
  | 'sensor_defect'
  | 'mechanical_looseness';

export interface BearingSupportConfig {
  id: string; // e.g. "A1", "A2", "A3"
  number: number; // 1, 2, 3...
  name: string; // e.g. "Apoyo 1 - Lado Libre Turbina"
  shaftSection: 'turbina' | 'reductor' | 'generador' | 'auxiliar';
  proximitorsCount: number; // 2 (X e Y) or 1
  probeXName: string; // e.g. "1TX"
  probeYName: string; // e.g. "1TY"
}

export interface ChannelMeasurement {
  id: string; // e.g. "C1", "C2", ...
  bearingId?: string; // e.g. "A1"
  code: string; // e.g. "TG4-1X-C1-08-01-2026"
  label: string; // e.g. "1TX/1TY - L. LIBRE TURBINA"
  probeXName: string; // e.g. "1TX"
  probeYName: string; // e.g. "1TY"
  unit: 'mils' | 'microns';
  dateStr: string; // e.g. "8/01/2026 2:51:51 p. m."
  rpm: number; // e.g. 7084.3
  freqHz: number; // e.g. 118.07
  loadPct: number; // e.g. 100.00
  xDiff: number; // e.g. 0.897
  yDiff: number; // e.g. 0.949
  pkToPkX: number; // e.g. 0.851
  pkToPkY: number; // e.g. 0.918
  pkPlusX: number; // e.g. 0.478
  pkMinusX: number; // e.g. 0.410
  crestX: number; // e.g. 1.590
  pkPlusY: number; // e.g. 0.429
  pkMinusY: number; // e.g. 0.520
  crestY: number; // e.g. 1.602
  rev: number; // e.g. 0.354
  valX: number; // e.g. 0.367
  valY: number; // e.g. 0.253
  angleDeg: number; // e.g. 55.42
  criticality: CriticalityLevel;
  patternType: OrbitPattern;
  comment: string;
  recommendation?: string;
  imageUrl?: string; // uploaded image base64
  defectObserved?: string;
}

export interface PeriodReport {
  id: string; // e.g. "2026-01"
  periodLabel: string; // e.g. "Enero 2026"
  displayTitle: string; // e.g. "Orbitas TG4 Enero 2026"
  date: string; // e.g. "2026-01-08"
  generalComment: string;
  selectedChannelId: string;
  overallCriticality: CriticalityLevel;
  channels: ChannelMeasurement[];
}

export interface Turbomachine {
  id: string; // e.g. "tg4"
  name: string; // e.g. "TG4"
  fullName: string; // e.g. "Turbogenerador TG4 - Smurfit Westrock"
  tag: string; // e.g. "TG4-1X"
  nominalRpm: number; // e.g. 7080
  ratedPowerMW: number; // e.g. 25
  company: string; // e.g. "Smurfit Westrock"
  logoUrl?: string; // base64 or url
  analyst: string; // e.g. "Joan Sebastian Escobar Mayorga"
  bearingSupports?: BearingSupportConfig[]; // Lista de apoyos configurados
  periods: PeriodReport[];
}

export interface DidacticGuideItem {
  id: OrbitPattern;
  title: string;
  subtitle: string;
  orbitDescription: string;
  waveformDescription: string;
  commonCauses: string[];
  recommendations: string[];
  severityNote: string;
}
