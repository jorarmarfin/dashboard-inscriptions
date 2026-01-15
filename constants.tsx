
import { DailyData, SummaryStats } from './types';

export const MOCK_DATA_ADMISION: DailyData[] = [
  { fecha: '2026-01-13', preinscritos: 85, derechoExamen: 0, pagos: 40 },
  { fecha: '2026-01-12', preinscritos: 228, derechoExamen: 0, pagos: 57 },
  { fecha: '2026-01-11', preinscritos: 188, derechoExamen: 0, pagos: 20 },
  { fecha: '2026-01-10', preinscritos: 171, derechoExamen: 0, pagos: 22 },
  { fecha: '2026-01-09', preinscritos: 186, derechoExamen: 0, pagos: 33 },
  { fecha: '2026-01-08', preinscritos: 165, derechoExamen: 0, pagos: 28 },
  { fecha: '2026-01-07', preinscritos: 210, derechoExamen: 0, pagos: 45 },
  { fecha: '2026-01-06', preinscritos: 350, derechoExamen: 0, pagos: 10 },
];

export const SUMMARY_ADMISION: SummaryStats = {
  totalPreinscritos: 1752,
  totalConSede: 1752,
  derechoExamen: 'Sin datos',
  totalPagos: 196,
  promedioGap: 0,
};

export const MOCK_DATA_SIMULACRO: DailyData[] = [
  { fecha: '2026-01-13', preinscritos: 45, derechoExamen: 10, pagos: 30 },
  { fecha: '2026-01-12', preinscritos: 120, derechoExamen: 5, pagos: 80 },
  { fecha: '2026-01-11', preinscritos: 90, derechoExamen: 2, pagos: 45 },
  { fecha: '2026-01-10', preinscritos: 110, derechoExamen: 8, pagos: 50 },
  { fecha: '2026-01-09', preinscritos: 130, derechoExamen: 12, pagos: 90 },
];

export const SUMMARY_SIMULACRO: SummaryStats = {
  totalPreinscritos: 495,
  totalConSede: 490,
  derechoExamen: 35,
  totalPagos: 295,
  promedioGap: 0,
};
