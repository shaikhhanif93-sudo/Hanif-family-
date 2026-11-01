import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  UserPlus,
  X,
  Phone,
  Check,
  Settings2,
  MapPin,
  Flame,
  Calendar,
  ShoppingCart,
  UtensilsCrossed,
  Info,
  Trash2,
  Camera,
} from 'lucide-react';
import { FamilyMember, MemberPermissions } from '../types/family';
import { PhotoUploadInput } from './PhotoUploadInput';
import { Avatar } from './Avatar';
import { normalizePhoneNumber } from '../utils/familyLogic';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onClose }) => {
  const {
    members,
    pendingMembers,
    approveMember,
    rejectMember,
    addMemberDirectly,
    removeMember,
    updateMemberPermissions,
    currentUser,
  } = useFamily();

  const [activeTab, setActiveTab] = useState<'pending' | 'members' | 'add'>('members');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form state for adding member directly
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Mother');
  const [newAvatar, setNewAvatar] = useState('👩‍🍳');
  const [addError, setAddError] = useState<string | null>(null);
  const [addPermissions, setAddPermissions] = useState<MemberPermissions>({
    canManageGroceries: true,
    canEditMealPlan: true,
    canBookGas: true,
    canTraceLocations: true,
    canManageCalendar: true,
  });

  // Temporary permissions state for currently inspected member
  const [tempPermissions, setTempPermissions] = useState<MemberPermissions>({
    canManageGroceries: true,
    canEditMealPlan: true,
    canBookGas: true,
    canTraceLocations: true,
    canManageCalendar: true,
  });

  if (!isOpen) return null;

  const handleStartApprove = (member: FamilyMember) => {
    setEditingMember(member);
    setTempPermissions(member.permissions);
  };

  const handleConfirmApprove = () => {
    if (!editingMember) return;
    approveMember(editingMember.id, tempPermissions);
    setEditingMember(null);
  };

  const handleSaveExistingPermissions = () => {
    if (!editingMember) return;
    updateMemberPermissions(editingMember.id, tempPermissions);
    setEditingMember(null);
  };

  const togglePermission = (key: keyof MemberPermissions) => {
    setTempPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAddPermission = (key: keyof MemberPermissions) => {
    setAddPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCreateMemberDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const validation = normalizePhoneNumber(newPhone);
    if (!validation.isValid) {
      setAddError(validation.error || 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!newName.trim()) {
      setAddError('Please enter family member name');
      return;
    }

    addMemberDirectly({
      name: newName.trim(),
      phone: validation.formatted,
      relation: newRelation,
      avatar: newAvatar,
      permissions: addPermissions,
    });

    setNewName('');
    setNewPhone('');
    setNewAvatar('👩‍🍳');
    setActiveTab('members');
  };

  const approvedMembers = members.filter((m) => m.status === 'approved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-150 dark:border-slate-800 bg-linear-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                  Family Members & Approvals
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Admin: Shaikh Hanif
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add real family members, manage profile pictures, approvals & permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close admin drawer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-150 dark:border-slate-800 px-6 pt-3 gap-6 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('members');
              setEditingMember(null);
            }}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Family Members ({approvedMembers.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('add');
              setEditingMember(null);
            }}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'add'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-500" />
            <span>+ Add Member</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pending');
              setEditingMember(null);
            }}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pending Approvals</span>
            {pendingMembers.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500 text-white animate-pulse">
                {pendingMembers.length}
              </span>
            )}
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Permission Editor Modal overlay if editing */}
          {editingMember && (
            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 mb-4 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200/60 dark:border-blue-800/60">
                <div className="flex items-center gap-3">
                  <Avatar avatar={editingMember.avatar} name={editingMember.name} size="md" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      Configure Permissions: {editingMember.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {editingMember.relation} • {editingMember.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              {/* Permission Checkboxes */}
              <div className="mt-4 space-y-2.5">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-300">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <ShoppingCart className="w-4 h-4 text-emerald-500" />
                    <span>Manage Shared Grocery List</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempPermissions.canManageGroceries}
                    onChange={() => togglePermission('canManageGroceries')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-300">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                    <span>Add Dishes & Weekly Meal Planner</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempPermissions.canEditMealPlan}
                    onChange={() => togglePermission('canEditMealPlan')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-300">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>Book Gas Cylinder & Update Cylinder Level</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempPermissions.canBookGas}
                    onChange={() => togglePermission('canBookGas')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-300">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>Trace Family Members' Live Locations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempPermissions.canTraceLocations}
                    onChange={() => togglePermission('canTraceLocations')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-300">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span>Create & Edit Shared Calendar Events</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempPermissions.canManageCalendar}
                    onChange={() => togglePermission('canManageCalendar')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setEditingMember(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                {editingMember.status === 'pending' ? (
                  <button
                    onClick={handleConfirmApprove}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Member & Save</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveExistingPermissions}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Add Family Member Directly Tab */}
          {activeTab === 'add' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-150 dark:border-slate-800">
                <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">
                  Add a Family Member Directly
                </h3>
                <p className="text-xs text-slate-500">
                  Register your family member with their real mobile number & profile photo.
                </p>
              </div>

              <form onSubmit={handleCreateMemberDirectly} className="space-y-4">
                {/* Photo Upload with live preview */}
                <PhotoUploadInput
                  value={newAvatar}
                  onChange={setNewAvatar}
                  label="Member Profile Picture"
                  subLabel="Upload photo from phone or select avatar"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatima, Ayaan, Sarah"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43211"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Family Relationship
                  </label>
                  <select
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Wife">Wife</option>
                    <option value="Husband">Husband</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Other">Other Family Member</option>
                  </select>
                </div>

                {addError && <p className="text-xs text-red-500">{addError}</p>}

                {/* Initial permissions preview */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Default Household Permissions Granted:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addPermissions.canManageGroceries}
                        onChange={() => toggleAddPermission('canManageGroceries')}
                        className="rounded text-blue-600"
                      />
                      <span>Groceries</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addPermissions.canEditMealPlan}
                        onChange={() => toggleAddPermission('canEditMealPlan')}
                        className="rounded text-blue-600"
                      />
                      <span>Meal Planning</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addPermissions.canBookGas}
                        onChange={() => toggleAddPermission('canBookGas')}
                        className="rounded text-blue-600"
                      />
                      <span>Gas Refill</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addPermissions.canTraceLocations}
                        onChange={() => toggleAddPermission('canTraceLocations')}
                        className="rounded text-blue-600"
                      />
                      <span>Location Tracing</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Family Member Now</span>
                </button>
              </form>
            </div>
          )}

          {/* Active Members List */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              {approvedMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      avatar={member.avatar}
                      name={member.name}
                      size="lg"
                      className="bg-slate-100 dark:bg-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {member.name}
                        </h4>
                        {member.role === 'admin' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                            Admin (Shaikh Hanif)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {member.relation}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {member.phone} • Last active {member.lastActive}
                      </p>

                      {/* Permissions Tags */}
                      <div className="flex flex-wrap items-center gap-1 mt-2">
                        {member.permissions.canManageGroceries && (
                          <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                            Groceries
                          </span>
                        )}
                        {member.permissions.canEditMealPlan && (
                          <span className="text-[9px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 px-1.5 py-0.5 rounded">
                            Meals
                          </span>
                        )}
                        {member.permissions.canBookGas && (
                          <span className="text-[9px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 px-1.5 py-0.5 rounded">
                            Gas
                          </span>
                        )}
                        {member.permissions.canTraceLocations && (
                          <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 px-1.5 py-0.5 rounded">
                            Location
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {member.role !== 'admin' && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleStartApprove(member)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Permissions</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${member.name} from the family hub?`)) {
                            removeMember(member.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              {pendingMembers.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    No pending approval requests
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    When someone logs in with a new mobile number, their approval request and profile picture will appear here.
                  </p>
                </div>
              ) : (
                pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        avatar={member.avatar}
                        name={member.name}
                        size="lg"
                        className="bg-amber-100 dark:bg-amber-950"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                            {member.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                            {member.relation}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartApprove(member)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Review & Approve</span>
                      </button>
                      <button
                        onClick={() => rejectMember(member.id)}
                        className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Decline request"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            As Admin, you can add family members directly or approve members who sign in from their phone.
          </span>
        </div>
      </div>
    </div>
  );
};
