import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  Bell,
  ShieldAlert,
  Flame,
  UserCheck,
  ChevronDown,
  LogOut,
  Users,
  Settings,
  Camera,
  UserPlus,
} from 'lucide-react';
import { NotificationModal } from './NotificationModal';
import { AdminDrawer } from './AdminDrawer';
import { AuthModal } from './AuthModal';
import { EditProfileModal } from './EditProfileModal';
import { Avatar } from './Avatar';

interface NavbarProps {
  onNavigateTab: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateTab, activeTab }) => {
  const {
    currentUser,
    isAdmin,
    pendingMembers,
    unreadNotificationCount,
    cylinders,
    switchUser,
    members,
    logout,
  } = useFamily();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Check if any cylinder is low or empty
  const criticalCylinder = cylinders.find((c) => c.status === 'low' || c.status === 'empty');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        {/* Critical Gas Alert Top Ribbon if cylinder is low */}
        {criticalCylinder && (
          <div
            onClick={() => onNavigateTab('gas')}
            className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors shadow-inner"
          >
            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
              <Flame className="w-4 h-4 shrink-0 animate-bounce text-amber-300" />
              <span className="truncate">
                GAS ALERT: {criticalCylinder.name} ({criticalCylinder.currentLevelPercentage}%) - Refill needed!
              </span>
            </div>
            <span className="underline text-[11px] shrink-0 font-medium hidden sm:inline ml-3">
              View Gas Refill →
            </span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <span className="text-xl">🏡</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  Family<span className="text-blue-600">Nest</span>
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  HUB
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">
                Grocery • Meal • Calendar • Gas • Chat
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Approvals quick button (prominent if there are pending members) */}
            {isAdmin && (
              <button
                onClick={() => onNavigateTab('admin')}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  pendingMembers.length > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/30 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                title="Admin Control & Approvals"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden md:inline">Admin Approvals</span>
                {pendingMembers.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black">
                    {pendingMembers.length}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setIsNotifOpen(true)}
              aria-label="Open notifications"
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-scale-up">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Member Profile & Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-slate-800/80 transition-all shadow-xs"
              >
                <Avatar
                  avatar={currentUser?.avatar}
                  name={currentUser?.name}
                  size="sm"
                  className="bg-slate-100 dark:bg-slate-700"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                    {currentUser?.name || 'Guest'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate -mt-0.5">
                    {isAdmin ? 'Admin' : currentUser?.relation || 'Member'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-68 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-scale-up"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-1.5 flex items-center gap-3">
                    <Avatar
                      avatar={currentUser?.avatar}
                      name={currentUser?.name}
                      size="md"
                      className="bg-blue-100 dark:bg-blue-950"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {currentUser?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser?.phone}</p>
                      <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {currentUser?.role === 'admin' ? '🛡️ Admin' : currentUser?.relation}
                      </span>
                    </div>
                  </div>

                  {/* Edit profile & photo button */}
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span>Change Profile Picture & Name</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => { setIsProfileDropdownOpen(false); onNavigateTab('admin'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Add New Family Member</span>
                    </button>
                  )}

                  {members.length > 1 && (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mt-1">
                        Switch Family Member:
                      </p>
                      <div className="space-y-0.5 max-h-36 overflow-y-auto">
                        {members.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => switchUser(m.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                              m.id === currentUser?.id
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar avatar={m.avatar} name={m.name} size="xs" />
                              <span className="truncate">{m.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{m.relation}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="border-t border-slate-150 dark:border-slate-800 mt-2 pt-2 space-y-1">
                    {isAdmin && (
                      <button
                        onClick={() => { setIsProfileDropdownOpen(false); onNavigateTab('admin'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Settings className="w-4 h-4 text-blue-500" />
                        <span>Admin Permissions Panel</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Users className="w-4 h-4" />
                      <span>Log In With Another Mobile</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigateTab={onNavigateTab}
      />
      <AdminDrawer isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </>
  );
};
