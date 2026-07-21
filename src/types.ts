/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LoanStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum EmploymentStatus {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  RETIRED = 'RETIRED'
}

export interface Applicant {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssnLastFour: string;
}

export interface Employment {
  employerName: string;
  jobTitle: string;
  status: EmploymentStatus;
  monthlyIncome: number;
  yearsEmployed: number;
}

export interface LoanDetails {
  requestedAmount: number;
  termMonths: number;
  purpose: string;
  collateralDetails?: string;
}

export interface LoanDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface LoanApplication {
  id: string;
  applicant: Applicant;
  employment: Employment;
  loanDetails: LoanDetails;
  documents: LoanDocument[];
  status: LoanStatus;
  creditScore: number;
  monthlyDebtPayments: number;
  debtToIncomeRatio: number;
  aiRiskScore?: number; // 0 to 100, calculated later or from AI
  aiRiskAnalysis?: string; // Analysis text
  createdAt: string;
  updatedAt: string;
}

export interface LoanMetric {
  totalRequested: number;
  averageAmount: number;
  approvalRate: number;
  pendingCount: number;
  underReviewCount: number;
}
