/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLoans } from '../context/LoanContext';
import { LoanStatus } from '../types';
import { Badge } from '../components/Badge';
import { formatINR } from '../utils/currency';
import { 
  Search, Calendar, Landmark, ShieldCheck, HelpCircle, 
  CheckCircle, ArrowRight, Clock, ShieldX, HelpCircle as HelpIcon, FileText
} from 'lucide-react';

export const ApplicationStatus: React.FC = () => {
  const { getApplicationById, applications } = useLoans();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const [inputId, setInputId] = useState(queryId);
  const [errorMsg, setErrorMsg] = useState('');

  const currentApp = queryId ? getApplicationById(queryId) : undefined;

  useEffect(() => {
    if (queryId) {
      setInputId(queryId);
      const app = getApplicationById(queryId);
      if (!app) {
        setErrorMsg('Filing ID not matching any active records in our underwriting system.');
      } else {
        setErrorMsg('');
      }
    } else {
      setErrorMsg('');
    }
  }, [queryId, getApplicationById]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId.trim()) return;

    setSearchParams({ id: inputId.trim() });
  };

  // Timeline Step Generator
  const getTimelineSteps = (status: LoanStatus) => {
    const steps = [
      { num: 1, label: 'Filing Received', desc: 'Securely recorded details', done: true },
      { num: 2, label: 'Document Integrity Verified', desc: 'W-2 & payslips audited', done: true },
      { num: 3, label: 'Automated Risk Pre-screening', desc: 'Calculated baseline indices', done: true },
      { 
        num: 4, 
        label: 'Officer Decision Log', 
        desc: status === LoanStatus.PENDING ? 'Queued for human audit' : 
              status === LoanStatus.UNDER_REVIEW ? 'Officer holding for details' : 
              status === LoanStatus.APPROVED ? 'Approved by credit officer' : 'Filing denied by underwriter',
        done: status !== LoanStatus.PENDING,
        active: status === LoanStatus.PENDING || status === LoanStatus.UNDER_REVIEW
      },
      { 
        num: 5, 
        label: 'Capital Disbursal', 
        desc: status === LoanStatus.APPROVED ? 'ACH wire queued' : 'Awaiting compliance lock',
        done: status === LoanStatus.APPROVED,
        active: status === LoanStatus.APPROVED
      }
    ];
    return steps;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex-grow space-y-8 w-full animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Track Filing Status</h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Audit the real-time compliance steps, underwriter scores, and disbursement timeline of your submitted loan parameters.
        </p>
      </div>

      {/* Tracker Search Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700" htmlFor="tracking-input">Enter Application Tracking ID</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="tracking-input"
                  type="text"
                  placeholder="e.g. LN-2026-9041"
                  value={inputId}
                  onChange={e => setInputId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900 text-sm font-mono transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
              >
                Track Now
              </button>
            </div>
          </div>

          {/* Quick links to existing examples if they haven't submitted one yet */}
          {applications.length > 0 && (
            <div className="text-[10px] text-slate-400 flex items-center space-x-1">
              <span>Sample Track IDs:</span>
              <div className="flex gap-1.5 flex-wrap">
                {applications.slice(0, 3).map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setInputId(app.id);
                      setSearchParams({ id: app.id });
                    }}
                    className="font-mono bg-slate-50 hover:bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded text-slate-600 transition-colors"
                  >
                    {app.id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Error Panel */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex items-start space-x-2.5 max-w-xl mx-auto">
          <ShieldX className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Status Details Panel */}
      {currentApp && !errorMsg && (
        <div className="space-y-6">
          
          {/* Main Summary Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Filing ID: {currentApp.id}</span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  Applicant: {currentApp.applicant.firstName} {currentApp.applicant.lastName}
                </h2>
              </div>
              <Badge status={currentApp.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-50 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Requested Principal</span>
                <span className="font-bold text-slate-800">{formatINR(currentApp.loanDetails.requestedAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Term Amortization</span>
                <span className="font-semibold text-slate-800">{currentApp.loanDetails.termMonths} Months</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Filing Date</span>
                <span className="font-semibold text-slate-800 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {new Date(currentApp.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">DTI Compliance</span>
                <span className={`font-semibold ${
                  currentApp.debtToIncomeRatio <= 35 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {currentApp.debtToIncomeRatio}% Ratio
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-sm">Underwriting Audit Milestones</h3>
            
            <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
              {getTimelineSteps(currentApp.status).map((step, idx) => {
                const isFirst = idx === 0;
                return (
                  <div key={idx} className="relative">
                    {/* Circle Indicator */}
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                      step.done 
                        ? 'border-emerald-500 bg-emerald-500 text-white' 
                        : step.active 
                          ? 'border-amber-500 animate-pulse bg-amber-50' 
                          : 'border-slate-200'
                    }`}>
                      {step.done && <CheckCircle className="w-3.5 h-3.5 fill-emerald-500 text-white" />}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-xs font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-md">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Underwriter Rationale Description */}
          {currentApp.status !== LoanStatus.PENDING && currentApp.aiRiskAnalysis && (
            <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3.5">
              <div className="flex items-center space-x-2.5 text-emerald-400 pb-3 border-b border-slate-800/80">
                <ShieldCheck className="w-4.5 h-4.5" />
                <span className="text-xs uppercase tracking-wider font-bold">AeroLoan Audit Specialists Note</span>
              </div>
              <div className="text-xs space-y-3">
                <p className="leading-relaxed font-normal text-slate-300 italic">
                  "{currentApp.aiRiskAnalysis}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/40">
                  <span>Authoritative signature verified</span>
                  <span>Compliance Regulated</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Initial Landing Help State */}
      {!queryId && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-4 max-w-xl mx-auto">
          <HelpIcon className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-slate-800">Where do I find my Tracking ID?</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your tracking ID is generated upon submitting a complete loan filing (e.g. <code>LN-2026-9041</code>). View sample items in the Metrics Dashboard or submit a filing to try!
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
