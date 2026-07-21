/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh] py-12 px-4 text-center">
      <div className="relative mb-6">
        {/* Modern high-tech banking spinner */}
        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-dashed border-purple-500/20 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Intelligence Hub</h3>
        <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Retrieving neural classifier and verifying credit metrics...</p>
      </div>
    </div>
  );
};

export const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex-grow flex flex-col"
          >
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};
