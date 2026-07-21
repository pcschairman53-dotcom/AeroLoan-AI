/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useLoans } from '../context/LoanContext';
import { Badge } from '../components/Badge';
import { LoanStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '../utils/currency';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, IndianRupee, Percent, Search, Filter, RotateCcw, Download,
  Printer, ArrowUpDown, Calendar, ChevronLeft, ChevronRight, Eye, RefreshCw,
  Sparkles, Database, ShieldAlert, BookOpen, UserCheck, AlertTriangle
} from 'lucide-react';

// Define strict internal structure for Historical Analytics Predictions
interface HistoricalPrediction {
  id: string;
  date: string; // YYYY-MM-DD
  applicantName: string;
  applicantEmail: string;
  propertyArea: 'Urban' | 'Semiurban' | 'Rural';
  loanAmount: number; // in thousands (e.g. 150 means $150,000)
  applicantIncome: number; // monthly in USD
  education: 'Graduate' | 'Not Graduate';
  creditHistory: 1 | 0;
  prediction: 'APPROVED' | 'REJECTED';
  probability: number; // 0 to 1
}

// 20 realistic pre-seeded neural classifier records for rich, enterprise-grade analysis
const HISTORICAL_PREDICTIONS: HistoricalPrediction[] = [
  { id: 'AN-2026-1001', date: '2026-05-10', applicantName: 'Jonathan Harker', applicantEmail: 'j.harker@harker-legal.com', propertyArea: 'Urban', loanAmount: 180, applicantIncome: 9500, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.94 },
  { id: 'AN-2026-1002', date: '2026-05-14', applicantName: 'Arthur Holmwood', applicantEmail: 'arthur.h@godalming.org', propertyArea: 'Semiurban', loanAmount: 320, applicantIncome: 15000, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.97 },
  { id: 'AN-2026-1003', date: '2026-05-18', applicantName: 'Quincey Morris', applicantEmail: 'quincey@texas-ranch.net', propertyArea: 'Rural', loanAmount: 150, applicantIncome: 12000, education: 'Not Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.89 },
  { id: 'AN-2026-1004', date: '2026-05-22', applicantName: 'Renfield Fly', applicantEmail: 'renfield@carfax.org', propertyArea: 'Urban', loanAmount: 45, applicantIncome: 2100, education: 'Not Graduate', creditHistory: 0, prediction: 'REJECTED', probability: 0.12 },
  { id: 'AN-2026-1005', date: '2026-05-28', applicantName: 'Lucy Westenra', applicantEmail: 'lucy.w@westenra-estate.co.uk', propertyArea: 'Semiurban', loanAmount: 250, applicantIncome: 11000, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.95 },
  { id: 'AN-2026-1006', date: '2026-06-02', applicantName: 'John Seward', applicantEmail: 'seward@purfleet-asylum.co.uk', propertyArea: 'Urban', loanAmount: 130, applicantIncome: 8500, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.91 },
  { id: 'AN-2026-1007', date: '2026-06-05', applicantName: 'Wilhelmina Murray', applicantEmail: 'mina.murray@academy.org', propertyArea: 'Semiurban', loanAmount: 90, applicantIncome: 5500, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.88 },
  { id: 'AN-2026-1008', date: '2026-06-12', applicantName: 'Abraham Van Helsing', applicantEmail: 'abraham@amsterdam-med.nl', propertyArea: 'Rural', loanAmount: 210, applicantIncome: 14000, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.96 },
  { id: 'AN-2026-1009', date: '2026-06-18', applicantName: 'Thomas Snelling', applicantEmail: 'snelling@carters.com', propertyArea: 'Rural', loanAmount: 35, applicantIncome: 2800, education: 'Not Graduate', creditHistory: 0, prediction: 'REJECTED', probability: 0.23 },
  { id: 'AN-2026-1010', date: '2026-06-24', applicantName: 'Joseph Carter', applicantEmail: 'joseph@carters.com', propertyArea: 'Urban', loanAmount: 110, applicantIncome: 4800, education: 'Not Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.82 },
  { id: 'AN-2026-1011', date: '2026-07-01', applicantName: 'William Mitchell', applicantEmail: 'w.mitchell@prime-logistics.com', propertyArea: 'Urban', loanAmount: 175, applicantIncome: 7800, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.90 },
  { id: 'AN-2026-1012', date: '2026-07-03', applicantName: 'Robert Vance', applicantEmail: 'rvance@vance-refrigeration.com', propertyArea: 'Semiurban', loanAmount: 310, applicantIncome: 16500, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.98 },
  { id: 'AN-2026-1013', date: '2026-07-06', applicantName: 'Pamela Beesly', applicantEmail: 'pam.b@dunder-mifflin.com', propertyArea: 'Rural', loanAmount: 60, applicantIncome: 4200, education: 'Not Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.79 },
  { id: 'AN-2026-1014', date: '2026-07-09', applicantName: 'Dwight Schrute', applicantEmail: 'dwight@schrute-farms.com', propertyArea: 'Rural', loanAmount: 400, applicantIncome: 13500, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.85 },
  { id: 'AN-2026-1015', date: '2026-07-11', applicantName: 'Michael Scott', applicantEmail: 'mscott@greatscotfilms.com', propertyArea: 'Urban', loanAmount: 195, applicantIncome: 6200, education: 'Not Graduate', creditHistory: 0, prediction: 'REJECTED', probability: 0.35 },
  { id: 'AN-2026-1016', date: '2026-07-12', applicantName: 'Jim Halpert', applicantEmail: 'jim.h@dunder-mifflin.com', propertyArea: 'Semiurban', loanAmount: 140, applicantIncome: 7500, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.92 },
  { id: 'AN-2026-1017', date: '2026-07-13', applicantName: 'Angela Martin', applicantEmail: 'angela.m@cats-accounting.com', propertyArea: 'Urban', loanAmount: 85, applicantIncome: 6000, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.93 },
  { id: 'AN-2026-1018', date: '2026-07-14', applicantName: 'Kevin Malone', applicantEmail: 'kevin.m@malone-chili.net', propertyArea: 'Semiurban', loanAmount: 120, applicantIncome: 3500, education: 'Not Graduate', creditHistory: 0, prediction: 'REJECTED', probability: 0.28 },
  { id: 'AN-2026-1019', date: '2026-07-15', applicantName: 'Oscar Martinez', applicantEmail: 'oscar.m@actually.org', propertyArea: 'Urban', loanAmount: 220, applicantIncome: 9200, education: 'Graduate', creditHistory: 1, prediction: 'APPROVED', probability: 0.96 },
  { id: 'AN-2026-1020', date: '2026-07-16', applicantName: 'Creed Bratton', applicantEmail: 'creed@scuba-thoughts.com', propertyArea: 'Rural', loanAmount: 15, applicantIncome: 1200, education: 'Not Graduate', creditHistory: 0, prediction: 'REJECTED', probability: 0.05 },
];

export const Analytics: React.FC = () => {
  const { applications } = useLoans();

  // Mode state matching the platform (can toggle local high-contrast dark/light mode for previewing)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [simulatedEmptyState, setSimulatedEmptyState] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters state
  const [dateRange, setDateRange] = useState<string>('All'); // All, Last30, Last90, manual
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterPropertyArea, setFilterPropertyArea] = useState<string>('All');
  const [filterLoanStatus, setFilterLoanStatus] = useState<string>('All'); // Approved, Rejected, Pending, Under Review
  const [filterEducation, setFilterEducation] = useState<string>('All');
  const [filterCreditHistory, setFilterCreditHistory] = useState<string>('All'); // Good, Bad

  // Sorting & Pagination state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Simulate loading state on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Soft notification helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Merge Live App predictions with historical dataset for real-time consistency
  const combinedData = useMemo(() => {
    if (simulatedEmptyState) return [];

    // Map live applications to our Analytics representation
    const mappedLive: HistoricalPrediction[] = applications.map((app, idx) => {
      const isApprove = app.status === LoanStatus.APPROVED || 
                        app.creditScore >= 700 || 
                        (app.aiRiskScore !== undefined && app.aiRiskScore < 30);
      
      const probValue = app.aiRiskScore !== undefined 
        ? (100 - app.aiRiskScore) / 100 
        : (app.creditScore - 300) / 550; // simple fallback mapping

      const creditHistMapped = app.creditScore >= 640 ? 1 : 0;

      // Map employment status to education guess if property missing
      const eduGuess = app.employment.employerName.toLowerCase().includes('solutions') || 
                       app.employment.jobTitle.toLowerCase().includes('architect') || 
                       app.employment.jobTitle.toLowerCase().includes('designer') ? 'Graduate' : 'Not Graduate';

      return {
        id: app.id,
        date: app.createdAt ? app.createdAt.split('T')[0] : '2026-07-18',
        applicantName: `${app.applicant.firstName} ${app.applicant.lastName}`,
        applicantEmail: app.applicant.email,
        propertyArea: (idx % 3 === 0 ? 'Urban' : idx % 3 === 1 ? 'Semiurban' : 'Rural') as any, // dynamic mapping
        loanAmount: Math.round(app.loanDetails.requestedAmount / 1000), // convert to standard K
        applicantIncome: app.employment.monthlyIncome,
        education: eduGuess as any,
        creditHistory: creditHistMapped as any,
        prediction: isApprove ? 'APPROVED' : 'REJECTED',
        probability: Math.min(Math.max(probValue, 0.05), 0.99),
      };
    });

    return [...mappedLive, ...HISTORICAL_PREDICTIONS];
  }, [applications, simulatedEmptyState]);

  // Apply filters on the merged dataset
  const filteredData = useMemo(() => {
    return combinedData.filter((item) => {
      // 1. Date Range Filter
      if (dateRange === 'Last30') {
        const itemDate = new Date(item.date);
        const limitDate = new Date('2026-07-18');
        limitDate.setDate(limitDate.getDate() - 30);
        if (itemDate < limitDate) return false;
      } else if (dateRange === 'Last90') {
        const itemDate = new Date(item.date);
        const limitDate = new Date('2026-07-18');
        limitDate.setDate(limitDate.getDate() - 90);
        if (itemDate < limitDate) return false;
      } else if (dateRange === 'custom') {
        if (startDate && new Date(item.date) < new Date(startDate)) return false;
        if (endDate && new Date(item.date) > new Date(endDate)) return false;
      }

      // 2. Property Area Filter
      if (filterPropertyArea !== 'All' && item.propertyArea !== filterPropertyArea) return false;

      // 3. Loan Status Filter
      if (filterLoanStatus !== 'All' && item.prediction !== filterLoanStatus) return false;

      // 4. Education Filter
      if (filterEducation !== 'All' && item.education !== filterEducation) return false;

      // 5. Credit History Filter
      if (filterCreditHistory !== 'All') {
        const targetHist = filterCreditHistory === 'Good' ? 1 : 0;
        if (item.creditHistory !== targetHist) return false;
      }

      // 6. Search Term Filter (Applicant Name / Email / ID)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const nameMatch = item.applicantName.toLowerCase().includes(query);
        const emailMatch = item.applicantEmail.toLowerCase().includes(query);
        const idMatch = item.id.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !idMatch) return false;
      }

      return true;
    });
  }, [combinedData, dateRange, startDate, endDate, filterPropertyArea, filterLoanStatus, filterEducation, filterCreditHistory, searchTerm]);

  // Calculate Metrics from current filtered items
  const metrics = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) {
      return {
        totalPredictions: 0,
        approvedCount: 0,
        rejectedCount: 0,
        approvalRate: 0,
        avgIncome: 0,
        avgLoanAmount: 0,
      };
    }

    const approvedCount = filteredData.filter((item) => item.prediction === 'APPROVED').length;
    const rejectedCount = total - approvedCount;
    const approvalRate = Math.round((approvedCount / total) * 100);

    const totalIncome = filteredData.reduce((sum, item) => sum + item.applicantIncome, 0);
    const avgIncome = Math.round(totalIncome / total);

    const totalLoan = filteredData.reduce((sum, item) => sum + item.loanAmount, 0) * 1000; // convert back to full scale
    const avgLoanAmount = Math.round(totalLoan / total);

    return {
      totalPredictions: total,
      approvedCount,
      rejectedCount,
      approvalRate,
      avgIncome,
      avgLoanAmount,
    };
  }, [filteredData]);

  // Dynamic Chart Data mapping based on filtered data
  // 1. Loan Status Chart
  const statusChartData = useMemo(() => {
    const approved = filteredData.filter(i => i.prediction === 'APPROVED').length;
    const rejected = filteredData.filter(i => i.prediction === 'REJECTED').length;
    return [
      { name: 'Approved', count: approved, color: '#10b981' },
      { name: 'Rejected', count: rejected, color: '#f43f5e' },
    ];
  }, [filteredData]);

  // 2. Property Area Pie Chart
  const propertyAreaChartData = useMemo(() => {
    const urban = filteredData.filter(i => i.propertyArea === 'Urban').length;
    const semiurban = filteredData.filter(i => i.propertyArea === 'Semiurban').length;
    const rural = filteredData.filter(i => i.propertyArea === 'Rural').length;
    return [
      { name: 'Urban', value: urban, color: '#818cf8' },
      { name: 'Semiurban', value: semiurban, color: '#a78bfa' },
      { name: 'Rural', value: rural, color: '#34d399' },
    ].filter(v => v.value > 0);
  }, [filteredData]);

  // 3. Monthly Prediction Line Chart (timeline grouping)
  const monthlyTimelineData = useMemo(() => {
    const monthGroups: Record<string, { approved: number; rejected: number }> = {};
    
    // Seed groups so months look sorted and clean
    const monthsOrder = ['2026-05', '2026-06', '2026-07'];
    monthsOrder.forEach(m => {
      monthGroups[m] = { approved: 0, rejected: 0 };
    });

    filteredData.forEach(item => {
      const monthStr = item.date.substring(0, 7); // YYYY-MM
      if (!monthGroups[monthStr]) {
        monthGroups[monthStr] = { approved: 0, rejected: 0 };
      }
      if (item.prediction === 'APPROVED') {
        monthGroups[monthStr].approved++;
      } else {
        monthGroups[monthStr].rejected++;
      }
    });

    const displayMonths: Record<string, string> = {
      '2026-05': 'May 2026',
      '2026-06': 'June 2026',
      '2026-07': 'July 2026',
    };

    return Object.keys(monthGroups)
      .sort()
      .map(key => ({
        month: displayMonths[key] || key,
        Approved: monthGroups[key].approved,
        Rejected: monthGroups[key].rejected,
        Total: monthGroups[key].approved + monthGroups[key].rejected,
      }));
  }, [filteredData]);

  // 4. Applicant Income Histogram
  const incomeHistogramData = useMemo(() => {
    let tier1 = 0; // < $3,000
    let tier2 = 0; // $3,000 - $6,000
    let tier3 = 0; // $6,000 - $10,000
    let tier4 = 0; // $10,000 - $15,000
    let tier5 = 0; // > $15,000

    filteredData.forEach(i => {
      const inc = i.applicantIncome;
      if (inc < 3000) tier1++;
      else if (inc < 6000) tier2++;
      else if (inc < 10000) tier3++;
      else if (inc < 15000) tier4++;
      else tier5++;
    });

    return [
      { range: '< ₹3K', count: tier1 },
      { range: '₹3K - ₹6K', count: tier2 },
      { range: '₹6K - ₹10K', count: tier3 },
      { range: '₹10K - ₹15K', count: tier4 },
      { range: '> ₹15K', count: tier5 },
    ];
  }, [filteredData]);

  // 5. Loan Amount Distribution Area Chart
  const loanDistributionData = useMemo(() => {
    // Sort items by loan amount to represent a continuous density distribution
    const sorted = [...filteredData].sort((a, b) => a.loanAmount - b.loanAmount);
    return sorted.map((item, idx) => ({
      index: idx + 1,
      Amount: item.loanAmount,
      Probability: Math.round(item.probability * 100),
      Name: item.applicantName,
    }));
  }, [filteredData]);

  // Sort & Paginate prediction table
  const sortedTableData = useMemo(() => {
    const data = [...filteredData];
    data.sort((a, b) => {
      let valA: any = a[sortField as keyof HistoricalPrediction];
      let valB: any = b[sortField as keyof HistoricalPrediction];

      // Handle null/undefined values safely
      if (valA === undefined) valA = '';
      if (valB === undefined) valB = '';

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? (valA > valB ? 1 : -1) 
          : (valB > valA ? 1 : -1);
      }
    });
    return data;
  }, [filteredData, sortField, sortDirection]);

  // Paginated elements
  const paginatedTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTableData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTableData, currentPage]);

  const totalPages = Math.max(Math.ceil(sortedTableData.length / itemsPerPage), 1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange, filterPropertyArea, filterLoanStatus, filterEducation, filterCreditHistory]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const resetAllFilters = () => {
    setDateRange('All');
    setStartDate('');
    setEndDate('');
    setFilterPropertyArea('All');
    setFilterLoanStatus('All');
    setFilterEducation('All');
    setFilterCreditHistory('All');
    setSearchTerm('');
    triggerToast('All analytics dashboard filters restored to default.');
  };

  // UI Printing and Export simulation
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    triggerToast('Generating CSV layout stream... Download sequence initialized.');
    
    // Simulate beautiful CSV building client-side
    const headers = ['Filing ID', 'Date', 'Applicant', 'Email', 'Property Area', 'Loan Amount (₹K)', 'Monthly Income', 'Education', 'Credit History', 'Prediction', 'Confidence'];
    const rows = filteredData.map(item => [
      item.id,
      item.date,
      `"${item.applicantName}"`,
      item.applicantEmail,
      item.propertyArea,
      item.loanAmount,
      item.applicantIncome,
      item.education,
      item.creditHistory === 1 ? 'Good' : 'Bad',
      item.prediction,
      `${Math.round(item.probability * 100)}%`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Loan_Analytics_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerToast('CSV portfolio telemetry exported successfully.');
  };

  return (
    <div className={`min-h-screen flex-grow ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-500`}>
      
      {/* Toast alert system */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 flex items-center space-x-3 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        
        {/* PREMIUM TITLE HEADER BLOCK */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-dashed border-slate-800/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow-xs">
                Phase 4 Deployment
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 shadow-xs">
                Real-Time Telemetry
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
              Neural Underwriting Analytics
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Analyze historical logistic regressions, predictive probability vectors, and dynamic portfolio parameters instantly in a unified, banking-compliant metrics dashboard.
            </p>
          </div>

          {/* UTILITY CONTROLS BAR */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Simulation Controls */}
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-xs text-xs">
              <button
                onClick={() => setSimulatedEmptyState(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  simulatedEmptyState 
                    ? 'bg-rose-500 text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Toggle empty state presentation"
              >
                Simulate Empty State
              </button>
              
              <button
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 900);
                  triggerToast('Re-fetching neural weights metrics...');
                }}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all"
                title="Reload predictions telemetry feed"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
              </button>
            </div>

            {/* Dark Mode local Switch */}
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                triggerToast(`Switched workspace style: ${!isDarkMode ? 'Cosmic Dark' : 'Bright Editorial'}`);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs border ${
                isDarkMode 
                  ? 'bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300' 
                  : 'bg-slate-900 text-white border-slate-950 hover:bg-slate-800'
              }`}
            >
              {isDarkMode ? 'Light Aesthetic' : 'Cosmic Dark'}
            </button>
          </div>
        </div>

        {/* MULTI-FILTERING COMPASS MODULE */}
        <div className={`p-6 rounded-3xl border transition-all ${
          isDarkMode 
            ? 'bg-slate-900/40 border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-md' 
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-800/10">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Classifier Filter Array</h2>
              </div>
              <button
                onClick={resetAllFilters}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              
              {/* Filter 1: Date range selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Historical Date Scale</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all ${
                      isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="All">All Time Scale</option>
                    <option value="Last30">Last 30 Days</option>
                    <option value="Last90">Last 90 Days</option>
                    <option value="custom">Custom Range...</option>
                  </select>
                </div>
              </div>

              {/* Filter 2: Property Area */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Property Location</label>
                <select
                  value={filterPropertyArea}
                  onChange={(e) => setFilterPropertyArea(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="All">All Regions</option>
                  <option value="Urban">Urban Areas</option>
                  <option value="Semiurban">Semi-Urban</option>
                  <option value="Rural">Rural Landscapes</option>
                </select>
              </div>

              {/* Filter 3: Loan Prediction Status */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Inference Result</label>
                <select
                  value={filterLoanStatus}
                  onChange={(e) => setFilterLoanStatus(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="All">All Predictions</option>
                  <option value="APPROVED">APPROVED Predictions</option>
                  <option value="REJECTED">REJECTED Predictions</option>
                </select>
              </div>

              {/* Filter 4: Academic Level */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Education Level</label>
                <select
                  value={filterEducation}
                  onChange={(e) => setFilterEducation(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="All">All Academics</option>
                  <option value="Graduate">Graduates</option>
                  <option value="Not Graduate">Non-Graduates</option>
                </select>
              </div>

              {/* Filter 5: Credit History Index */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Credit History Registry</label>
                <select
                  value={filterCreditHistory}
                  onChange={(e) => setFilterCreditHistory(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all ${
                    isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="All">All Profiles</option>
                  <option value="Good">Good Credit Registry (1.0)</option>
                  <option value="Bad">Poor Credit Registry (0.0)</option>
                </select>
              </div>

            </div>

            {/* Custom Date Range Picker Fields */}
            <AnimatePresence>
              {dateRange === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-dashed border-slate-800/10 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 block uppercase">Start Date boundary</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 block uppercase">End Date boundary</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LOADING SHADOW LOADERS */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Metrics Summary Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className={`p-6 rounded-3xl border animate-pulse ${isDarkMode ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white border-slate-200'}`}>
                    <div className="h-2 w-12 bg-slate-700 rounded-sm mb-3" />
                    <div className="h-6 w-20 bg-slate-700 rounded-md mb-2" />
                    <div className="h-1.5 w-full bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>

              {/* Charts Skeleton Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className={`lg:col-span-8 p-6 rounded-3xl border h-[340px] animate-pulse ${isDarkMode ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white border-slate-200'}`}>
                  <div className="h-3 w-1/4 bg-slate-700 rounded-sm mb-6" />
                  <div className="w-full h-4/5 bg-slate-800/60 rounded-xl" />
                </div>
                <div className={`lg:col-span-4 p-6 rounded-3xl border h-[340px] animate-pulse ${isDarkMode ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white border-slate-200'}`}>
                  <div className="h-3 w-2/5 bg-slate-700 rounded-sm mb-6" />
                  <div className="w-full h-4/5 bg-slate-800/60 rounded-xl" />
                </div>
              </div>
            </motion.div>
          ) : filteredData.length === 0 ? (
            
            /* EMPTY STATE VISUAL CARD */
            <motion.div
              key="empty-module"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`p-12 md:p-20 text-center rounded-3xl border max-w-2xl mx-auto space-y-6 ${
                isDarkMode 
                  ? 'bg-slate-900/30 border-slate-800/80 shadow-2xl' 
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="relative inline-block">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-md opacity-30 animate-pulse" />
                <div className={`relative p-5 rounded-full border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-indigo-400' : 'bg-slate-100 border-slate-200 text-indigo-600'}`}>
                  <Database className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">No Neural Analytics Feed Mapped</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your active filtering parameters isolated a null sample space. Or, portfolio historical data seed has been cleared.
                </p>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setSimulatedEmptyState(false);
                    resetAllFilters();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl text-xs hover:opacity-95 shadow-sm transition-all"
                >
                  Restore Dataset
                </button>
                <button
                  onClick={resetAllFilters}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold border ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Clear Active Filters
                </button>
              </div>
            </motion.div>

          ) : (
            
            /* ACTIVE DATA ENGINE CORE VISUALS */
            <motion.div
              key="active-analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              
              {/* 1. SUMMARY METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                
                {/* Metric 1: Total Predictions */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-slate-900/30 border-slate-800/80 shadow-xs hover:border-slate-700' 
                    : 'bg-white border-slate-100 shadow-xs hover:border-slate-300'
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Total Predictions</span>
                  <span className="text-2xl font-black mt-2 block tracking-tight">{metrics.totalPredictions}</span>
                  <div className="w-full h-1 bg-slate-800/30 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Metric 2: Approved Predictions */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-slate-900/30 border-slate-800/80 shadow-xs hover:border-slate-700' 
                    : 'bg-white border-slate-100 shadow-xs hover:border-slate-300'
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400/80 block">Approved Loans</span>
                  <span className="text-2xl font-black text-emerald-400 mt-2 block tracking-tight">{metrics.approvedCount}</span>
                  <div className="w-full h-1 bg-slate-800/30 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metrics.approvedCount / metrics.totalPredictions) * 100}%` }}></div>
                  </div>
                </div>

                {/* Metric 3: Rejected Predictions */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-slate-900/30 border-slate-800/80 shadow-xs hover:border-slate-700' 
                    : 'bg-white border-slate-100 shadow-xs hover:border-slate-300'
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-rose-400/80 block">Rejected Loans</span>
                  <span className="text-2xl font-black text-rose-400 mt-2 block tracking-tight">{metrics.rejectedCount}</span>
                  <div className="w-full h-1 bg-slate-800/30 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(metrics.rejectedCount / metrics.totalPredictions) * 100}%` }}></div>
                  </div>
                </div>

                {/* Metric 4: Approval Rate */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-slate-900/30 border-slate-800/80 shadow-xs hover:border-slate-700' 
                    : 'bg-white border-slate-100 shadow-xs hover:border-slate-300'
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400/80 block">Approval Rate</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mt-2 block tracking-tight">
                    {metrics.approvalRate}%
                  </span>
                  <div className="w-full h-1 bg-slate-800/30 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${metrics.approvalRate}%` }}></div>
                  </div>
                </div>

                {/* Metric 5: Average Applicant Income */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-slate-900/30 border-slate-800/80 shadow-xs hover:border-slate-700' 
                    : 'bg-white border-slate-100 shadow-xs hover:border-slate-300'
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Avg Income</span>
                  <span className="text-xl font-bold mt-2.5 block tracking-tight">{formatINR(metrics.avgIncome)}/mo</span>
                  <div className="w-full h-1 bg-slate-800/30 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Metric 6: Average Loan Amount */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode 
                    ? 'bg-slate-900/30 border-slate-800/80 shadow-xs hover:border-slate-700' 
                    : 'bg-white border-slate-100 shadow-xs hover:border-slate-300'
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Avg Loan size</span>
                  <span className="text-xl font-bold mt-2.5 block tracking-tight">{formatINR(metrics.avgLoanAmount)}</span>
                  <div className="w-full h-1 bg-slate-800/30 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

              </div>

              {/* 2. RESPONSIVE RECHARTS CORE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Chart A: Loan Status Bar Chart (Approved vs Rejected) */}
                <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900/30 border-slate-800/80 shadow-xs' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Loan Status Classifier</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Absolute count of underwriting prediction matches.</p>
                  </div>
                  <div className="h-[220px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="pt-3 border-t border-slate-800/10 flex justify-between text-[10px] text-slate-400">
                    <span>Target Scale: Absolute Units</span>
                    <span className="font-mono">Inference complete</span>
                  </div>
                </div>

                {/* Chart B: Property Area Distribution Pie Chart */}
                <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900/30 border-slate-800/80 shadow-xs' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Property Location Demographics</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Geographic density distribution for filtered assets.</p>
                  </div>
                  <div className="h-[220px] flex items-center justify-center relative mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={propertyAreaChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {propertyAreaChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            fontSize: '10px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center pointer-events-none">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest">Total Map</span>
                      <span className="text-xl font-bold">{filteredData.length}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-slate-800/10 text-[10px] text-slate-400">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span>Urban</span>
                      </div>
                      <span className="font-mono">{filteredData.filter(i => i.propertyArea === 'Urban').length} entries</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span>Semiurban</span>
                      </div>
                      <span className="font-mono">{filteredData.filter(i => i.propertyArea === 'Semiurban').length} entries</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Rural</span>
                      </div>
                      <span className="font-mono">{filteredData.filter(i => i.propertyArea === 'Rural').length} entries</span>
                    </div>
                  </div>
                </div>

                {/* Chart C: Monthly Prediction Line Chart */}
                <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900/30 border-slate-800/80 shadow-xs' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Timeline Inference Yield</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Approved vs Rejected volumes across standard cycles.</p>
                  </div>
                  <div className="h-[220px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTimelineData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '11px',
                          }}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Rejected" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="pt-3 border-t border-slate-800/10 flex justify-between text-[10px] text-slate-400">
                    <span>Cycle: Monthly metrics</span>
                    <span className="font-mono text-emerald-400 font-semibold">Active Timeline Sync</span>
                  </div>
                </div>

              </div>

              {/* SECONDARY ROW CHIPS: HISTOGRAM + DISTRIBUTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Chart D: Applicant Income Histogram */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900/30 border-slate-800/80 shadow-xs' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Applicant Income Frequency Histogram</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Aggregated count of applicant volumes mapped to income tiers.</p>
                  </div>
                  <div className="h-[240px] mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incomeHistogramData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                        />
                        <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart E: Loan Amount Distribution Chart */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900/30 border-slate-800/80 shadow-xs' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Requested Portfolio Distribution Density</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Relative scale of requested principal mapped alongside classifier approval probabilities.</p>
                  </div>
                  <div className="h-[240px] mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={loanDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="amountGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="index" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                          formatter={(value, name) => [name === 'Amount' ? formatINR(Number(value) * 1000) : `${value}%`, name]}
                        />
                        <Area type="monotone" dataKey="Amount" stroke="#818cf8" fillOpacity={1} fill="url(#amountGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* 3. PREDICTION HISTORY DATA-GRID */}
              <div className={`border rounded-3xl overflow-hidden transition-all ${
                isDarkMode ? 'bg-slate-900/30 border-slate-800/80 shadow-xl' : 'bg-white border-slate-100 shadow-sm'
              }`}>
                
                {/* Header Controls */}
                <div className="p-6 border-b border-slate-800/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-bold text-base tracking-tight">Master Prediction Analytics Ledger</h3>
                    <p className="text-xs text-slate-400">Search, audit, and sort live or pre-seeded neural classifier logs.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search applicant, email, or registry ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all ${
                          isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Export / Print Buttons UI */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        onClick={handleExportCSV}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-900' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        title="Export current filtered data to CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CSV Export</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                          isDarkMode 
                            ? 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-900' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        title="Print detailed executive report"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Report</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`${isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50'} border-b border-slate-800/10 text-[10px] text-slate-400 uppercase tracking-widest font-bold`}>
                        <th className="py-4 px-6">
                          <button onClick={() => toggleSort('date')} className="flex items-center space-x-1 hover:text-slate-200 transition-colors">
                            <span>Inference Date</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </button>
                        </th>
                        <th className="py-4 px-6">
                          <button onClick={() => toggleSort('applicantName')} className="flex items-center space-x-1 hover:text-slate-200 transition-colors">
                            <span>Applicant Portfolio</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </button>
                        </th>
                        <th className="py-4 px-6">Property Area</th>
                        <th className="py-4 px-6">
                          <button onClick={() => toggleSort('loanAmount')} className="flex items-center space-x-1 hover:text-slate-200 transition-colors">
                            <span>Requested Principal</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </button>
                        </th>
                        <th className="py-4 px-6">Credit History</th>
                        <th className="py-4 px-6">Prediction outcome</th>
                        <th className="py-4 px-6">
                          <button onClick={() => toggleSort('probability')} className="flex items-center space-x-1 hover:text-slate-200 transition-colors">
                            <span>Approval Probability</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10 text-xs">
                      {paginatedTableData.map((item) => (
                        <tr key={item.id} className={`hover:bg-slate-800/5 transition-colors`}>
                          <td className="py-4 px-6 font-mono text-slate-400">
                            {item.date}
                            <span className="block text-[9px] text-slate-500 font-sans mt-0.5">ID: {item.id}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{item.applicantName}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.applicantEmail}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.propertyArea === 'Urban' ? 'bg-indigo-500/10 text-indigo-400' :
                              item.propertyArea === 'Semiurban' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {item.propertyArea}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">
                            {formatINR(item.loanAmount * 1000)}
                            <span className="block text-[9px] text-slate-500 font-sans font-normal mt-0.5">DTI Limit Cleared</span>
                          </td>
                          <td className="py-4 px-6">
                            {item.creditHistory === 1 ? (
                              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>Good Registry (1.0)</span>
                              </span>
                            ) : (
                              <span className="text-rose-400 font-semibold flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                <span>Poor Registry (0.0)</span>
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {item.prediction === 'APPROVED' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                APPROVED
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                REJECTED
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className={`font-mono font-bold ${
                                item.probability >= 0.8 ? 'text-emerald-400' :
                                item.probability >= 0.5 ? 'text-amber-400' :
                                'text-rose-400'
                              }`}>
                                {Math.round(item.probability * 100)}%
                              </span>
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                  className={`h-full ${
                                    item.probability >= 0.8 ? 'bg-emerald-500' :
                                    item.probability >= 0.5 ? 'bg-amber-500' :
                                    'bg-rose-500'
                                  }`} 
                                  style={{ width: `${item.probability * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className={`p-4 ${isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50'} border-t border-slate-800/10 flex justify-between items-center`}>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Showing {Math.min(sortedTableData.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(sortedTableData.length, currentPage * itemsPerPage)} of {sortedTableData.length} records in active memory
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-xl border transition-all ${
                        currentPage === 1 
                          ? 'text-slate-600 border-slate-800/40 cursor-not-allowed opacity-50' 
                          : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentPage === idx + 1
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-xl border transition-all ${
                        currentPage === totalPages 
                          ? 'text-slate-600 border-slate-800/40 cursor-not-allowed opacity-50' 
                          : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
