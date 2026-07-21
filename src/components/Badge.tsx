/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoanStatus } from '../types';

interface BadgeProps {
  status: LoanStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case LoanStatus.APPROVED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      case LoanStatus.REJECTED:
        return 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50';
      case LoanStatus.UNDER_REVIEW:
        return 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
      case LoanStatus.PENDING:
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800/50';
    }
  };

  const getLabel = () => {
    switch (status) {
      case LoanStatus.APPROVED:
        return 'Approved';
      case LoanStatus.REJECTED:
        return 'Rejected';
      case LoanStatus.UNDER_REVIEW:
        return 'Under Review';
      case LoanStatus.PENDING:
      default:
        return 'Pending';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStyles()}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === LoanStatus.APPROVED ? 'bg-emerald-500' :
        status === LoanStatus.REJECTED ? 'bg-rose-500' :
        status === LoanStatus.UNDER_REVIEW ? 'bg-amber-500' : 'bg-slate-400'
      }`} />
      {getLabel()}
    </span>
  );
};
