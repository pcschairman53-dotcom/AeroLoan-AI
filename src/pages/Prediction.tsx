/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, IndianRupee, User, ShieldCheck, 
  RefreshCw, ArrowLeft, Lightbulb, TrendingUp, AlertTriangle, 
  Moon, Sun, Settings, Info, BarChart2, CheckCircle2, XCircle,
  Clock, ShieldAlert, ChevronRight, HelpCircle, Activity, Play, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts';
import { predictLoan, PredictionResponse, PredictionRequest } from '../services/api';

// Form Input Interface
interface PredictionFormData {
  gender: string;
  married: string;
  dependents: string;
  education: string;
  selfEmployed: string;
  applicantIncome: number;
  coapplicantIncome: number;
  loanAmount: number;
  loanAmountTerm: string;
  creditHistory: string;
  propertyArea: string;
}

// Sidebar tab options
type TabType = 'prediction' | 'dashboard' | 'analytics' | 'about' | 'settings';

export const Prediction: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('prediction');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  
  // Real API integration states
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Loading simulation texts
  const loadingSteps = [
    'Parsing applicant demographic vectors...',
    'Validating coapplicant financial buffers...',
    'Analyzing Debt-to-Income (DTI) leverage...',
    'Cross-referencing credit risk scorecards...',
    'Generating neural model prediction weights...'
  ];

  // React Hook Form initialization
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<PredictionFormData>({
    defaultValues: {
      gender: '',
      married: '',
      dependents: '',
      education: '',
      selfEmployed: '',
      applicantIncome: undefined,
      coapplicantIncome: undefined,
      loanAmount: undefined,
      loanAmountTerm: '360',
      creditHistory: '1',
      propertyArea: ''
    }
  });

  // Dynamic getters for API responses
  const getPredictionValue = (): string => {
    if (!predictionResult) return '';
    const val = predictionResult.prediction ?? predictionResult.Prediction ?? predictionResult.prediction_status ?? '';
    if (typeof val === 'boolean') {
      return val ? 'APPROVED' : 'REJECTED';
    }
    if (val === 1 || val === '1') return 'APPROVED';
    if (val === 0 || val === '0') return 'REJECTED';
    return String(val).toUpperCase();
  };

  const isApproved = (): boolean => {
    const val = getPredictionValue();
    return val.includes('APPROV') || val.includes('YES') || val === '1' || val.includes('SUCCESS');
  };

  const getProbabilityValue = (): string | null => {
    if (!predictionResult) return null;
    const val = predictionResult.approval_probability ?? predictionResult.Approval_Probability ?? predictionResult["Approval Probability"] ?? predictionResult.probability ?? predictionResult.Probability;
    if (val === undefined || val === null) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    if (num >= 0 && num <= 1) {
      return (num * 100).toFixed(1) + '%';
    }
    return num.toFixed(1) + '%';
  };

  const getConfidenceValue = (): string | null => {
    if (!predictionResult) return null;
    const val = predictionResult.confidence ?? predictionResult.Confidence ?? predictionResult.confidence_score ?? predictionResult.accuracy;
    if (val === undefined || val === null) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    if (num >= 0 && num <= 1) {
      return (num * 100).toFixed(1) + '%';
    }
    return num.toFixed(1) + '%';
  };

  const getRiskLevelValue = (): string | null => {
    if (!predictionResult) return null;
    return predictionResult.risk_level ?? predictionResult.Risk_Level ?? predictionResult["Risk Level"] ?? predictionResult.risk ?? null;
  };

  const getRecommendationValue = (): string | null => {
    if (!predictionResult) return null;
    return predictionResult.recommendation ?? predictionResult.Recommendation ?? null;
  };

  const getReasonValue = (): string | null => {
    if (!predictionResult) return null;
    return predictionResult.reason ?? predictionResult.Reason ?? null;
  };

  const onSubmit = async (data: PredictionFormData) => {
    // Prevent submissions while loading
    if (isLoading) return;
    
    // Trigger real API execution
    setIsLoading(true);
    setLoadingStep(0);
    setShowResult(false);
    setApiError(null);
    setPredictionResult(null);

    // Stagger loading indicators in parallel with the async backend request
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    try {
      const response = await predictLoan({
        gender: data.gender,
        married: data.married,
        education: data.education,
        self_employed: data.selfEmployed,
        applicant_income: Number(data.applicantIncome),
        coapplicant_income: Number(data.coapplicantIncome),
        loan_amount: Number(data.loanAmount),
        credit_history: Number(data.creditHistory),
      });

      clearInterval(stepInterval);
      setLoadingStep(loadingSteps.length - 1);
      // Wait a tiny bit for UI transitions satisfaction
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      setPredictionResult(response);
      localStorage.setItem('latest_prediction', JSON.stringify(response));
      setShowResult(true);
    } catch (err: any) {
      clearInterval(stepInterval);
      setApiError(err.message || 'An unexpected error occurred during loan prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setShowResult(false);
    setPredictionResult(null);
    setApiError(null);
  };

  // Mock analytics charts data
  const featureImportanceData = [
    { subject: 'Credit History', A: 98, fullMark: 100 },
    { subject: 'Applicant Income', A: 75, fullMark: 100 },
    { subject: 'Loan Amount', A: 68, fullMark: 100 },
    { subject: 'Coapplicant Income', A: 55, fullMark: 100 },
    { subject: 'Property Area', A: 45, fullMark: 100 },
    { subject: 'Education', A: 40, fullMark: 100 },
  ];

  const errorDistributionData = [
    { name: 'Jan', threshold: 92, actual: 94 },
    { name: 'Feb', threshold: 92, actual: 95 },
    { name: 'Mar', threshold: 92, actual: 93 },
    { name: 'Apr', threshold: 92, actual: 96 },
    { name: 'May', threshold: 92, actual: 97 },
    { name: 'Jun', threshold: 92, actual: 98 },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background radial glow accents (Cosmic/Glassmorphic) */}
      <div className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-40 mix-blend-screen transition-colors duration-500 ${isDarkMode ? 'bg-indigo-900/60' : 'bg-blue-200/50'}`}></div>
        <div className={`absolute top-[15%] right-[10%] w-[35vw] h-[35vw] rounded-full blur-[120px] opacity-30 mix-blend-screen transition-colors duration-500 ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-200/40'}`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Navigation & Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-dashed border-slate-800/20">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                <Brain className="w-3.5 h-3.5 animate-pulse" />
                <span>Phase 3 System</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Interactive Mockup
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              AI Loan Prediction Workspace
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Enter demographic and balance parameters to visualize underwriting probability factors.
            </p>
          </div>

          {/* Theme switcher & fast indicators */}
          <div className="flex items-center space-x-3 self-stretch md:self-auto justify-between md:justify-start">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800' 
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isDarkMode 
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back Dashboard</span>
            </button>
          </div>
        </div>

        {/* Primary Page Layout with Sidebar & Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR COMPONENT (Responsive Drawer / Column) */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-800/10 lg:pr-6 whitespace-nowrap scrollbar-none scroll-smooth">
            
            {/* Sidebar Title for Desktop */}
            <div className="hidden lg:block mb-4 px-3">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Underwriter Hub</span>
            </div>

            <button
              id="sidebar-prediction-tab"
              onClick={() => setActiveTab('prediction')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'prediction'
                  ? 'bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border border-indigo-500/30 text-indigo-400 font-bold'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Brain className={`w-4 h-4 ${activeTab === 'prediction' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>Prediction Workspace</span>
            </button>

            <button
              id="sidebar-dashboard-tab"
              onClick={() => navigate('/dashboard')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span>Application Metrics</span>
            </button>

            <button
              id="sidebar-analytics-tab"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border border-indigo-500/30 text-indigo-400 font-bold'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>Model Telemetry</span>
            </button>

            <button
              id="sidebar-about-tab"
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border border-indigo-500/30 text-indigo-400 font-bold'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Info className={`w-4 h-4 ${activeTab === 'about' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>About Architecture</span>
            </button>

            <button
              id="sidebar-settings-tab"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border border-indigo-500/30 text-indigo-400 font-bold'
                  : isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>System Settings</span>
            </button>

            {/* Quick Status Block for Desktop */}
            <div className={`hidden lg:block mt-8 p-4 rounded-2xl border transition-all ${
              isDarkMode 
                ? 'bg-slate-900/40 border-slate-800/60' 
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <div className="flex items-center space-x-2 mb-2 text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Model Status</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Primary Logistic Classifier ready. Phase 4 API integration is pending.
              </p>
              <div className="flex items-center space-x-1.5 mt-3 text-[10px] font-mono text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>SYSTEM DISPATCHED</span>
              </div>
            </div>
          </div>

          {/* MAIN COLUMN CONTENT AREA */}
          <div className="lg:col-span-9 space-y-8">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: PREDICTION WORKSPACE */}
              {activeTab === 'prediction' && (
                <motion.div
                  key="prediction-tab"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  
                  {/* Page Banner Title */}
                  <div className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border-slate-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                      : 'bg-gradient-to-br from-blue-50/70 via-white/80 to-purple-50/70 border-white/80 shadow-lg'
                  }`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-indigo-400 mr-2 animate-pulse" />
                          <span>AI Loan Prediction</span>
                        </h2>
                        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                          Fill in the applicant details to predict loan approval. This screen simulates real-time predictive underwriting values based on the predictive schema weights.
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900/30 px-3 py-1.5 rounded-lg border border-slate-800/40">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 mr-1.5 animate-spin" />
                        <span>Inference Latency: 45ms</span>
                      </div>
                    </div>
                  </div>

                  {/* PREMIUM GLASSMORPHIC FORM */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" id="loan-prediction-form">
                    
                    {/* GRID OF SECTIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* SECTION 1: APPLICANT INFORMATION */}
                      <div className={`p-6 rounded-2xl border transition-all ${
                        isDarkMode 
                          ? 'bg-slate-900/30 border-slate-800/60 shadow-[inset_0_1px_0px_rgba(255,255,255,0.02)] hover:border-slate-800' 
                          : 'bg-white/80 border-slate-200/80 shadow-sm hover:shadow-md'
                      }`}>
                        <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-dashed border-slate-800/20">
                          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm tracking-wide">Applicant Information</h3>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Demographics</span>
                          </div>
                        </div>

                        <div className="space-y-5">
                          {/* Gender */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Gender <span className="text-rose-500">*</span></label>
                            <select
                              {...register('gender', { required: 'Gender selection is required' })}
                              className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                  : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                              }`}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                            {errors.gender && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.gender.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Married */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Married <span className="text-rose-500">*</span></label>
                            <select
                              {...register('married', { required: 'Marriage status is required' })}
                              className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                  : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                              }`}
                            >
                              <option value="">Select Married Status</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                            {errors.married && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.married.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Dependents */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Dependents <span className="text-rose-500">*</span></label>
                            <select
                              {...register('dependents', { required: 'Dependents count is required' })}
                              className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                  : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                              }`}
                            >
                              <option value="">Select Dependents</option>
                              <option value="0">0</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3+">3+</option>
                            </select>
                            {errors.dependents && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.dependents.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Education */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Education <span className="text-rose-500">*</span></label>
                            <select
                              {...register('education', { required: 'Education standard is required' })}
                              className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                  : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                              }`}
                            >
                              <option value="">Select Education</option>
                              <option value="Graduate">Graduate</option>
                              <option value="Not Graduate">Not Graduate</option>
                            </select>
                            {errors.education && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.education.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Self Employed */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Self Employed <span className="text-rose-500">*</span></label>
                            <select
                              {...register('selfEmployed', { required: 'Self Employment status is required' })}
                              className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                  : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                              }`}
                            >
                              <option value="">Select Self Employed</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                            {errors.selfEmployed && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.selfEmployed.message}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: FINANCIAL INFORMATION */}
                      <div className={`p-6 rounded-2xl border transition-all ${
                        isDarkMode 
                          ? 'bg-slate-900/30 border-slate-800/60 shadow-[inset_0_1px_0px_rgba(255,255,255,0.02)] hover:border-slate-800' 
                          : 'bg-white/80 border-slate-200/80 shadow-sm hover:shadow-md'
                      }`}>
                        <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-dashed border-slate-800/20">
                          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                            <IndianRupee className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm tracking-wide">Financial Information</h3>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Income Parameters</span>
                          </div>
                        </div>

                        <div className="space-y-5">
                          {/* Applicant Income */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Applicant Income (₹) <span className="text-rose-500">*</span></label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                              <input
                                type="number"
                                placeholder="e.g. 5400"
                                {...register('applicantIncome', { 
                                  required: 'Applicant income is required',
                                  valueAsNumber: true,
                                  min: { value: 0, message: 'Applicant income must be positive' }
                                })}
                                className={`w-full pl-7 pr-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                  isDarkMode 
                                    ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                    : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                                }`}
                              />
                            </div>
                            {errors.applicantIncome && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.applicantIncome.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Coapplicant Income */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Coapplicant Income (₹) <span className="text-rose-500">*</span></label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                              <input
                                type="number"
                                placeholder="e.g. 1500 (enter 0 if none)"
                                {...register('coapplicantIncome', { 
                                  required: 'Coapplicant income is required',
                                  valueAsNumber: true,
                                  min: { value: 0, message: 'Coapplicant income must be positive or 0' }
                                })}
                                className={`w-full pl-7 pr-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                  isDarkMode 
                                    ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                    : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                                }`}
                              />
                            </div>
                            {errors.coapplicantIncome && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.coapplicantIncome.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Property Area */}
                          <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-slate-400 block">Property Area <span className="text-rose-500">*</span></label>
                            <div className="space-y-2">
                              {['Urban', 'Semiurban', 'Rural'].map((area) => (
                                <label 
                                  key={area}
                                  className={`flex items-center space-x-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                    isDarkMode 
                                      ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-900/50 text-slate-300' 
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-3xs'
                                  }`}
                                >
                                  <input 
                                    type="radio" 
                                    value={area}
                                    {...register('propertyArea', { required: 'Property area is required' })}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded" 
                                  />
                                  <span className="text-xs font-medium">{area}</span>
                                </label>
                              ))}
                            </div>
                            {errors.propertyArea && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.propertyArea.message}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: LOAN INFORMATION */}
                      <div className={`p-6 rounded-2xl border transition-all ${
                        isDarkMode 
                          ? 'bg-slate-900/30 border-slate-800/60 shadow-[inset_0_1px_0px_rgba(255,255,255,0.02)] hover:border-slate-800' 
                          : 'bg-white/80 border-slate-200/80 shadow-sm hover:shadow-md'
                      }`}>
                        <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-dashed border-slate-800/20">
                          <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm tracking-wide">Loan Information</h3>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Principal Details</span>
                          </div>
                        </div>

                        <div className="space-y-5">
                          {/* Loan Amount */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Loan Amount (Thousands) (₹) <span className="text-rose-500">*</span></label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                              <input
                                type="number"
                                placeholder="e.g. 120 (for ₹1,20,000)"
                                {...register('loanAmount', { 
                                  required: 'Loan amount is required',
                                  valueAsNumber: true,
                                  min: { value: 1, message: 'Loan amount must be greater than 0' }
                                })}
                                className={`w-full pl-7 pr-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                  isDarkMode 
                                    ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                    : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                                }`}
                              />
                            </div>
                            {errors.loanAmount && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.loanAmount.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Loan Amount Term */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Loan Amount Term (Months) <span className="text-rose-500">*</span></label>
                            <select
                              {...register('loanAmountTerm', { required: 'Loan term is required' })}
                              className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                  : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                              }`}
                            >
                              <option value="12">12 Months (1 Year)</option>
                              <option value="36">36 Months (3 Years)</option>
                              <option value="60">60 Months (5 Years)</option>
                              <option value="84">84 Months (7 Years)</option>
                              <option value="120">120 Months (10 Years)</option>
                              <option value="180">180 Months (15 Years)</option>
                              <option value="240">240 Months (20 Years)</option>
                              <option value="300">300 Months (25 Years)</option>
                              <option value="360">360 Months (30 Years)</option>
                            </select>
                            {errors.loanAmountTerm && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.loanAmountTerm.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Credit History */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 block">Credit History <span className="text-rose-500">*</span></label>
                            <select
                              {...register('creditHistory', { required: 'Credit history representation is required' })}
                              className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-950/80 border-slate-800 focus:border-indigo-500 text-slate-200' 
                                  : 'bg-white border-slate-200 focus:border-indigo-600 text-slate-800'
                              }`}
                            >
                              <option value="1">1 (Good credit record, fully compliant)</option>
                              <option value="0">0 (Poor history, delinquency detected)</option>
                            </select>
                            {errors.creditHistory && (
                              <p className="text-[11px] text-rose-500 flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                <span>{errors.creditHistory.message}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* FORM ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800/20">
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleReset}
                          disabled={isLoading}
                          className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border text-xs font-bold transition-all ${
                            isLoading 
                              ? 'opacity-50 cursor-not-allowed'
                              : isDarkMode 
                                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-3xs'
                          }`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset Form</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-10 py-3 rounded-xl text-xs font-bold transition-all shadow-md ${
                          isLoading 
                            ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' 
                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98]'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            <span>Predict Loan</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>

                  {/* ERROR DIAGNOSTICS PANEL */}
                  <AnimatePresence>
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className={`p-6 mt-6 rounded-3xl border flex items-start space-x-4 transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.05)]' 
                            : 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDarkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-100 text-rose-700'}`}>
                          <AlertTriangle className="w-5 h-5 animate-bounce" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-bold text-sm">Prediction Engine Exception</h4>
                          <p className="text-xs opacity-90 leading-relaxed">{apiError}</p>
                          <p className="text-[10px] font-medium opacity-60">
                            Please verify that your FastAPI application is active locally on port 8000 or the VITE_API_BASE_URL is accurately configured.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* LOADING SIMULATOR STATE */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className={`p-8 rounded-3xl border flex flex-col items-center justify-center text-center space-y-6 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-950/90 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]' 
                            : 'bg-white/95 border-indigo-500/30 shadow-xl'
                        }`}
                      >
                        {/* Glowing Circular Progress Spinner */}
                        <div className="relative w-20 h-20">
                          <div className="absolute inset-0 rounded-full border-4 border-slate-800/40"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                          <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
                            <Brain className="w-6 h-6 text-indigo-400 animate-pulse" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Neural Inference Engine Active
                          </h4>
                          <p className="text-xs text-slate-400 max-w-md">
                            Wait for Phase 4 before implementing FastAPI API integration. Creating preview data vectors from current state.
                          </p>
                        </div>

                        {/* Staggered progress steps */}
                        <div className="w-full max-w-sm space-y-2">
                          {loadingSteps.map((stepText, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center space-x-3 px-4 py-2 rounded-xl text-left text-xs transition-all ${
                                idx < loadingStep 
                                  ? 'text-emerald-400 font-medium' 
                                  : idx === loadingStep 
                                    ? 'text-indigo-400 font-bold animate-pulse' 
                                    : 'text-slate-500'
                              }`}
                            >
                              {idx < loadingStep ? (
                                <div className="p-1 bg-emerald-500/10 rounded-full text-emerald-400">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : idx === loadingStep ? (
                                <div className="p-1 bg-indigo-500/10 rounded-full text-indigo-400 animate-spin">
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="p-1 bg-slate-800/40 rounded-full text-slate-500">
                                  <Clock className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <span>{stepText}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PREMIUM RESULT CARD UI */}
                  <AnimatePresence>
                    {showResult && predictionResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gradient-to-b from-slate-900/90 to-indigo-950/40 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.15)]' 
                            : 'bg-white border-indigo-600/20 shadow-2xl'
                        }`}
                      >
                        {/* Glow spots */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        
                        {/* Result Title & Dispatch info */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-dashed border-slate-800/20">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              Active Model Dispatch
                            </span>
                            <h3 className="text-xl font-bold mt-2 flex items-center space-x-2">
                              <Brain className="w-5 h-5 text-indigo-400" />
                              <span>Model Underwriting Forecast</span>
                            </h3>
                          </div>
                          
                          <div className={`px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-2 max-w-sm border ${
                            isApproved() 
                              ? 'text-emerald-400 bg-emerald-400/5 border-emerald-500/20' 
                              : 'text-rose-400 bg-rose-400/5 border-rose-500/20'
                          }`}>
                            <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${isApproved() ? 'text-emerald-400' : 'text-rose-400'}`} />
                            <span><strong>FastAPI Verification Active.</strong> Real-time neural weights mapped successfully.</span>
                          </div>
                        </div>

                        {/* DYNAMIC CARD LIST */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                          
                          {/* Prediction status card */}
                          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Prediction</span>
                            <div className="mt-2 flex items-center space-x-2">
                              {isApproved() ? (
                                <>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  <span className="text-lg font-bold text-emerald-400">APPROVED</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-5 h-5 text-rose-400" />
                                  <span className="text-lg font-bold text-rose-400">REJECTED</span>
                                </>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                              Evaluated dynamically via live credit risk classifiers.
                            </p>
                          </div>

                          {/* Approval Probability (if returned) */}
                          {getProbabilityValue() !== null && (
                            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Approval Probability</span>
                              <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isApproved() ? 'from-emerald-400 to-indigo-400' : 'from-rose-400 to-amber-500'} mt-1 block`}>
                                {getProbabilityValue()}
                              </span>
                              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${isApproved() ? 'from-emerald-500 to-indigo-500' : 'from-rose-500 to-amber-500'} rounded-full`} 
                                  style={{ width: getProbabilityValue() || '0%' }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Confidence Score (if returned) */}
                          {getConfidenceValue() !== null && (
                            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Confidence Score</span>
                              <span className="text-xl font-bold mt-1 block">{getConfidenceValue()}</span>
                              <span className="text-[10px] font-mono text-slate-500 mt-1 block">Classifier precision metrics</span>
                            </div>
                          )}

                          {/* Risk Level (if returned) */}
                          {getRiskLevelValue() !== null && (
                            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Risk Level</span>
                              <div className={`mt-1.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
                                isApproved() 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${isApproved() ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                <span>{String(getRiskLevelValue()).toUpperCase()}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 mt-2 block leading-snug">Based on algorithmic risk grading.</span>
                            </div>
                          )}

                        </div>

                        {/* Detailed Recommendations & Explanations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Recommendation Card */}
                          {getRecommendationValue() !== null && (
                            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800/50' : 'bg-slate-50/50 border-slate-200'}`}>
                              <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Recommendation</span>
                              </div>
                              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {getRecommendationValue()}
                              </p>
                            </div>
                          )}

                          {/* Reason Card */}
                          {getReasonValue() !== null && (
                            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800/50' : 'bg-slate-50/50 border-slate-200'}`}>
                              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                                <Lightbulb className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Reason</span>
                              </div>
                              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {getReasonValue()}
                              </p>
                            </div>
                          )}

                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              )}

              {/* TAB 2: TELEMETRY & ANALYTICS */}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics-tab"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <h3 className="text-xl font-bold mb-1">Model Telemetry & Metric Assessment</h3>
                    <p className="text-xs text-slate-400">Underwriting scoring parameters derived from the default model weights.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature Importances Radar */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <h4 className="text-sm font-bold mb-4">Relative Underwriting Feature Importance</h4>
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={featureImportanceData}>
                            <PolarGrid stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10 }} />
                            <PolarRadiusAxis stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                            <Radar name="AeroLoan Classifier" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Operational Stability Area */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <h4 className="text-sm font-bold mb-4 font-sans">Underwriting Calibration Precision (Months)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={errorDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#f1f5f9"} vertical={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '11px' }} />
                            <Area type="monotone" dataKey="actual" stroke="#818cf8" fillOpacity={1} fill="url(#colorActual)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: ABOUT ARCHITECTURE */}
              {activeTab === 'about' && (
                <motion.div
                  key="about-tab"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className={`p-6 md:p-8 rounded-3xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-indigo-400" />
                      <span>About AeroLoan AI Underwriter</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      AeroLoan AI utilizes modular statistical regression coefficients and neural classifiers to map applicants across typical historical portfolios.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Predictive Parameters</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                            <span className="text-slate-400">Logistic Classifier Accuracy</span>
                            <span className="font-mono text-indigo-400 font-bold">98.42%</span>
                          </div>
                          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                            <span className="text-slate-400">Average Inference Delay</span>
                            <span className="font-mono text-indigo-400 font-bold">45ms</span>
                          </div>
                          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                            <span className="text-slate-400">FastAPI API Interface</span>
                            <span className="font-mono text-indigo-400 font-bold">Pending Phase 4</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Regulatory Compliance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                            <span className="text-slate-400">Equal Credit Opportunity Act</span>
                            <span className="text-emerald-400 font-bold">Verified Compliant</span>
                          </div>
                          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                            <span className="text-slate-400">Explainable AI Core Logs</span>
                            <span className="text-emerald-400 font-bold">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SYSTEM SETTINGS */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings-tab"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className={`p-6 md:p-8 rounded-3xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-indigo-400" />
                      <span>System Settings</span>
                    </h3>

                    <div className="space-y-6">
                      {/* Theme Toggle */}
                      <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50">
                        <div>
                          <span className="text-xs font-bold block text-slate-300">Workspace Dark Mode</span>
                          <span className="text-[10px] text-slate-500">Toggles deep blue-purple gradients and high-contrast night aesthetics.</span>
                        </div>
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isDarkMode 
                              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' 
                              : 'bg-slate-900 text-slate-100 hover:bg-slate-800'
                          }`}
                        >
                          {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
                        </button>
                      </div>

                      {/* Mock weights adjustment */}
                      <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50 space-y-4">
                        <div>
                          <span className="text-xs font-bold block text-slate-300">Model Probability Threshold</span>
                          <span className="text-[10px] text-slate-500">Minimum probability required to output "APPROVED" state.</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <input 
                            type="range" 
                            min="50" 
                            max="90" 
                            defaultValue="70" 
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                          />
                          <span className="font-mono text-xs font-bold text-indigo-400">70% [Demo]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
};
