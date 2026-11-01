import React from 'react';
import { useFamily } from '../context/FamilyContext';
import { AlertTriangle, Flame, ShoppingCart, UserCheck, Calendar, X, Bell } from 'lucide-react';

export const ToastBanner: React.FC = () => {
  const { activeToast, dismissToast } = useFamily();

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'gas_empty':
      case 'gas_low':
      case 'gas_booked':
      case 'gas_delivered':
        return <Flame className="w-5 h-5 text-amber-500 animate-bounce" />;
      case 'member_approval_request':
      case 'member_approved':
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'grocery_added':
        return <ShoppingCart className="w-5 h-5 text-emerald-500" />;
      case 'calendar_reminder':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-amber-500" />;
    }
  };

  const isUrgent = activeToast.priority === 'urgent' || activeToast.type === 'gas_empty';

  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 animate-slide-down"
    >
      <div
        className={`p-4 border flex items-start gap-3 backdrop-blur-md ${
          isUrgent
            ? 'bg-red-50/95 border-red-300 text-red-950 dark:bg-red-950/90 dark:border-red-700 dark:text-red-100'
            : 'bg-white/95 border-slate-200 text-slate-800 dark:bg-slate-900/90 dark:border-slate-700 dark:text-slate-100'
        }`}
      >
        <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 shadow-sm shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-sm">
            {isUrgent && <AlertTriangle className="w-4 h-4 text-red-600 inline shrink-0" />}
            <span className="truncate">{activeToast.title}</span>
          </div>
          <p className="text-xs mt-0.5 opacity-90 line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>
        </div>
        <button
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
