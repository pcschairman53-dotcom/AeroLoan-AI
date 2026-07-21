/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLoans } from '../context/LoanContext';
import { Badge } from '../components/Badge';
import { LoanStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/currency';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, IndianRupee, Percent, AlertCircle, Search, 
  Filter, Eye, ArrowUpDown, RotateCcw
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { applications, metrics, resetApplications } = useLoans();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter logic
  const filteredApps = applications.filter(app => {
    const fullName = `${app.applicant.firstName} ${app.applicant.lastName}`.toLowerCase();
    const email = app.applicant.email.toLowerCase();
    const id = app.id.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          email.includes(searchTerm.toLowerCase()) || 
                          id.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Recharts Chart Data Prep
  // 1. Data by status
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.keys(LoanStatus).map(status => ({
    name: status.replace('_', ' '),
    value: statusCounts[status] || 0,
  })).filter(item => item.value > 0);

  const COLORS = {
    [LoanStatus.PENDING]: '#94a3b8',      // slate
    [LoanStatus.UNDER_REVIEW]: '#f59e0b',  // amber
    [LoanStatus.APPROVED]: '#10b981',      // emerald
    [LoanStatus.REJECTED]: '#f43f5e'       // rose
  };

  // 2. Bar chart - Requested Amount by applicant
  const barChartData = [...applications].reverse().slice(-5).map(app => ({
    name: `${app.applicant.firstName} ${app.applicant.lastName.substring(0,1)}.`,
    Amount: app.loanDetails.requestedAmount,
    Score: app.creditScore,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-8 w-full animate-fade-in">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Underwriting Metrics Console</h1>
          <p className="text-slate-500 text-sm">Real-time statistics of requested portfolio values and credit risk profiles.</p>
        </div>
        <button
          onClick={resetApplications}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          title="Restore standard applications data"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Portfolio Data</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-5">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Capital Requested</span>
            <span className="text-xl font-bold text-slate-900">{formatINR(metrics.totalRequested)}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-5">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <IndianRupee className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Average Loan Size</span>
            <span className="text-xl font-bold text-slate-900">{formatINR(metrics.averageAmount)}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-5">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <Percent className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Officer Approval Rate</span>
            <span className="text-xl font-bold text-slate-900">{metrics.approvalRate}%</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-5">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Active AI Queue</span>
            <span className="text-xl font-bold text-slate-900">{metrics.pendingCount + metrics.underReviewCount} active</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bar Chart Panel */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Filing Volume Assessment</h3>
            <p className="text-xs text-slate-400">Capital requested relative to FICO Score across recent submissions.</p>
          </div>
          <div className="h-[280px]">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'sans-serif', fontSize: '12px' }}
                    formatter={(value) => [formatINR(value as any), 'Amount Requested']}
                  />
                  <Bar dataKey="Amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No charts data available</div>
            )}
          </div>
        </div>

        {/* Pie Chart Panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Portfolio Status Split</h3>
            <p className="text-xs text-slate-400">Current separation of submitted loan statuses.</p>
          </div>
          <div className="h-[180px] flex items-center justify-center relative">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry) => {
                      const key = Object.keys(LoanStatus).find(k => k.replace('_', ' ') === entry.name) as LoanStatus;
                      return <Cell key={entry.name} fill={COLORS[key] || '#cbd5e1'} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No status metrics</div>
            )}
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Filings</span>
              <span className="text-2xl font-bold text-slate-900">{applications.length}</span>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-50 text-[11px]">
            {Object.keys(LoanStatus).map(status => {
              const count = statusCounts[status] || 0;
              const label = status.replace('_', ' ');
              const percentage = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;
              return (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[status as LoanStatus] }} />
                    <span>{label}</span>
                  </div>
                  <span className="font-mono text-slate-400">{count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Applications Table Section */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Master Underwriting Ledger</h3>
            <p className="text-xs text-slate-400">Search and audit filings currently recorded in the system.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applicant or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900 text-xs transition-colors"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-44 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full focus:outline-hidden bg-transparent text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value={LoanStatus.PENDING}>Pending</option>
                <option value={LoanStatus.UNDER_REVIEW}>Under Review</option>
                <option value={LoanStatus.APPROVED}>Approved</option>
                <option value={LoanStatus.REJECTED}>Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Filing ID</th>
                <th className="py-3.5 px-6">Applicant</th>
                <th className="py-3.5 px-6">Principal Requested</th>
                <th className="py-3.5 px-6">Term / DTI</th>
                <th className="py-3.5 px-6">FICO</th>
                <th className="py-3.5 px-6">Filing Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-950">{app.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{app.applicant.firstName} {app.applicant.lastName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{app.applicant.email}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{formatINR(app.loanDetails.requestedAmount)}</td>
                    <td className="py-4 px-6">
                      <div>{app.loanDetails.termMonths} Months</div>
                      <div className="text-[10px] text-slate-400">DTI: {app.debtToIncomeRatio}%</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-mono font-semibold ${
                        app.creditScore >= 720 ? 'text-emerald-600' :
                        app.creditScore >= 660 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {app.creditScore}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/status?id=${app.id}`)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                          title="View Applicant Status Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/review?id=${app.id}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No loan applications match your active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer Stats */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between items-center font-mono">
          <span>Showing {filteredApps.length} of {applications.length} applications ledger</span>
          <span>Database Integrity Verified</span>
        </div>

      </div>

    </div>
  );
};
