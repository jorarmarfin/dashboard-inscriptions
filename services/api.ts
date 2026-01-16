import { ApiResponse, PartialScholarshipResponse } from '../types';

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
