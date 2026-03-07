import { useState, useEffect, useCallback } from 'react';
import { DailyData, ApiDataItem, DashboardView, PartialScholarshipItem, SocialItem, SpecialtyItem } from '../types';
import {
  fetchPreregisteredApplicants,
  fetchPaymentsCount,
  fetchSimulationApplicantsCount,
  fetchSimulationPaymentsCount,
  fetchPartialScholarshipCount,
  fetchApplicantsVocationalCepreCount,
  fetchApplicantsVocationalCepreIntensiveCount,
  fetchSwornDeclarationStatus,
  fetchSocialSocialCount,
  fetchSpecialtyCount,
  fetchCountRightToExamination
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

export interface UseDashboardDataReturn {
  data: DailyData[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  partialScholarships: PartialScholarshipItem[];
  partialTotal: number;
  vocationalCepreTotal: number;
  vocationalCepreIntensiveTotal: number;
  swornDeclarations: PartialScholarshipItem[];
  swornTotal: number;
  socialItems: SocialItem[];
  socialTotal: number;
  socialLoaded: boolean;
  specialtyItems: SpecialtyItem[];
  specialtyTotal: number;
  rightToExaminationTotal: number;
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

  const [swornDeclarations, setSwornDeclarations] = useState<PartialScholarshipItem[]>([]);
  const [swornTotal, setSwornTotal] = useState<number>(0);

  const [socialItems, setSocialItems] = useState<SocialItem[]>([]);
  const [socialTotal, setSocialTotal] = useState<number>(0);
  const [socialLoaded, setSocialLoaded] = useState<boolean>(false);

  const [specialtyItems, setSpecialtyItems] = useState<SpecialtyItem[]>([]);
  const [specialtyTotal, setSpecialtyTotal] = useState<number>(0);

  const [rightToExaminationTotal, setRightToExaminationTotal] = useState<number>(0);

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

      // Fetch partial scholarships and related ADMISION-only endpoints
      if (view === DashboardView.ADMISION) {
        try {
          const partialResp = await fetchPartialScholarshipCount();
          const items = Array.isArray(partialResp?.data) ? partialResp.data : [];
          setPartialScholarships(items);
          setPartialTotal(items.reduce((acc, it) => acc + (it.cantidad || 0), 0));
        } catch (psErr) {
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

        // Fetch sworn declaration status
        try {
          const swornResp = await fetchSwornDeclarationStatus();
          const rawSworn = Array.isArray(swornResp?.data) ? swornResp.data : [];
          // Mapear explícitamente para asegurar la forma { estado, cantidad }
          const swornItemsMapped: PartialScholarshipItem[] = rawSworn.map((it: any) => ({
            estado: it.estado ?? it.descripcion ?? 'N/A',
            cantidad: typeof it.cantidad === 'number' ? it.cantidad : Number(it.cantidad) || 0
          }));
          setSwornDeclarations(swornItemsMapped);
          setSwornTotal(swornItemsMapped.reduce((acc, it) => acc + (it.cantidad || 0), 0));
        } catch (swErr) {
          setSwornDeclarations([]);
          setSwornTotal(0);
        }

        // Fetch social/social count
        try {
          const socialResp = await fetchSocialSocialCount();
          // socialResp puede venir en distintas formas:
          // - { message, data: [ { descripcion, cantidad }, ... ] }
          // - [ { descripcion, cantidad }, ... ]
          // - { data: '...json string...' } u otras variaciones.
          let rawSocial: any[] = [];

          const attemptExtractArray = (maybe: any): any[] | null => {
            if (Array.isArray(maybe)) return maybe;
            if (typeof maybe === 'string') {
              // intentar parsear string que contenga JSON
              try {
                const parsed = JSON.parse(maybe);
                if (Array.isArray(parsed)) return parsed;
                if (parsed && Array.isArray(parsed.data)) return parsed.data;
              } catch (_) {
                // no JSON
                return null;
              }
            }
            if (maybe && typeof maybe === 'object') {
              if (Array.isArray(maybe.data)) return maybe.data;
              if (Array.isArray(maybe.result)) return maybe.result;
            }
            return null;
          };

          // 1) si la respuesta es ya un array
          if (Array.isArray(socialResp)) {
            rawSocial = socialResp as any[];
          } else {
            // 2) intentar extraer un array de varias propiedades conocidas
            const candidates = [ (socialResp as any).data, (socialResp as any).result, socialResp ];
            for (const c of candidates) {
              const extracted = attemptExtractArray(c);
              if (Array.isArray(extracted)) {
                rawSocial = extracted;
                break;
              }
            }

            // 3) como fallback, intentar buscar la primera propiedad que sea array
            if (rawSocial.length === 0 && socialResp && typeof socialResp === 'object') {
              const possible = Object.values(socialResp).find(v => Array.isArray(v));
              if (Array.isArray(possible)) rawSocial = possible as any[];
            }
          }

          const socialMapped: SocialItem[] = rawSocial.map((it: any) => ({
            descripcion: it.descripcion ?? it.label ?? it.name ?? String(it.estado ?? it.origen ?? it.descripcion ?? ''),
            cantidad: typeof it.cantidad === 'number' ? it.cantidad : Number(it.cantidad) || 0
          }));

          setSocialItems(socialMapped);
          setSocialTotal(socialMapped.reduce((acc, it) => acc + (it.cantidad || 0), 0));
          setSocialLoaded(true);
        } catch (socErr) {
          setSocialItems([]);
          setSocialTotal(0);
          setSocialLoaded(true);
        }

        // Fetch specialty count
        try {
          const specialtyResp = await fetchSpecialtyCount();
          // La respuesta puede ser directamente un array o { data: [...] }
          const rawSpecialty = Array.isArray(specialtyResp)
            ? specialtyResp
            : (Array.isArray(specialtyResp?.data) ? specialtyResp.data : []);
          const specialtyMapped: SpecialtyItem[] = rawSpecialty.map((it: any) => ({
            codigo: it.codigo ?? '',
            especialidad: it.especialidad ?? '',
            cantidad: typeof it.cantidad === 'number' ? it.cantidad : Number(it.cantidad) || 0
          }));
          setSpecialtyItems(specialtyMapped);
          setSpecialtyTotal(specialtyMapped.reduce((acc, it) => acc + (it.cantidad || 0), 0));
        } catch (specErr) {
          setSpecialtyItems([]);
          setSpecialtyTotal(0);
        }

        // Fetch count right to examination
        try {
          const rightExamResp = await fetchCountRightToExamination();
          const rightExamItems = Array.isArray(rightExamResp?.data) ? rightExamResp.data : [];
          const rightExamTotal = rightExamItems.reduce((acc, it) => acc + (it.cantidad || 0), 0);
          setRightToExaminationTotal(rightExamTotal);
        } catch (rightExamErr) {
          setRightToExaminationTotal(0);
        }
      } else {
        setPartialScholarships([]);
        setPartialTotal(0);
        setVocationalCepreTotal(0);
        setVocationalCepreIntensiveTotal(0);
        setSwornDeclarations([]);
        setSwornTotal(0);
        setSocialItems([]);
        setSocialTotal(0);
        setSocialLoaded(false);
        setSpecialtyItems([]);
        setSpecialtyTotal(0);
        setRightToExaminationTotal(0);
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
    vocationalCepreIntensiveTotal,
    swornDeclarations,
    swornTotal,
    socialItems,
    socialTotal,
    socialLoaded,
    specialtyItems,
    specialtyTotal,
    rightToExaminationTotal
  };
};
