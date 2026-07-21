/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Lock, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex flex-col mb-4">
              <span className="text-white font-bold text-lg tracking-tight flex items-center">
                Aero<span className="text-emerald-400">Loan</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold text-emerald-300 bg-emerald-950 rounded border border-emerald-900">AI</span>
              </span>
              <span className="text-xs text-white font-medium mt-1">
                Developed By <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-semibold">PCS Consultancy</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Next-generation automated credit underwriting and risk assessment systems. Streamlining capital access with advanced machine intelligence.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Platform Info</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Security Practices</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Fair Lending Compliance</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Underwriting Framework</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">API Integration</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Security & Compliance</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Equal Housing Opportunity Lender</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Bank-grade 256-bit SSL Data Encryption</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Underwriting System Version 2.6.0-prod</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 AeroLoan AI | Developed by PCS Consultancy. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
