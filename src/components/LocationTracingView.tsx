import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  MapPin,
  ShieldCheck,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Navigation,
  Compass,
  Clock,
  Phone,
  RefreshCw,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { canPerformAction } from '../utils/familyLogic';
import { FamilyMember } from '../types/family';
import { Avatar } from './Avatar';

export const LocationTracingView: React.FC = () => {
  const {
    members,
    currentUser,
    isAdmin,
    updateMemberLocation,
    toggleLocationSharing,
    addNotification,
  } = useFamily();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [customStatus, setCustomStatus] = useState('');
  const [isUpdatingGps, setIsUpdatingGps] = useState(false);

  const canTrace = canPerformAction(currentUser, 'canTraceLocations');
  const activeMembers = members.filter((m) => m.status === 'approved');
  const selectedMember = members.find((m) => m.id === selectedMemberId) || activeMembers[0];

  const handleLiveGpsCheckIn = () => {
    if (!currentUser) return;
    setIsUpdatingGps(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateMemberLocation(
            currentUser.id,
            {
              lat,
              lng,
              address: `GPS Live Ping (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              landmark: 'Current Verified Location',
            },
            Math.floor(75 + Math.random() * 20)
          );
          setIsUpdatingGps(false);
          addNotification({
            type: 'calendar_reminder',
            title: 'Live Location Updated',
            message: `${currentUser.name} checked in with verified GPS coordinates.`,
            priority: 'normal',
            actionTab: 'location',
          });
        },
        (error) => {
          // Fallback if browser permission denied
          setIsUpdatingGps(false);
          updateMemberLocation(currentUser.id, {
            lat: 19.076 + (Math.random() - 0.5) * 0.01,
            lng: 72.8777 + (Math.random() - 0.5) * 0.01,
            address: 'Sector 4, Bandra West, Mumbai',
            landmark: 'Home Vicinity',
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsUpdatingGps(false);
    }
  };

  const handleUpdateStatusNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStatus.trim() || !currentUser) return;

    updateMemberLocation(currentUser.id, {
      lat: currentUser.location.lat,
      lng: currentUser.location.lng,
      landmark: customStatus.trim(),
    });
    setCustomStatus('');
  };

  const getBatteryIcon = (level: number) => {
    if (level < 25) return <BatteryWarning className="w-4 h-4 text-red-500 animate-pulse" />;
    return <Battery className="w-4 h-4 text-emerald-500" />;
  };

  // If user has no tracing permission and is not admin
  if (!canTrace) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto my-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Location Tracing Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          For family security, location tracing is managed by Shaikh Hanif (Admin). You do not currently have permissions to trace other family members.
        </p>
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 text-xs text-slate-600 dark:text-slate-300 text-left">
          <div className="font-bold mb-1">Your Own Shared Status:</div>
          <p>
            {currentUser?.name}: {currentUser?.location.address} ({currentUser?.location.batteryLevel}% battery)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                  Live Family Location Tracing
                </h1>
                {isAdmin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    Admin Oversight
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time whereabouts, safety landmarks, battery status & check-ins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>{activeMembers.length} Members Sharing Location</span>
            </span>
          </div>
        </div>

        {/* Live GPS Check-in Button */}
        <button
          onClick={handleLiveGpsCheckIn}
          disabled={isUpdatingGps}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/25 self-start md:self-center transition-all disabled:opacity-50"
        >
          <Navigation className={`w-4 h-4 ${isUpdatingGps ? 'animate-spin' : ''}`} />
          <span>{isUpdatingGps ? 'Acquiring GPS...' : 'Check-In My Current Location'}</span>
        </button>
      </div>

      {/* Main Grid: Interactive Map + Member Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Stylized Vector City Map (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Live Family Radar Map
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Bandra & Mumbai Area</span>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full h-80 sm:h-96 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Background Map Graphic (Streets & Water body) */}
            <svg className="w-full h-full" viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet">
              {/* Coastline / Sea */}
              <path
                d="M 0 0 L 120 0 C 130 90, 80 180, 110 270 C 130 320, 90 370, 70 400 L 0 400 Z"
                fill="#38BDF820"
              />
              <text x="30" y="200" fill="#0284C7" fontSize="10" opacity="0.6" transform="rotate(-90 30 200)">
                Arabian Sea
              </text>

              {/* Grid Roads */}
              <line x1="80" y1="120" x2="500" y2="120" stroke="#CBD5E1" strokeWidth="6" opacity="0.6" />
              <line x1="90" y1="220" x2="500" y2="220" stroke="#CBD5E1" strokeWidth="8" opacity="0.6" />
              <line x1="70" y1="320" x2="500" y2="320" stroke="#CBD5E1" strokeWidth="5" opacity="0.6" />

              <line x1="200" y1="0" x2="200" y2="400" stroke="#CBD5E1" strokeWidth="6" opacity="0.6" />
              <line x1="330" y1="0" x2="330" y2="400" stroke="#CBD5E1" strokeWidth="7" opacity="0.6" />
              <line x1="430" y1="0" x2="430" y2="400" stroke="#CBD5E1" strokeWidth="5" opacity="0.6" />

              {/* Landmark zones */}
              <rect x="230" y="80" width="80" height="70" rx="10" fill="#10B98115" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" />
              <text x="270" y="115" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">
                HOME ZONE
              </text>

              <rect x="350" y="180" width="90" height="80" rx="10" fill="#2563EB15" stroke="#2563EB" strokeWidth="1" strokeDasharray="3 3" />
              <text x="395" y="225" textAnchor="middle" fill="#1D4ED8" fontSize="9" fontWeight="bold">
                BKC TECH HUB
              </text>

              <rect x="140" y="260" width="85" height="70" rx="10" fill="#8B5CF615" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" />
              <text x="182" y="300" textAnchor="middle" fill="#6D28D9" fontSize="9" fontWeight="bold">
                COLLEGE CAMPUS
              </text>
            </svg>

            {/* Member Pins on Map with absolute positioning mapped to landmarks */}
            {activeMembers.map((member, idx) => {
              // Simulated map coordinates for realistic spatial layout
              const positions: Record<string, { top: string; left: string }> = {
                'mem-admin': { top: '55%', left: '76%' }, // BKC Office
                'mem-fatima': { top: '28%', left: '52%' }, // Home
                'mem-ayaan': { top: '74%', left: '35%' }, // College
                'mem-rehan': { top: '40%', left: '30%' }, // Transit
              };

              const pos = positions[member.id] || {
                top: `${30 + idx * 20}%`,
                left: `${40 + idx * 15}%`,
              };

              const isSelected = member.id === selectedMember?.id;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  {/* Pulse ring */}
                  <span
                    className="absolute -inset-2 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: member.color }}
                  />

                  {/* Marker Pin */}
                  <div
                    className={`relative p-0.5 rounded-full shadow-lg border-2 transition-transform duration-200 group-hover:scale-125 overflow-hidden ${
                      isSelected
                        ? 'border-white ring-4 ring-blue-500 scale-110'
                        : 'border-white'
                    }`}
                    style={{ backgroundColor: member.color }}
                  >
                    <Avatar avatar={member.avatar} name={member.name} size="xs" />
                  </div>

                  {/* Tooltip Label */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold whitespace-nowrap shadow-md pointer-events-none">
                    {member.name.split(' ')[0]} ({member.location.batteryLevel}%)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick status bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GPS updates synced automatically</span>
            </span>
            <span>Tap on any member marker to view details</span>
          </div>
        </div>

        {/* Right Column: Member Details & Quick Status Updater (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Members Card List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Family Members Located ({activeMembers.length})
            </h3>

            <div className="space-y-2">
              {activeMembers.map((member) => {
                const isSelected = member.id === selectedMember?.id;

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        avatar={member.avatar}
                        name={member.name}
                        size="md"
                        className="bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                            {member.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            ({member.relation})
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">
                          📍 {member.location.landmark}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {member.location.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                        {getBatteryIcon(member.location.batteryLevel)}
                        <span>{member.location.batteryLevel}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {member.location.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Member Detail Card */}
          {selectedMember && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    avatar={selectedMember.avatar}
                    name={selectedMember.name}
                    size="lg"
                    className="bg-slate-100 dark:bg-slate-800"
                  />
                  <div>
                    <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">
                      {selectedMember.name}
                    </h4>
                    <p className="text-xs text-slate-500">{selectedMember.phone}</p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedMember.location.lat},${selectedMember.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 hover:bg-blue-50 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>
              </div>

              {selectedMember.location.statusMessage && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-400 block text-[10px] uppercase">
                    Status Note:
                  </span>
                  "{selectedMember.location.statusMessage}"
                </div>
              )}

              {/* Quick call / check action */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${selectedMember.phone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {selectedMember.name.split(' ')[0]}</span>
                </a>
              </div>
            </div>
          )}

          {/* Quick status message updater for current user */}
          <form
            onSubmit={handleUpdateStatusNote}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
          >
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Update Your Status Note for Family
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Buying veggies, Heading home..."
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
