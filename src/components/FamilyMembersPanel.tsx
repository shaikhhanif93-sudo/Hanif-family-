import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Invite, UserProfile } from '../types/accounts';

const inputClass =
  'w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500';

export const FamilyMembersPanel: React.FC = () => {
  const { profile } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isHead = profile?.role === 'head';
  const familyId = profile?.familyId;

  useEffect(() => {
    if (!familyId) return;
    const unsubMembers = onSnapshot(
      query(collection(db, 'users'), where('familyId', '==', familyId)),
      (snap) => setMembers(snap.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id }))),
      (err) => setError(err.message)
    );
    let unsubInvites = () => {};
    if (isHead && profile) {
      unsubInvites = onSnapshot(
        query(collection(db, 'invites'), where('headUid', '==', profile.uid)),
        (snap) => setInvites(snap.docs.map((d) => ({ ...(d.data() as Invite), id: d.id }))),
        (err) => setError(err.message)
      );
    }
    return () => {
      unsubMembers();
      unsubInvites();
    };
  }, [familyId, isHead, profile?.uid]);

  const addInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!profile || !familyId) return;
    if (!name.trim() || !cleanEmail) {
      setError('Please enter the member name and email.');
      return;
    }
    if (invites.some((i) => i.email === cleanEmail && i.status === 'invited')) {
      setError('This email is already invited.');
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, 'invites'), {
        familyId,
        headUid: profile.uid,
        headName: profile.name,
        name: name.trim(),
        relation: relation.trim() || 'Family Member',
        email: cleanEmail,
        phone: phone.trim(),
        status: 'invited',
      });
      setName('');
      setRelation('');
      setEmail('');
      setPhone('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (inviteId: string) => {
    try {
      await updateDoc(doc(db, 'invites', inviteId), { status: 'revoked' });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openInvites = invites.filter((i) => i.status === 'invited');

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <section>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">👨‍👩‍👧 Family members</h2>
        <div className="space-y-2">
          {members.length === 0 && <p className="text-xs text-slate-500">No members yet.</p>}
          {members.map((m) => (
            <div key={m.uid} className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {m.name} <span className="text-xs font-medium text-slate-500">· {m.relation || m.role}</span>
              </div>
              <div className="text-xs text-slate-500 break-all">{m.email}</div>
              {m.phone && <div className="text-xs text-slate-500">{m.phone}</div>}
            </div>
          ))}
        </div>
      </section>

      {isHead && (
        <>
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">➕ Invite a member</h2>
            <form onSubmit={addInvite} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <input className={inputClass} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={inputClass} placeholder="Relation (Wife, Son, Mother…)" value={relation} onChange={(e) => setRelation(e.target.value)} />
              <input className={inputClass} placeholder="Email (required)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={inputClass} placeholder="Mobile number (optional)" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {error && <div className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</div>}
              <button type="submit" disabled={busy} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-60">
                {busy ? 'Adding…' : 'Add member'}
              </button>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ask the member to install the app, tap "My family head invited me", and sign up with this same email.
              </p>
            </form>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">📨 Waiting to join ({openInvites.length})</h2>
            <div className="space-y-2">
              {openInvites.length === 0 && <p className="text-xs text-slate-500">No open invitations.</p>}
              {openInvites.map((i) => (
                <div key={i.id} className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {i.name} <span className="text-xs font-medium text-slate-500">· {i.relation}</span>
                    </div>
                    <div className="text-xs text-slate-500 break-all">{i.email}</div>
                  </div>
                  <button onClick={() => revoke(i.id)} className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
