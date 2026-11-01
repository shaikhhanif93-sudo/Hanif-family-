import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, where, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/accounts';

export const SuperAdminPanel: React.FC = () => {
  const { authUser, signOut } = useAuth();
  const [heads, setHeads] = useState<UserProfile[]>([]);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'head'));
    return onSnapshot(
      q,
      (snap) => setHeads(snap.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id }))),
      (err) => setError(err.message)
    );
  }, []);

  const pending = heads.filter((h) => h.status === 'pending');
  const approved = heads.filter((h) => h.status === 'approved');
  const rejected = heads.filter((h) => h.status === 'rejected');

  const approve = async (h: UserProfile) => {
    setBusyId(h.uid);
    setError('');
    try {
      const familyRef = doc(collection(db, 'families'));
      const batch = writeBatch(db);
      batch.set(familyRef, {
        name: `${h.name}'s Family`,
        headUid: h.uid,
        headName: h.name,
      });
      batch.update(doc(db, 'users', h.uid), { status: 'approved', familyId: familyRef.id });
      await batch.commit();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId('');
    }
  };

  const setStatus = async (h: UserProfile, status: 'rejected' | 'approved') => {
    setBusyId(h.uid);
    setError('');
    try {
      await updateDoc(doc(db, 'users', h.uid), { status });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId('');
    }
  };

  const Card: React.FC<{ h: UserProfile; children: React.ReactNode }> = ({ h, children }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
      <div className="font-bold text-sm text-slate-900 dark:text-white">{h.name}</div>
      <div className="text-xs text-slate-500 mt-0.5 break-all">{h.email}</div>
      {h.phone && <div className="text-xs text-slate-500">{h.phone}</div>}
      <div className="flex gap-2 mt-3">{children}</div>
    </div>
  );

  const btn = 'flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">🛡️ Super Admin</h1>
            <p className="text-xs text-slate-500">{authUser?.email}</p>
          </div>
          <button onClick={signOut} className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold">
            Log out
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</div>
        )}

        <h2 className="text-sm font-bold mb-2 text-slate-800 dark:text-slate-200">
          Waiting for approval ({pending.length})
        </h2>
        <div className="space-y-3 mb-6">
          {pending.length === 0 && <p className="text-xs text-slate-500">No pending requests.</p>}
          {pending.map((h) => (
            <Card key={h.uid} h={h}>
              <button disabled={busyId === h.uid} onClick={() => approve(h)} className={`${btn} bg-emerald-600`}>
                Approve
              </button>
              <button disabled={busyId === h.uid} onClick={() => setStatus(h, 'rejected')} className={`${btn} bg-red-600`}>
                Reject
              </button>
            </Card>
          ))}
        </div>

        <h2 className="text-sm font-bold mb-2 text-slate-800 dark:text-slate-200">
          Approved family heads ({approved.length})
        </h2>
        <div className="space-y-3 mb-6">
          {approved.length === 0 && <p className="text-xs text-slate-500">None yet.</p>}
          {approved.map((h) => (
            <Card key={h.uid} h={h}>
              <button disabled={busyId === h.uid} onClick={() => setStatus(h, 'rejected')} className={`${btn} bg-red-600`}>
                Block access
              </button>
            </Card>
          ))}
        </div>

        {rejected.length > 0 && (
          <>
            <h2 className="text-sm font-bold mb-2 text-slate-800 dark:text-slate-200">
              Rejected / blocked ({rejected.length})
            </h2>
            <div className="space-y-3">
              {rejected.map((h) => (
                <Card key={h.uid} h={h}>
                  <button
                    disabled={busyId === h.uid}
                    onClick={() => (h.familyId ? setStatus(h, 'approved') : approve(h))}
                    className={`${btn} bg-blue-600`}
                  >
                    Approve again
                  </button>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
