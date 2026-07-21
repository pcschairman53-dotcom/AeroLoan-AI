/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FileText, LayoutDashboard, ShieldAlert, CheckCircle, Menu, X, Landmark, Brain, PieChart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: Landmark },
    { to: '/apply', label: 'Apply Now', icon: FileText },
    { to: '/status', label: 'Track Application', icon: CheckCircle },
    { to: '/dashboard', label: 'Metrics Dashboard', icon: LayoutDashboard },
    { to: '/predict', label: 'AI Prediction', icon: Brain },
    { to: '/analytics', label: 'AI Analytics', icon: PieChart },
    { to: '/review', label: 'Officer Panel', icon: ShieldAlert },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 font-bold text-xl tracking-tight">
              <div className="bg-slate-900 text-white p-2 rounded-lg flex items-center justify-center shadow-xs">
                <Landmark className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="flex items-center">
                Aero<span className="text-emerald-500 font-medium">Loan</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 rounded">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-50 text-slate-900 font-semibold border-b-2 border-emerald-500 rounded-b-none'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-hidden"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block w-6 h-6" /> : <Menu className="block w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-50 text-slate-900 font-semibold border-l-4 border-emerald-500 rounded-l-none'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-slate-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
