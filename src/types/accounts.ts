export type AccountRole = 'head' | 'member';
export type AccountStatus = 'pending' | 'approved' | 'rejected';

/** Stored in Firestore at users/{uid} */
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: AccountRole;
  status: AccountStatus;
  familyId?: string;
  relation?: string;
  inviteId?: string;
  createdAt?: unknown;
}

/** Stored in Firestore at families/{familyId} */
export interface FamilyDoc {
  id: string;
  name: string;
  headUid: string;
  headName: string;
}

export type InviteStatus = 'invited' | 'accepted' | 'revoked';

/** Stored in Firestore at invites/{inviteId} */
export interface Invite {
  id: string;
  familyId: string;
  headUid: string;
  headName: string;
  name: string;
  relation: string;
  email: string; // always lowercase
  phone: string;
  status: InviteStatus;
  acceptedByUid?: string;
}
