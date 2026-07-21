/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoanApplication, LoanStatus, EmploymentStatus, LoanMetric } from '../types';

interface LoanContextType {
  applications: LoanApplication[];
  metrics: LoanMetric;
  submitApplication: (app: Omit<LoanApplication, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'debtToIncomeRatio'>) => string;
  updateApplicationStatus: (id: string, status: LoanStatus, riskAnalysis?: string, riskScore?: number) => void;
  getApplicationById: (id: string) => LoanApplication | undefined;
  resetApplications: () => void;
}

const INITIAL_APPLICATIONS: LoanApplication[] = [
  {
    id: 'LN-2026-9041',
    applicant: {
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.j@example.com',
      phone: '(555) 019-2834',
      dateOfBirth: '1988-11-23',
      ssnLastFour: '4321',
    },
    employment: {
      employerName: 'Apex Software Solutions',
      jobTitle: 'Senior Systems Architect',
      status: EmploymentStatus.FULL_TIME,
      monthlyIncome: 12500,
      yearsEmployed: 4.5,
    },
    loanDetails: {
      requestedAmount: 45000,
      termMonths: 36,
      purpose: 'Home Improvement & Solar Installation',
    },
    documents: [
      { id: 'doc-1', name: 'W2_2025_Sarah_Jenkins.pdf', type: 'application/pdf', size: 1048576, uploadedAt: '2026-07-15' },
      { id: 'doc-2', name: 'Paystub_June_2026.pdf', type: 'application/pdf', size: 512000, uploadedAt: '2026-07-15' }
    ],
    status: LoanStatus.PENDING,
    creditScore: 742,
    monthlyDebtPayments: 1800,
    debtToIncomeRatio: 14.4,
    aiRiskScore: 18,
    aiRiskAnalysis: 'Strong credit history paired with low DTI (Debt-to-Income) and long tenure at the current employer. Moderate requested amount relative to base income supports low-risk classification.',
    createdAt: '2026-07-15T14:32:00Z',
    updatedAt: '2026-07-15T14:32:00Z',
  },
  {
    id: 'LN-2026-4810',
    applicant: {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'm.chen@example.com',
      phone: '(555) 014-9988',
      dateOfBirth: '1992-04-15',
      ssnLastFour: '8872',
    },
    employment: {
      employerName: 'Self-Employed (Chen Designs)',
      jobTitle: 'Principal Freelance UX Designer',
      status: EmploymentStatus.SELF_EMPLOYED,
      monthlyIncome: 8200,
      yearsEmployed: 3,
    },
    loanDetails: {
      requestedAmount: 25000,
      termMonths: 24,
      purpose: 'Business Equipment & Studio Lease',
    },
    documents: [
      { id: 'doc-3', name: 'Tax_Return_2025_Chen.pdf', type: 'application/pdf', size: 2457600, uploadedAt: '2026-07-16' }
    ],
    status: LoanStatus.UNDER_REVIEW,
    creditScore: 685,
    monthlyDebtPayments: 2900,
    debtToIncomeRatio: 35.36,
    aiRiskScore: 42,
    aiRiskAnalysis: 'Moderate risk identified. Debt-to-Income ratio (35.4%) is approaching standard threshold. Freelance income is variable, though supported by stable historical tax filings.',
    createdAt: '2026-07-16T09:15:00Z',
    updatedAt: '2026-07-17T11:20:00Z',
  },
  {
    id: 'LN-2026-1102',
    applicant: {
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      email: 'marcus.rod@example.com',
      phone: '(555) 012-4411',
      dateOfBirth: '1981-08-09',
      ssnLastFour: '1109',
    },
    employment: {
      employerName: 'City Transit Authority',
      jobTitle: 'Maintenance Coordinator',
      status: EmploymentStatus.FULL_TIME,
      monthlyIncome: 5800,
      yearsEmployed: 9,
    },
    loanDetails: {
      requestedAmount: 15000,
      termMonths: 60,
      purpose: 'Debt Consolidation',
    },
    documents: [
      { id: 'doc-4', name: 'Paystub_July_First.pdf', type: 'application/pdf', size: 450000, uploadedAt: '2026-07-17' }
    ],
    status: LoanStatus.APPROVED,
    creditScore: 710,
    monthlyDebtPayments: 950,
    debtToIncomeRatio: 16.38,
    aiRiskScore: 25,
    aiRiskAnalysis: 'Consistent long-term government employment (9+ years) provides high financial predictability. Loan purpose is debt consolidation which will lower outstanding monthly payments, decreasing long-term liability.',
    createdAt: '2026-07-17T08:00:00Z',
    updatedAt: '2026-07-17T15:45:00Z',
  }
];

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<LoanApplication[]>(() => {
    const saved = localStorage.getItem('loan_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('loan_applications', JSON.stringify(applications));
  }, [applications]);

  const [metrics, setMetrics] = useState<LoanMetric>({
    totalRequested: 0,
    averageAmount: 0,
    approvalRate: 0,
    pendingCount: 0,
    underReviewCount: 0,
  });

  useEffect(() => {
    if (applications.length === 0) {
      setMetrics({
        totalRequested: 0,
        averageAmount: 0,
        approvalRate: 0,
        pendingCount: 0,
        underReviewCount: 0,
      });
      return;
    }

    const totalRequested = applications.reduce((sum, app) => sum + app.loanDetails.requestedAmount, 0);
    const averageAmount = Math.round(totalRequested / applications.length);
    const approvedCount = applications.filter(app => app.status === LoanStatus.APPROVED).length;
    const reviewedCount = applications.filter(app => app.status === LoanStatus.APPROVED || app.status === LoanStatus.REJECTED).length;
    const approvalRate = reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 100;
    const pendingCount = applications.filter(app => app.status === LoanStatus.PENDING).length;
    const underReviewCount = applications.filter(app => app.status === LoanStatus.UNDER_REVIEW).length;

    setMetrics({
      totalRequested,
      averageAmount,
      approvalRate,
      pendingCount,
      underReviewCount,
    });
  }, [applications]);

  const submitApplication = (
    appData: Omit<LoanApplication, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'debtToIncomeRatio'>
  ) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `LN-2026-${randomSuffix}`;
    const dti = Math.round((appData.monthlyDebtPayments / appData.employment.monthlyIncome) * 10000) / 100;
    
    // Simple mock credit logic (NOT prediction logic, just filling schema values required for review flow)
    const dtiNum = isNaN(dti) ? 0 : dti;

    const newApp: LoanApplication = {
      ...appData,
      id,
      debtToIncomeRatio: dtiNum,
      status: LoanStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApplications(prev => [newApp, ...prev]);
    return id;
  };

  const updateApplicationStatus = (id: string, status: LoanStatus, riskAnalysis?: string, riskScore?: number) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== id) return app;
        return {
          ...app,
          status,
          ...(riskAnalysis && { aiRiskAnalysis: riskAnalysis }),
          ...(riskScore !== undefined && { aiRiskScore: riskScore }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id.toLowerCase() === id.toLowerCase() || app.id.toLowerCase().endsWith(id.toLowerCase()));
  };

  const resetApplications = () => {
    setApplications(INITIAL_APPLICATIONS);
    localStorage.removeItem('loan_applications');
  };

  return (
    <LoanContext.Provider
      value={{
        applications,
        metrics,
        submitApplication,
        updateApplicationStatus,
        getApplicationById,
        resetApplications,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoans = () => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoans must be used within a LoanProvider');
  }
  return context;
};
