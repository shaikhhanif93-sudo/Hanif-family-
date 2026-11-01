import React, { useState } from 'react';
import { useAuth, friendlyAuthError } from '../context/AuthContext';

type Mode = 'login' | 'head' | 'invited';

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500';

export const AuthScreen: React.FC = () => {
  const { signIn, signUpFamilyHead, signUpInvitedMember, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setInfo('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode !== 'login' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'head') {
        await signUpFamilyHead({ name, phone, email, password });
      } else {
        await signUpInvitedMember({ name, phone, email, password });
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Type your email above first, then tap "Forgot password".');
      return;
    }
    try {
      await resetPassword(email);
      setInfo('Password reset link sent. Check your email inbox.');
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  };

  const title =
    mode === 'login' ? 'Welcome back' : mode === 'head' ? 'Register as Family Head' : 'Join your family';
  const subtitle =
    mode === 'login'
      ? 'Log in to My Family Nest'
      : mode === 'head'
      ? 'The app owner will review and approve your request.'
      : 'Use the same email your family head added for you.';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🏡</div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">My Family Nest</h1>
          <h2 className="text-base font-bold mt-3 text-slate-800 dark:text-slate-100">{title}</h2>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode !== 'login' && (
            <>
              <input
                className={inputClass}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <input
                className={inputClass}
                placeholder="Mobile number"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </>
          )}
          <input
            className={inputClass}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className={inputClass}
            placeholder="Password (min 6 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {error && (
            <div className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div className="text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl px-3 py-2">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        {mode === 'login' && (
          <button
            type="button"
            onClick={forgot}
            className="w-full mt-3 text-xs font-semibold text-blue-600"
          >
            Forgot password?
          </button>
        )}

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-center text-xs">
          {mode !== 'login' && (
            <button type="button" onClick={() => switchMode('login')} className="font-semibold text-blue-600 block w-full">
              Already have an account? Log in
            </button>
          )}
          {mode !== 'head' && (
            <button type="button" onClick={() => switchMode('head')} className="font-semibold text-slate-600 dark:text-slate-300 block w-full">
              New here? Register as Family Head
            </button>
          )}
          {mode !== 'invited' && (
            <button type="button" onClick={() => switchMode('invited')} className="font-semibold text-slate-600 dark:text-slate-300 block w-full">
              My family head invited me
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
