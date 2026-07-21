/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosError } from 'axios';

// Request Interface matching FastAPI requirements
export interface PredictionRequest {
  gender: string;
  married: string;
  education: string;
  self_employed: string;
  applicant_income: number;
  coapplicant_income: number;
  loan_amount: number;
  credit_history: number;
}

// Response Interface with dynamic support for optional fields
export interface PredictionResponse {
  prediction?: string | number | boolean;
  approval_probability?: number;
  confidence?: number;
  risk_level?: string;
  recommendation?: string;
  reason?: string;
  
  // Support other common backend key casing styles
  Prediction?: string | number | boolean;
  "Approval Probability"?: number;
  "Approval_Probability"?: number;
  Confidence?: number;
  "Risk Level"?: string;
  "Risk_Level"?: string;
  Recommendation?: string;
  Reason?: string;
  
  // Index signature for dynamic retrieval
  [key: string]: any;
}

// Standard fallback if environment variable is not defined
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

// Create a single Axios instance with standard configuration
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Handle API error and convert it into a user-friendly error message
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // Check for Timeout
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return 'The connection timed out. The backend server took too long to respond. Please try again.';
    }
    
    // Check for Network Error / Offline
    if (!axiosError.response) {
      return 'Network Error. The backend server appears to be offline or unreachable. Please verify that the backend is running at ' + API_BASE_URL;
    }
    
    const status = axiosError.response.status;
    const responseData = axiosError.response.data;

    // Handle 400 Bad Request
    if (status === 400) {
      if (responseData && typeof responseData === 'object') {
        const detail = responseData.detail || responseData.message;
        if (detail) return `Validation Error (400): ${JSON.stringify(detail)}`;
      }
      return 'Bad Request (400). Please check if all required applicant fields are correctly filled.';
    }

    // Handle 500 Internal Server Error
    if (status === 500) {
      return 'Internal Server Error (500). There was an issue processing your request on the backend. Please try again later.';
    }

    // Generic status code errors
    if (status >= 400 && status < 500) {
      return `Error (${status}): The request could not be completed. Please check your inputs.`;
    }
    
    if (status >= 500) {
      return `Server Error (${status}): The backend returned an error state. Please contact technical support.`;
    }
  }
  
  // Fallback for standard or unknown errors
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred while communicating with the prediction engine.';
};

/**
 * Sends applicant data vectors to the FastAPI backend for credit scoring
 * @param data PredictionRequest payload
 * @returns Promise containing the PredictionResponse
 */
export const predictLoan = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const response = await apiInstance.post<PredictionResponse>('/predict', data);
    
    // Validate response
    if (!response.data) {
      throw new Error('Invalid Response: The backend returned empty payload data.');
    }
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
