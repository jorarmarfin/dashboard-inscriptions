
export enum DashboardView {
  ADMISION = 'admision',
  SIMULACRO = 'simulacro'
}

export interface DailyData {
  fecha: string;
  preinscritos: number;
  derechoExamen: number;
  pagos: number;
}

export interface SummaryStats {
  totalPreinscritos: number;
  totalConSede: number;
  derechoExamen: number | string;
  totalPagos: number;
  promedioGap: number;
}

// API Response Types
export interface ApiDataItem {
  fecha: string;
  cantidad: number;
}

export interface ApiResponse {
  message: string;
  data: ApiDataItem[];
}

