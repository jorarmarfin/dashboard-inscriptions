import { ApiResponse, PartialScholarshipResponse, SocialResponse, SpecialtyResponse, SpecialtyItem } from '../types';

const API_BASE_URL = 'http://api-diad.test';

export const fetchPreregisteredApplicants = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/applicants-preregister-count`);
  if (!response.ok) {
    throw new Error(`Error fetching preregistered applicants: ${response.status}`);
  }
  return response.json();
};

export const fetchPaymentsCount = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/payments-count`);
  if (!response.ok) {
    throw new Error(`Error fetching payments count: ${response.status}`);
  }
  return response.json();
};

export const fetchSimulationApplicantsCount = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/simulation/applicants-simulation-count`);
  if (!response.ok) {
    throw new Error(`Error fetching simulation applicants: ${response.status}`);
  }
  return response.json();
};

export const fetchSimulationPaymentsCount = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/simulation/payments-simulation-count`);
  if (!response.ok) {
    throw new Error(`Error fetching simulation payments count: ${response.status}`);
  }
  return response.json();
};

export const fetchPartialScholarshipCount = async (): Promise<PartialScholarshipResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/partial-scholarship-count`);
  if (!response.ok) {
    throw new Error(`Error fetching partial scholarship count: ${response.status}`);
  }
  return response.json();
};

// New: postulantes cepre vocational (intensive)
export const fetchApplicantsVocationalCepreIntensiveCount = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/applicants-vocational-cepre-intensive-count`);
  if (!response.ok) {
    throw new Error(`Error fetching applicants vocational cepre intensive count: ${response.status}`);
  }
  return response.json();
};

// New: postulantes cepre vocational (regular)
export const fetchApplicantsVocationalCepreCount = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/applicants-vocational-cepre-count`);
  if (!response.ok) {
    throw new Error(`Error fetching applicants vocational cepre count: ${response.status}`);
  }
  return response.json();
};

// New: postulantes vocacional (general)
export const fetchApplicantsVocationalCount = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/applicants-vocational-count`);
  if (!response.ok) {
    throw new Error(`Error fetching applicants vocational count: ${response.status}`);
  }
  return response.json();
};

// New: estado de revisión de Declaración Jurada
export const fetchSwornDeclarationStatus = async (): Promise<PartialScholarshipResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/sworn-declaration`);
  if (!response.ok) {
    throw new Error(`Error fetching sworn declaration status: ${response.status}`);
  }
  return response.json();
};

// New: resumen de redes sociales (tolerante a rutas/formatos)
export const fetchSocialSocialCount = async (): Promise<SocialResponse | any> => {
  const candidates = [
    `${API_BASE_URL}/api/admission/social-shared-count`,
    `${API_BASE_URL}/api/admission/social-social-count`,
    `${API_BASE_URL}/api/admission/social-count`,
    `${API_BASE_URL}/api/admission/socials-count`
  ];

  const headers = { Accept: 'application/json' };

  for (const url of candidates) {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) continue;
      const text = await response.text();
      // intentar parsear JSON seguro
      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch (_) {
        // no es JSON, intentar devolver objeto con raw text
        return { message: 'raw', data: text };
      }
    } catch (e) {
      // intentar siguiente URL
      continue;
    }
  }

  throw new Error('No social endpoints available');
};

// New: specialty count
export const fetchSpecialtyCount = async (): Promise<SpecialtyResponse | SpecialtyItem[]> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/specialty-count`);
  if (!response.ok) {
    throw new Error(`Error fetching specialty count: ${response.status}`);
  }
  return response.json();
};

// New: count right to examination
export const fetchCountRightToExamination = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admission/count-right-to-examination`);
  if (!response.ok) {
    throw new Error(`Error fetching count right to examination: ${response.status}`);
  }
  return response.json();
};

