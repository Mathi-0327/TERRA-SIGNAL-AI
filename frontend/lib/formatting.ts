/**
 * TerraSignal AI - Professional Light Theme Formatting Utilities
 */

export function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  
  if (val >= 10000000) {
    const cr = val / 10000000;
    return `₹${cr.toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    const lk = val / 100000;
    return `₹${lk.toFixed(2)} L`;
  }
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export function formatFullINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export function getRiskBadge(level: string | null | undefined) {
  const norm = (level || 'LOW').toUpperCase();
  switch (norm) {
    case 'LOW':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'text-amber-800',
        dot: 'bg-amber-500',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-200',
        text: 'text-orange-800',
        dot: 'bg-orange-500',
      };
    case 'CRITICAL':
    case 'VERY_HIGH':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        text: 'text-rose-700',
        dot: 'bg-rose-500',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        text: 'text-slate-700',
        dot: 'bg-slate-500',
      };
  }
}

export function getSeverityBadge(sev: string | null | undefined) {
  const norm = (sev || 'INFO').toUpperCase();
  switch (norm) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        border: 'border-rose-200',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-200',
        border: 'border-orange-200',
      };
    case 'WARNING':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        border: 'border-amber-200',
      };
    case 'WATCH':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        border: 'border-blue-200',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        border: 'border-slate-200',
      };
  }
}

export function getDecisionStyle(dec: string | null | undefined) {
  const norm = (dec || 'BUY').toUpperCase();
  switch (norm) {
    case 'BUY':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
      };
    case 'WAIT':
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
      };
    case 'AVOID':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
      };
  }
}
