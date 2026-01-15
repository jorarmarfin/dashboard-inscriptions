import { useState, useEffect, useCallback } from 'react';
import { DailyData, ApiDataItem } from '../types';
import { fetchPreregisteredApplicants, fetchPaymentsCount } from '../services/api';

interface UseDashboardDataReturn {
  data: DailyData[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const mergeApiData = (
  preregistered: ApiDataItem[],
  payments: ApiDataItem[]
): DailyData[] => {
  // Create a map of payments by date
  const paymentsMap = new Map<string, number>();
  payments.forEach(item => {
    paymentsMap.set(item.fecha, item.cantidad);
  });

  // Merge data based on preregistered dates
  const allDates = new Set<string>();
  preregistered.forEach(item => allDates.add(item.fecha));
  payments.forEach(item => allDates.add(item.fecha));

  // Create preregistered map
  const preregisteredMap = new Map<string, number>();
  preregistered.forEach(item => {
    preregisteredMap.set(item.fecha, item.cantidad);
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

export const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let preregisteredData: ApiDataItem[] = [];
      let paymentsData: ApiDataItem[] = [];

      try {
        const preregisteredResponse = await fetchPreregisteredApplicants();
        preregisteredData = Array.isArray(preregisteredResponse?.data)
          ? preregisteredResponse.data
          : [];
      } catch (preErr) {
        // Error silencioso para preregistered
      }

      try {
        const paymentsResponse = await fetchPaymentsCount();
        paymentsData = Array.isArray(paymentsResponse?.data)
          ? paymentsResponse.data
          : [];
      } catch (payErr) {
        // Error silencioso para payments
      }

      const mergedData = mergeApiData(preregisteredData, paymentsData);
      setData(mergedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData
  };
};

