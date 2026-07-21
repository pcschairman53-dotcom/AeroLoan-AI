/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Landmark, AlertCircle, CheckCircle, RotateCcw, 
  IndianRupee, Clock, HelpCircle, Sparkles, AlertOctagon, ShieldAlert, TrendingUp
} from 'lucide-react';
import { predictLoan, PredictionRequest, PredictionResponse } from '../services/api';

export const Apply: React.FC = () => {
  // Input fields state
  const [gender, setGender] = useState<string>('');
  const [married, setMarried] = useState<string>('');
  const [dependents, setDependents] = useState<string>('');
  const [education, setEducation] = useState<string>('');
  const [selfEmployed, setSelfEmployed] = useState<string>('');
  const [applicantIncome, setApplicantIncome] = useState<number | ''>('');
  const [coapplicantIncome, setCoapplicantIncome] = useState<number | ''>('');
  const [loanAmount, setLoanAmount] = useState<number | ''>('');
  const [termType, setTermType] = useState<string>('360');
  const [customTerm, setCustomTerm] = useState<number | ''>('');
  const [creditHistory, setCreditHistory] = useState<string>('1');
  const [propertyArea, setPropertyArea] = useState<string>('');

  // Submit states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Helper validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!gender) errors.Gender = 'Gender is required';
    if (!married) errors.Married = 'Marital status is required';
    if (!dependents) errors.Dependents = 'Number of dependents is required';
    if (!education) errors.Education = 'Education status is required';
    if (!selfEmployed) errors.Self_Employed = 'Employment classification is required';

    if (applicantIncome === '') {
      errors.ApplicantIncome = 'Applicant income is required';
    } else if (Number(applicantIncome) < 0) {
      errors.ApplicantIncome = 'Income cannot be negative';
    }

    if (coapplicantIncome === '') {
      errors.CoapplicantIncome = 'Coapplicant income is required';
    } else if (Number(coapplicantIncome) < 0) {
      errors.CoapplicantIncome = 'Income cannot be negative';
    }

    if (loanAmount === '') {
      errors.LoanAmount = 'Loan amount is required';
    } else if (Number(loanAmount) <= 0) {
      errors.LoanAmount = 'Loan amount must be greater than 0';
    }

    if (termType === 'Other') {
      if (customTerm === '') {
        errors.Loan_Amount_Term = 'Custom term length is required';
      } else if (Number(customTerm) <= 0) {
        errors.Loan_Amount_Term = 'Term must be greater than 0';
      }
    }

    if (!creditHistory) errors.Credit_History = 'Credit history is required';
    if (!propertyArea) errors.Property_Area = 'Property area designation is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form handler
  const handleReset = () => {
    setGender('');
    setMarried('');
    setDependents('');
    setEducation('');
    setSelfEmployed('');
    setApplicantIncome('');
    setCoapplicantIncome('');
    setLoanAmount('');
    setTermType('360');
    setCustomTerm('');
    setCreditHistory('1');
    setPropertyArea('');
    setFieldErrors({});
    setError(null);
    setResult(null);
  };

  // Submit prediction handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!validateForm()) {
      // Scroll to error if necessary
      const errorElement = document.querySelector('.text-rose-500');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    const finalTerm = termType === 'Other' ? Number(customTerm) : Number(termType);

    const payload: PredictionRequest = {
      Gender: gender,
      Married: married,
      Dependents: dependents,
      Education: education,
      Self_Employed: selfEmployed,
      ApplicantIncome: Number(applicantIncome),
      CoapplicantIncome: Number(coapplicantIncome),
      LoanAmount: Number(loanAmount),
      Loan_Amount_Term: finalTerm,
      Credit_History: Number(creditHistory),
      Property_Area: propertyArea,
    };

    try {
      const response = await predictLoan(payload);
      setResult(response);
      localStorage.setItem('latest_prediction', JSON.stringify(response));
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while communicating with the prediction server.');
    } finally {
      setLoading(false);
    }
  };

  // Safely extract prediction fields
  const getPredictionDetails = () => {
    if (!result) return null;
    
    const rawPred = result.prediction !== undefined ? result.prediction : result.Prediction;
    const isApproved = rawPred === 'Y' || rawPred === 'Approved' || rawPred === true || rawPred === 1 || rawPred === '1';
    
    const prob = result.approval_probability !== undefined ? result.approval_probability :
                 result.Approval_Probability !== undefined ? result.Approval_Probability :
                 result['Approval Probability'] !== undefined ? result['Approval Probability'] : undefined;

    const conf = result.confidence !== undefined ? result.confidence : result.Confidence;
    
    const risk = result.risk_level !== undefined ? result.risk_level :
                 result.Risk_Level !== undefined ? result.Risk_Level :
                 result['Risk Level'] !== undefined ? result['Risk Level'] : undefined;

    const recom = result.recommendation !== undefined ? result.recommendation : result.Recommendation;
    const reas = result.reason !== undefined ? result.reason : result.Reason;

    return {
      predictionText: isApproved ? 'Approved' : 'Denied',
      isApproved,
      probability: typeof prob === 'number' ? prob : undefined,
      confidence: typeof conf === 'number' ? conf : undefined,
      riskLevel: typeof risk === 'string' ? risk : undefined,
      recommendation: typeof recom === 'string' ? recom : undefined,
      reason: typeof reas === 'string' ? reas : undefined,
    };
  };

  const details = getPredictionDetails();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-grow w-full">
      {/* Premium Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider shadow-2xs">
          <Brain className="w-3.5 h-3.5 animate-pulse" />
          <span>Neural Engine Predictive Service</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
          AI Credit Decision Simulator
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed font-sans">
          Configure risk metrics and financial indicators below to run real-time machine learning inference for mortgage or commercial underwriting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Metric Parameters</span>
            </div>
            <span className="text-[10px] text-emerald-600 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-100/50 font-semibold tracking-wide">
              SSL Encrypted Link
            </span>
          </div>

          <form id="loan-application-form" onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Global Error Notice */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs leading-relaxed flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-900">Inference Request Failed</p>
                  <p>{error}</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 1. Gender */}
              <div className="space-y-1.5" id="group-gender">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="gender-select">
                  <span>Gender</span>
                  <span className="text-[10px] font-normal text-slate-400">Required</span>
                </label>
                <select
                  id="gender-select"
                  value={gender}
                  onChange={e => {
                    setGender(e.target.value);
                    if (fieldErrors.Gender) setFieldErrors(prev => ({ ...prev, Gender: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-hidden text-sm bg-white text-slate-700 transition-colors ${
                    fieldErrors.Gender ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {fieldErrors.Gender && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.Gender}</p>}
              </div>

              {/* 2. Married */}
              <div className="space-y-1.5" id="group-married">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="married-select">
                  <span>Married</span>
                  <span className="text-[10px] font-normal text-slate-400">Required</span>
                </label>
                <select
                  id="married-select"
                  value={married}
                  onChange={e => {
                    setMarried(e.target.value);
                    if (fieldErrors.Married) setFieldErrors(prev => ({ ...prev, Married: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-hidden text-sm bg-white text-slate-700 transition-colors ${
                    fieldErrors.Married ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                  }`}
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {fieldErrors.Married && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.Married}</p>}
              </div>

              {/* 3. Dependents */}
              <div className="space-y-1.5" id="group-dependents">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="dependents-select">
                  <span>Dependents</span>
                  <span className="text-[10px] font-normal text-slate-400">Required</span>
                </label>
                <select
                  id="dependents-select"
                  value={dependents}
                  onChange={e => {
                    setDependents(e.target.value);
                    if (fieldErrors.Dependents) setFieldErrors(prev => ({ ...prev, Dependents: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-hidden text-sm bg-white text-slate-700 transition-colors ${
                    fieldErrors.Dependents ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                  }`}
                >
                  <option value="">Select Dependents</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
                {fieldErrors.Dependents && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.Dependents}</p>}
              </div>

              {/* 4. Education */}
              <div className="space-y-1.5" id="group-education">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="education-select">
                  <span>Education Status</span>
                  <span className="text-[10px] font-normal text-slate-400">Required</span>
                </label>
                <select
                  id="education-select"
                  value={education}
                  onChange={e => {
                    setEducation(e.target.value);
                    if (fieldErrors.Education) setFieldErrors(prev => ({ ...prev, Education: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-hidden text-sm bg-white text-slate-700 transition-colors ${
                    fieldErrors.Education ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                  }`}
                >
                  <option value="">Select Education</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Not Graduate">Not Graduate</option>
                </select>
                {fieldErrors.Education && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.Education}</p>}
              </div>

              {/* 5. Self Employed */}
              <div className="space-y-1.5" id="group-self-employed">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="self-employed-select">
                  <span>Self Employed</span>
                  <span className="text-[10px] font-normal text-slate-400">Required</span>
                </label>
                <select
                  id="self-employed-select"
                  value={selfEmployed}
                  onChange={e => {
                    setSelfEmployed(e.target.value);
                    if (fieldErrors.Self_Employed) setFieldErrors(prev => ({ ...prev, Self_Employed: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-hidden text-sm bg-white text-slate-700 transition-colors ${
                    fieldErrors.Self_Employed ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                  }`}
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {fieldErrors.Self_Employed && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.Self_Employed}</p>}
              </div>

              {/* 10. Credit History */}
              <div className="space-y-1.5" id="group-credit-history">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="credit-history-select">
                  <span>Credit History</span>
                  <span className="text-[10px] font-normal text-slate-400">Required</span>
                </label>
                <select
                  id="credit-history-select"
                  value={creditHistory}
                  onChange={e => {
                    setCreditHistory(e.target.value);
                    if (fieldErrors.Credit_History) setFieldErrors(prev => ({ ...prev, Credit_History: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-hidden text-sm bg-white text-slate-700 transition-colors ${
                    fieldErrors.Credit_History ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                  }`}
                >
                  <option value="1">1 (Good credit history records)</option>
                  <option value="0">0 (Bad credit history records)</option>
                </select>
                {fieldErrors.Credit_History && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.Credit_History}</p>}
              </div>

              {/* 11. Property Area */}
              <div className="space-y-1.5" id="group-property-area">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="property-area-select">
                  <span>Property Area</span>
                  <span className="text-[10px] font-normal text-slate-400">Required</span>
                </label>
                <select
                  id="property-area-select"
                  value={propertyArea}
                  onChange={e => {
                    setPropertyArea(e.target.value);
                    if (fieldErrors.Property_Area) setFieldErrors(prev => ({ ...prev, Property_Area: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-hidden text-sm bg-white text-slate-700 transition-colors ${
                    fieldErrors.Property_Area ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                  }`}
                >
                  <option value="">Select Area Designation</option>
                  <option value="Urban">Urban</option>
                  <option value="Semiurban">Semiurban</option>
                  <option value="Rural">Rural</option>
                </select>
                {fieldErrors.Property_Area && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.Property_Area}</p>}
              </div>

              {/* 9. Loan Amount Term */}
              <div className="space-y-1.5" id="group-loan-term">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="loan-term-select">
                  <span>Loan Amount Term (Months)</span>
                  <span className="text-[10px] font-normal text-slate-400">Required</span>
                </label>
                <select
                  id="loan-term-select"
                  value={termType}
                  onChange={e => {
                    setTermType(e.target.value);
                    if (fieldErrors.Loan_Amount_Term) setFieldErrors(prev => ({ ...prev, Loan_Amount_Term: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden text-sm bg-white text-slate-700 transition-colors`}
                >
                  <option value="360">360 Months (30 Years)</option>
                  <option value="240">240 Months (20 Years)</option>
                  <option value="180">180 Months (15 Years)</option>
                  <option value="120">120 Months (10 Years)</option>
                  <option value="84">84 Months (7 Years)</option>
                  <option value="60">60 Months (5 Years)</option>
                  <option value="36">36 Months (3 Years)</option>
                  <option value="Other">Other (Specify Custom Months)</option>
                </select>
              </div>
            </div>

            {/* Custom Term Subfield (Shown dynamically) */}
            <AnimatePresence>
              {termType === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                  id="group-custom-term"
                >
                  <label className="text-xs font-semibold text-slate-700" htmlFor="custom-term-input">Custom Term (Months)</label>
                  <input
                    id="custom-term-input"
                    type="number"
                    placeholder="Enter total loan duration term in months"
                    value={customTerm}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setCustomTerm(val);
                      if (fieldErrors.Loan_Amount_Term) setFieldErrors(prev => ({ ...prev, Loan_Amount_Term: '' }));
                    }}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-hidden text-sm transition-colors ${
                      fieldErrors.Loan_Amount_Term ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                    }`}
                  />
                  {fieldErrors.Loan_Amount_Term && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.Loan_Amount_Term}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Income & Financial Numerical Inputs */}
            <div className="border-t border-slate-100 pt-5 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Financial Values</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* 6. Applicant Income */}
                <div className="space-y-1.5" id="group-applicant-income">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="applicant-income-input">
                    <span>Applicant Income (₹)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                    <input
                      id="applicant-income-input"
                      type="number"
                      placeholder="e.g. 5400"
                      value={applicantIncome}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setApplicantIncome(val);
                        if (fieldErrors.ApplicantIncome) setFieldErrors(prev => ({ ...prev, ApplicantIncome: '' }));
                      }}
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-xl focus:outline-hidden text-sm transition-colors ${
                        fieldErrors.ApplicantIncome ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                      }`}
                    />
                  </div>
                  {fieldErrors.ApplicantIncome && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.ApplicantIncome}</p>}
                </div>

                {/* 7. Coapplicant Income */}
                <div className="space-y-1.5" id="group-coapplicant-income">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="coapplicant-income-input">
                    <span>Coapplicant Income (₹)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                    <input
                      id="coapplicant-income-input"
                      type="number"
                      placeholder="0 if none"
                      value={coapplicantIncome}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setCoapplicantIncome(val);
                        if (fieldErrors.CoapplicantIncome) setFieldErrors(prev => ({ ...prev, CoapplicantIncome: '' }));
                      }}
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-xl focus:outline-hidden text-sm transition-colors ${
                        fieldErrors.CoapplicantIncome ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                      }`}
                    />
                  </div>
                  {fieldErrors.CoapplicantIncome && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.CoapplicantIncome}</p>}
                </div>

                {/* 8. Loan Amount */}
                <div className="space-y-1.5" id="group-loan-amount">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between" htmlFor="loan-amount-input">
                    <span>Loan Amount (₹ thousands)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                    <input
                      id="loan-amount-input"
                      type="number"
                      placeholder="e.g. 150 for ₹150K"
                      value={loanAmount}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setLoanAmount(val);
                        if (fieldErrors.LoanAmount) setFieldErrors(prev => ({ ...prev, LoanAmount: '' }));
                      }}
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-xl focus:outline-hidden text-sm transition-colors ${
                        fieldErrors.LoanAmount ? 'border-rose-300 focus:border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-900'
                      }`}
                    />
                  </div>
                  {fieldErrors.LoanAmount && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.LoanAmount}</p>}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 active:scale-98"
                id="btn-reset-prediction"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-2 inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                id="btn-predict-loan"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing Risk Vectors...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-1.5 text-indigo-200" />
                    <span>Predict Loan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results / Help Column */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {details ? (
              <motion.div
                key="result-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`rounded-2xl border p-6 sm:p-7 shadow-sm space-y-5 relative overflow-hidden ${
                  details.isApproved 
                    ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900' 
                    : 'bg-rose-50/40 border-rose-100 text-rose-900'
                }`}
                id="result-prediction-card"
              >
                {/* Visual Glow Effect */}
                <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full filter blur-2xl opacity-20 ${
                  details.isApproved ? 'bg-emerald-400' : 'bg-rose-400'
                }`} />

                <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Underwriting Assessment</span>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    details.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    ML DECISION
                  </div>
                </div>

                {/* Core Decision Callout */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Classification Outcome</span>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      details.isApproved ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {details.isApproved ? <CheckCircle className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{details.predictionText}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Verified by local statistical models</p>
                    </div>
                  </div>
                </div>

                {/* Approval Probability Indicator */}
                {details.probability !== undefined && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100/50">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">Approval Probability</span>
                      <span className="font-mono">{Math.round(details.probability * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${details.probability * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          details.isApproved ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Additional metrics info */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100/50">
                  {details.confidence !== undefined && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Confidence Score</span>
                      <span className="font-mono text-sm font-extrabold text-slate-800">{Math.round(details.confidence * 100)}%</span>
                    </div>
                  )}

                  {details.riskLevel !== undefined && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Assessed Risk Level</span>
                      <span className={`text-sm font-extrabold uppercase tracking-wider ${
                        details.riskLevel.toLowerCase() === 'low' ? 'text-emerald-600' :
                        details.riskLevel.toLowerCase() === 'medium' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {details.riskLevel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommendation (if available) */}
                {details.recommendation && (
                  <div className="p-3.5 bg-slate-50/55 rounded-xl border border-slate-100 text-slate-700 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Advisory Recommendation</span>
                    <p className="text-xs leading-relaxed font-sans">{details.recommendation}</p>
                  </div>
                )}

                {/* Reason (if available) */}
                {details.reason && (
                  <div className="p-3.5 bg-slate-50/55 rounded-xl border border-slate-100 text-slate-700 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Model Rationale</span>
                    <p className="text-xs leading-relaxed font-sans italic">"{details.reason}"</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="help-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 sm:p-7 space-y-5"
              >
                <div className="flex items-center space-x-2 text-slate-800 pb-3 border-b border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Model Guidelines</span>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-500 font-sans">
                  <div className="flex gap-2.5">
                    <span className="font-mono text-indigo-500 font-bold">01.</span>
                    <p>
                      <strong>Applicant Income:</strong> Submit baseline monthly earnings. The predictive classifier weights steady income directly against loan sizing.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-mono text-indigo-500 font-bold">02.</span>
                    <p>
                      <strong>Credit History:</strong> Good credit rating (1) behaves as an essential risk-mitigation feature inside standard credit classifiers.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-mono text-indigo-500 font-bold">03.</span>
                    <p>
                      <strong>Loan Sizing:</strong> Enter the target funding requested. This is calibrated against the term months.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real-time analytical metrics update automatically.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
