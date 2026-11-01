import React from 'react';
import { useAuth } from '../context/AuthContext';

type Kind = 'pending' | 'rejected' | 'no-profile';

const CONTENT: Record<Kind, { icon: string; title: string; body: string }> = {
  pending: {
    icon: '⏳',
    title: 'Waiting for approval',
    body: 'Your Family Head registration has been received. The app owner will review it. You will get access as soon as it is approved. You can close the app and come back later.',
  },
  rejected: {
    icon: '⛔',
    title: 'Access declined',
    body: 'Your request was not approved. Please contact the app owner if you think this is a mistake.',
  },
  'no-profile': {
    icon: '⚠️',
    title: 'Account not set up',
    body: 'This login has no family profile. Please log out and register again, or contact the app owner.',
  },
};

export const AccountStatusScreen: React.FC<{ kind: Kind }> = ({ kind }) => {
  const { authUser, signOut } = useAuth();
  const c = CONTENT[kind];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-5xl mb-3">{c.icon}</div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{c.title}</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{c.body}</p>
        {authUser?.email && (
          <p className="text-xs text-slate-400 mt-3">Signed in as {authUser.email}</p>
        )}
        <button
          onClick={signOut}
          className="mt-5 px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold"
        >
          Log out
        </button>
      </div>
    </div>
  );
};
