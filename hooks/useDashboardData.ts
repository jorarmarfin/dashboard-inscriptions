import { useState, useEffect, useCallback } from 'react';
import { DailyData, ApiDataItem, DashboardView, PartialScholarshipItem } from '../types';
import {
  fetchPreregisteredApplicants,
  fetchPaymentsCount,
  fetchSimulationApplicantsCount,
  fetchSimulationPaymentsCount,
  fetchPartialScholarshipCount,
  fetchApplicantsVocationalCepreCount,
  fetchApplicantsVocationalCepreIntensiveCount
} from '../services/api';

/**
 * useDashboardData hook
 *
 * Documentación importante sobre el cambio de vista:
 * - El hook acepta un parámetro `view: DashboardView` (por defecto ADMISION).
 * - Cuando `view` cambia (p. ej. por `setCurrentView` en `App` cuando el usuario
 *   clickea en el `Header`), el efecto que depende de `view` vuelve a ejecutar
 *   `fetchData` y el hook reobtiene los datos correspondientes a la nueva vista.
 * - En ADMISION se consumen los endpoints de admisión (preinscritos, pagos, semibecas).
 * - En SIMULACRO se consumen los endpoints de simulacro (inscritos y pagos simulacro).
 * - El `App` pasa `currentView` a `useDashboardData(currentView)` para que el
 *   hook gestione automáticamente el re-fetch cuando la vista cambie.
 */

interface UseDashboardDataReturn {
  data: DailyData[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  partialScholarships: PartialScholarshipItem[];
  partialTotal: number;
  vocationalCepreTotal: number;
  vocationalCepreIntensiveTotal: number;
}

const mergeApiData = (
  preregistered: ApiDataItem[],
  payments: ApiDataItem[]
): DailyData[] => {
  // Create a map of payments by date and sum quantities if multiple entries exist
  const paymentsMap = new Map<string, number>();
  payments.forEach(item => {
    const prev = paymentsMap.get(item.fecha) || 0;
    paymentsMap.set(item.fecha, prev + item.cantidad);
  });

  // Merge data based on preregistered dates
  const allDates = new Set<string>();
  preregistered.forEach(item => allDates.add(item.fecha));
  payments.forEach(item => allDates.add(item.fecha));

  // Create preregistered map and sum quantities per date
  const preregisteredMap = new Map<string, number>();
  preregistered.forEach(item => {
    const prev = preregisteredMap.get(item.fecha) || 0;
    preregisteredMap.set(item.fecha, prev + item.cantidad);
  });

  // Merge and create DailyData array
  const mergedData: DailyData[] = Array.from(allDates).map(fecha => {
    const preinscritos = preregisteredMap.get(fecha) || 0;
    const pagos = paymentsMap.get(fecha) || 0;
    return {
      fecha,
      preinscritos,
      derechoExamen: 0,
      pagos
    };
  });

  // Sort by date descending (most recent first)
  return mergedData.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const useDashboardData = (view: DashboardView = DashboardView.ADMISION): UseDashboardDataReturn => {
  const [data, setData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [partialScholarships, setPartialScholarships] = useState<PartialScholarshipItem[]>([]);
  const [partialTotal, setPartialTotal] = useState<number>(0);
  const [vocationalCepreTotal, setVocationalCepreTotal] = useState<number>(0);
  const [vocationalCepreIntensiveTotal, setVocationalCepreIntensiveTotal] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let preregisteredData: ApiDataItem[] = [];
      let paymentsData: ApiDataItem[] = [];

      try {
        if (view === DashboardView.ADMISION) {
          const preregisteredResponse = await fetchPreregisteredApplicants();
          preregisteredData = Array.isArray(preregisteredResponse?.data)
            ? preregisteredResponse.data
            : [];
        } else {
          const preregisteredResponse = await fetchSimulationApplicantsCount();
          preregisteredData = Array.isArray(preregisteredResponse?.data)
            ? preregisteredResponse.data
            : [];
        }
      } catch (preErr) {
        // silencioso
      }

      try {
        if (view === DashboardView.ADMISION) {
          const paymentsResponse = await fetchPaymentsCount();
          paymentsData = Array.isArray(paymentsResponse?.data)
            ? paymentsResponse.data
            : [];
        } else {
          const paymentsResponse = await fetchSimulationPaymentsCount();
          paymentsData = Array.isArray(paymentsResponse?.data)
            ? paymentsResponse.data
            : [];
        }
      } catch (payErr) {
        // silencioso
      }

      // Fetch partial scholarships only for ADMISION
      if (view === DashboardView.ADMISION) {
        try {
          const partialResp = await fetchPartialScholarshipCount();
          const items = Array.isArray(partialResp?.data) ? partialResp.data : [];
          setPartialScholarships(items);
          setPartialTotal(items.reduce((acc, it) => acc + (it.cantidad || 0), 0));
        } catch (psErr) {
          // silencioso - no bloquear el resto
          setPartialScholarships([]);
          setPartialTotal(0);
        }

        // Fetch CEPRE vocational counts (regular and intensive)
        try {
          const cepreResp = await fetchApplicantsVocationalCepreCount();
          const cepreItems = Array.isArray(cepreResp?.data) ? cepreResp.data : [];
          const cepreTotal = cepreItems.reduce((acc, it) => acc + (it.cantidad || 0), 0);
          setVocationalCepreTotal(cepreTotal);
        } catch (cepErr) {
          setVocationalCepreTotal(0);
        }

        try {
          const cepreIntResp = await fetchApplicantsVocationalCepreIntensiveCount();
          const cepreIntItems = Array.isArray(cepreIntResp?.data) ? cepreIntResp.data : [];
          const cepreIntTotal = cepreIntItems.reduce((acc, it) => acc + (it.cantidad || 0), 0);
          setVocationalCepreIntensiveTotal(cepreIntTotal);
        } catch (cepIntErr) {
          setVocationalCepreIntensiveTotal(0);
        }
      } else {
        setPartialScholarships([]);
        setPartialTotal(0);
        setVocationalCepreTotal(0);
        setVocationalCepreIntensiveTotal(0);
      }

      const mergedData = mergeApiData(preregisteredData, paymentsData);
      setData(mergedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    partialScholarships,
    partialTotal,
    vocationalCepreTotal,
    vocationalCepreIntensiveTotal
  };
};
