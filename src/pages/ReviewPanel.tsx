/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLoans } from '../context/LoanContext';
import { LoanStatus, LoanApplication } from '../types';
import { Badge } from '../components/Badge';
import { formatINR } from '../utils/currency';
import { 
  ShieldAlert, Bot, Check, X, AlertCircle, Calendar, IndianRupee, 
  Briefcase, FileText, User, ChevronRight, CheckCircle2, RefreshCw
} from 'lucide-react';

export const ReviewPanel: React.FC = () => {
  const { applications, updateApplicationStatus, getApplicationById } = useLoans();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedId = searchParams.get('id') || (applications[0]?.id || '');
  const selectedApp = getApplicationById(selectedId);

  // Decision editing states
  const [decisionStatus, setDecisionStatus] = useState<LoanStatus>(LoanStatus.PENDING);
  const [overrideRiskScore, setOverrideRiskScore] = useState<number>(30);
  const [overrideRiskAnalysis, setOverrideRiskAnalysis] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (selectedApp) {
      setDecisionStatus(selectedApp.status);
      setOverrideRiskScore(selectedApp.aiRiskScore || 50);
      setOverrideRiskAnalysis(selectedApp.aiRiskAnalysis || 'No risk analysis generated yet.');
    }
  }, [selectedId, selectedApp]);

  const handleSelectApp = (id: string) => {
    setSearchParams({ id });
    setSubmitSuccess(false);
  };

  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsSubmitting(true);
    
    // Simulate API update
    setTimeout(() => {
      updateApplicationStatus(
        selectedApp.id, 
        decisionStatus, 
        overrideRiskAnalysis, 
        overrideRiskScore
      );
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1200);
  };

  const getRiskLabel = (score: number) => {
    if (score < 25) return { label: 'LOW RISK', color: 'text-emerald-500 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20' };
    if (score < 55) return { label: 'MODERATE RISK', color: 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-950/20' };
    return { label: 'HIGH RISK', color: 'text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-950/20' };
  };

  const formatBytes = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col lg:flex-row gap-8 w-full animate-fade-in">
      
      {/* Sidebar Selector */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-slate-800" />
            <span>Applications Queue</span>
          </h2>
          <p className="text-xs text-slate-400">Select an applicant below to load full financial details.</p>
        </div>

        <div className="space-y-2 max-h-[500px] lg:max-h-[700px] overflow-y-auto pr-1">
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => handleSelectApp(app.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-start ${
                app.id === selectedId
                  ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900'
                  : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-1.5 truncate pr-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{app.id}</span>
                  <Badge status={app.status} />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 truncate">
                    {app.applicant.firstName} {app.applicant.lastName}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    Requested: {formatINR(app.loanDetails.requestedAmount)}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-300 mt-1.5 transition-transform ${app.id === selectedId ? 'translate-x-1 text-slate-800' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Review Area */}
      {selectedApp ? (
        <div className="flex-grow grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Column A: Applicant Profile Details (Left Panel) */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Header Identity Block */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
                    {selectedApp.applicant.firstName[0]}{selectedApp.applicant.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-none">
                      {selectedApp.applicant.firstName} {selectedApp.applicant.lastName}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedApp.applicant.email} • {selectedApp.applicant.phone}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Filing ID</span>
                  <span className="font-mono text-sm font-bold text-slate-800">{selectedApp.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                  <span className="font-medium text-slate-800">{selectedApp.applicant.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Identity Match</span>
                  <span className="font-semibold text-emerald-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                    SSN Verified
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Submitted On</span>
                  <span className="font-medium text-slate-800 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(selectedApp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial & Job Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>Professional & Financial Profile</span>
              </h3>

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 block">Employer</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApp.employment.employerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Job Title</span>
                    <span className="font-medium text-slate-800">{selectedApp.employment.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Employment Status</span>
                    <span className="font-semibold text-slate-800">{selectedApp.employment.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-3 border-l border-slate-50 pl-6">
                  <div>
                    <span className="text-slate-400 block">Gross Monthly Income</span>
                    <span className="font-bold text-slate-900 text-sm">{formatINR(selectedApp.employment.monthlyIncome)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Monthly Liability Payments</span>
                    <span className="font-medium text-slate-800">{formatINR(selectedApp.monthlyDebtPayments)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Debt-to-Income (DTI)</span>
                    <span className={`font-bold ${
                      selectedApp.debtToIncomeRatio <= 35 ? 'text-emerald-600' :
                      selectedApp.debtToIncomeRatio <= 45 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {selectedApp.debtToIncomeRatio}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-slate-500 font-medium">FICO Credit Score</span>
                  <span className={`font-mono text-base font-bold ${
                    selectedApp.creditScore >= 720 ? 'text-emerald-600' :
                    selectedApp.creditScore >= 660 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {selectedApp.creditScore}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Employer Tenure</span>
                  <span className="font-mono text-base font-bold text-slate-800">
                    {selectedApp.employment.yearsEmployed} Years
                  </span>
                </div>
              </div>
            </div>

            {/* Requested Loan Specifications */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-slate-500" />
                <span>Requested Funding Specifications</span>
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs bg-emerald-50/20 border border-emerald-100/50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-500 block mb-0.5">Requested Principal</span>
                  <span className="text-lg font-bold text-slate-900">{formatINR(selectedApp.loanDetails.requestedAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Specified Amortization Term</span>
                  <span className="text-lg font-bold text-slate-900">{selectedApp.loanDetails.termMonths} Months</span>
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <span className="text-slate-400 block font-medium">Loan Utilization Purpose</span>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed font-normal">
                  "{selectedApp.loanDetails.purpose}"
                </p>
              </div>

              {selectedApp.loanDetails.collateralDetails && (
                <div className="text-xs space-y-1">
                  <span className="text-slate-400 block font-medium">Declared Collateral Asset</span>
                  <span className="font-semibold text-slate-800 block bg-slate-50 p-2.5 rounded-lg">
                    {selectedApp.loanDetails.collateralDetails}
                  </span>
                </div>
              )}
            </div>

            {/* Verification Documents List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Submitted Verification Documents ({selectedApp.documents.length})</span>
              </h3>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                {selectedApp.documents.map((doc) => (
                  <div key={doc.id} className="p-3 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-3.5 truncate pr-4">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="font-medium text-slate-800 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatBytes(doc.size)} • Uploaded {doc.uploadedAt}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Reviewing documents in a sandboxed secure environment. In a live database, this triggers file access workflows.`)}
                      className="text-xs text-emerald-600 font-semibold hover:underline"
                    >
                      Audit
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column B: AI Assessment & Decision Portal (Right Panel) */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* AI Assistant Output Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 leading-none">AeroUnderwriter AI</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Pre-Qualification Engine</p>
                  </div>
                </div>
                {selectedApp.aiRiskScore !== undefined && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded border ${
                    getRiskLabel(selectedApp.aiRiskScore).color
                  }`}>
                    {getRiskLabel(selectedApp.aiRiskScore).label}
                  </span>
                )}
              </div>

              {/* Score visualizer */}
              {selectedApp.aiRiskScore !== undefined ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Underwriting Risk Score</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedApp.aiRiskScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedApp.aiRiskScore < 25 ? 'bg-emerald-400' :
                        selectedApp.aiRiskScore < 55 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${selectedApp.aiRiskScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0 (Risk Free)</span>
                    <span>100 (Default Risk)</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-500">
                  Submit this applicant to run automated risk assessment calculations.
                </div>
              )}

              {/* Stress Analysis output */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">System Rationale</span>
                <p className="text-slate-300 leading-relaxed font-normal italic">
                  "{selectedApp.aiRiskAnalysis || 'Awaiting manual risk evaluation details.'}"
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Underwriting Model V4.12</span>
                <span>Neural stress scoring calibrated</span>
              </div>
            </div>

            {/* Officer Decision Portal (Form) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-slate-700" />
                <span>Credit Officer Authorization</span>
              </h3>

              <form onSubmit={handleSaveDecision} className="space-y-5">
                {/* Success Banner */}
                {submitSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl flex items-center space-x-2 text-xs">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                    <span className="font-medium">Underwriting decision submitted successfully!</span>
                  </div>
                )}

                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Application Status Decision</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecisionStatus(LoanStatus.UNDER_REVIEW)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        decisionStatus === LoanStatus.UNDER_REVIEW
                          ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Hold Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionStatus(LoanStatus.APPROVED)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        decisionStatus === LoanStatus.APPROVED
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionStatus(LoanStatus.REJECTED)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        decisionStatus === LoanStatus.REJECTED
                          ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Deny
                    </button>
                  </div>
                </div>

                {/* Risk Score Editor */}
                <div className="space-y-1.5 border-t border-slate-50 pt-4">
                  <div className="flex justify-between items-center text-xs text-slate-700">
                    <span className="font-semibold">Calibrate AI Stress Factor</span>
                    <span className="font-mono font-bold text-slate-800">{overrideRiskScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="99"
                    value={overrideRiskScore}
                    onChange={(e) => setOverrideRiskScore(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Low Risk</span>
                    <span>Extreme Liability</span>
                  </div>
                </div>

                {/* Risk Analysis Editor */}
                <div className="space-y-1.5 border-t border-slate-50 pt-4">
                  <label className="text-xs font-semibold text-slate-700 block">Underwriter Analysis Narrative</label>
                  <textarea
                    rows={4}
                    value={overrideRiskAnalysis}
                    onChange={(e) => setOverrideRiskAnalysis(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900 text-xs resize-none transition-colors"
                    placeholder="Provide full reasoning details..."
                  />
                  <p className="text-[10px] text-slate-400">This description will be immediately viewable by the applicant upon status lookups.</p>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                  id="btn-save-decision"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Decision Log...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Authoritative Decision</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center py-20 text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl bg-white">
          No filings available to review. Create an application first.
        </div>
      )}

    </div>
  );
};
