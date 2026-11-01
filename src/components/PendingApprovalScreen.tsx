import React from 'react';
import { useFamily } from '../context/FamilyContext';
import { ShieldAlert, Clock, CheckCircle2, User, Phone, ArrowRight, RefreshCw, LogOut } from 'lucide-react';

import { Avatar } from './Avatar';

export const PendingApprovalScreen: React.FC = () => {
  const { currentUser, members, logout, switchUser } = useFamily();
  const admin = members.find((m) => m.role === 'admin');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated clock / waiting badge */}
        <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-inner relative">
          <Clock className="w-10 h-10 animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900">
            ⏳
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          Waiting for Admin Approval
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Your account request has been submitted. For family security and privacy, new logins require approval by the Family Admin.
        </p>

        {/* Member details card */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-700/60 text-left">
          <div className="flex items-center gap-3">
            <Avatar
              avatar={currentUser?.avatar}
              name={currentUser?.name}
              size="lg"
              className="bg-amber-100 dark:bg-amber-950"
            />
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {currentUser?.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{currentUser?.phone}</span>
              </div>
              <span className="inline-block mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                Status: Pending Approval
              </span>
            </div>
          </div>
        </div>

        {/* Admin notice */}
        <div className="mt-5 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5 text-left">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
          <div>
            <span className="font-semibold">Notification sent to Admin:</span>
            <p className="mt-0.5 text-blue-700 dark:text-blue-300/90">
              {admin ? `${admin.name} (${admin.relation})` : 'Shaikh Hanif'} will review your request and set your family permissions shortly.
            </p>
          </div>
        </div>

        {/* Demo Switcher Quick Action for Tester */}
        <div className="mt-6 pt-5 border-t border-slate-150 dark:border-slate-800 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            For Demo & Testing:
          </p>
          {admin && (
            <button
              onClick={() => switchUser(admin.id)}
              className="mt-2 w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>👨‍💼</span>
                <span>Switch to Admin ({admin.name}) to Approve Now</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Status</span>
          </button>
          <button
            onClick={logout}
            className="flex-1 py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch / Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
