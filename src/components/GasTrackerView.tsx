import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  PhoneCall,
  RotateCcw,
  Plus,
  ShieldCheck,
  Check,
  X,
  Truck,
  Sparkles,
} from 'lucide-react';
import { GasCylinder, GasBookingRecord } from '../types/family';
import { calculateGasStatus } from '../utils/familyLogic';

export const GasTrackerView: React.FC = () => {
  const {
    cylinders,
    updateGasLevel,
    markCylinderEmpty,
    bookGasRefill,
    confirmRefillDelivered,
    currentUser,
  } = useFamily();

  const [selectedCylinderId, setSelectedCylinderId] = useState<string>(cylinders[0]?.id || '');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState<number>(cylinders[0]?.currentLevelPercentage ?? 18);

  // Booking modal form state
  const [provider, setProvider] = useState<'Indane' | 'HP Gas' | 'Bharat Gas' | 'Super Gas' | 'Other'>('Indane');
  const [bookingRef, setBookingRef] = useState(`IND-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // 2 days later by default
    return d.toISOString().split('T')[0];
  });
  const [cost, setCost] = useState('853');
  const [bookingNotes, setBookingNotes] = useState('Booked via IVR/App. Keep cash/UPI ready at gate.');

  const currentCylinder = cylinders.find((c) => c.id === selectedCylinderId) || cylinders[0];

  const handleLevelChange = (newLevel: number) => {
    setSliderValue(newLevel);
    updateGasLevel(currentCylinder.id, newLevel);
  };

  const handleEmptyClick = () => {
    setSliderValue(0);
    markCylinderEmpty(currentCylinder.id);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookGasRefill(currentCylinder.id, {
      bookingRef: bookingRef.trim(),
      provider,
      expectedDeliveryDate: expectedDate,
      cost: cost ? parseFloat(cost) : undefined,
      status: 'booked',
      notes: bookingNotes.trim() || undefined,
    });
    setIsBookModalOpen(false);
  };

  const statusInfo = calculateGasStatus(currentCylinder.currentLevelPercentage);
  const isCritical = currentCylinder.currentLevelPercentage <= 20;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                LPG Gas Cylinder & Refill Tracker
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated drop alerts, collective empty reporting & refill coordination
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isCritical
                  ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {isCritical ? '⚠️ Refill Planning Needed' : '✓ Gas Level Adequate'}
            </span>
            <span className="text-xs text-slate-400">
              Auto-alerts sent to everyone whenever level drops
            </span>
          </div>
        </div>

        {/* Cylinder switcher if family has multiple cylinders */}
        {cylinders.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start md:self-center">
            {cylinders.map((cyl) => (
              <button
                key={cyl.id}
                onClick={() => {
                  setSelectedCylinderId(cyl.id);
                  setSliderValue(cyl.currentLevelPercentage);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cyl.id === currentCylinder.id
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cyl.name.split(' ')[0]} ({cyl.currentLevelPercentage}%)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Visual Cylinder + Level Controller + Refill Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual LPG Cylinder (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden">
          {/* Status Badge */}
          <div className="w-full flex items-center justify-between">
            <div className="text-left">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {currentCylinder.name}
              </h2>
              <p className="text-[11px] text-slate-400">14.2 kg Domestic LPG</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                currentCylinder.currentLevelPercentage === 0
                  ? 'bg-red-600 text-white animate-bounce'
                  : currentCylinder.currentLevelPercentage <= 20
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {statusInfo.status}
            </span>
          </div>

          {/* Stylized SVG LPG Cylinder Graphic */}
          <div className="my-6 relative flex flex-col items-center">
            {/* Flame glow behind */}
            {currentCylinder.currentLevelPercentage > 0 && (
              <div
                className="absolute top-12 w-28 h-28 rounded-full blur-2xl transition-opacity pointer-events-none"
                style={{
                  backgroundColor:
                    currentCylinder.currentLevelPercentage > 25 ? '#F59E0B33' : '#EF444444',
                }}
              />
            )}

            <svg
              width="180"
              height="260"
              viewBox="0 0 180 260"
              className="drop-shadow-xl overflow-visible"
            >
              <defs>
                {/* Cylinder metal red gradient */}
                <linearGradient id="cylinderBody" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#991B1B" />
                  <stop offset="25%" stopColor="#DC2626" />
                  <stop offset="50%" stopColor="#EF4444" />
                  <stop offset="85%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </linearGradient>

                {/* Fill liquid gradient */}
                <linearGradient id="liquidFill" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#047857" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#065F46" />
                </linearGradient>

                {/* Brass valve gradient */}
                <linearGradient id="brassValve" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B45309" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#92400E" />
                </linearGradient>

                <clipPath id="cylinderClip">
                  {/* Outer body shape rounded top and bottom */}
                  <rect x="25" y="70" width="130" height="150" rx="20" />
                </clipPath>
              </defs>

              {/* Top Handle / Collar Guard Ring */}
              <path
                d="M 50 40 C 50 25, 130 25, 130 40 L 135 68 C 115 72, 65 72, 45 68 Z"
                fill="#B91C1C"
                stroke="#7F1D1D"
                strokeWidth="2"
              />
              {/* Collar hand holes */}
              <rect x="70" y="32" width="40" height="14" rx="7" fill="#1E293B" opacity="0.3" />

              {/* Brass Valve */}
              <rect x="83" y="16" width="14" height="24" rx="2" fill="url(#brassValve)" />
              <rect x="76" y="12" width="28" height="6" rx="2" fill="url(#brassValve)" />

              {/* Cylinder Outer Body */}
              <rect
                x="25"
                y="70"
                width="130"
                height="150"
                rx="22"
                fill="url(#cylinderBody)"
                stroke="#991B1B"
                strokeWidth="2"
              />

              {/* Transparent gauge window inside cylinder to show gas level fill */}
              <g clipPath="url(#cylinderClip)">
                <rect x="75" y="75" width="30" height="140" rx="8" fill="#1E293B" opacity="0.45" />

                {/* Live Gas Level bar inside window */}
                <rect
                  x="77"
                  y={210 - (currentCylinder.currentLevelPercentage / 100) * 130}
                  width="26"
                  height={(currentCylinder.currentLevelPercentage / 100) * 130}
                  rx="6"
                  fill={
                    currentCylinder.currentLevelPercentage <= 20
                      ? '#EF4444'
                      : currentCylinder.currentLevelPercentage <= 50
                      ? '#F59E0B'
                      : '#10B981'
                  }
                  className="transition-all duration-500"
                />

                {/* Level ticks */}
                <line x1="75" y1="110" x2="80" y2="110" stroke="#FFF" strokeWidth="1.5" opacity="0.6" />
                <line x1="75" y1="145" x2="80" y2="145" stroke="#FFF" strokeWidth="1.5" opacity="0.6" />
                <line x1="75" y1="180" x2="80" y2="180" stroke="#FFF" strokeWidth="1.5" opacity="0.6" />
              </g>

              {/* Central Stencil text on cylinder */}
              <text
                x="90"
                y="115"
                textAnchor="middle"
                fill="#FEF08A"
                fontSize="12"
                fontWeight="900"
                letterSpacing="1.5"
                opacity="0.9"
              >
                14.2 KG
              </text>
              <text
                x="90"
                y="130"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="700"
                opacity="0.75"
              >
                DOMESTIC LPG
              </text>

              {/* Bottom base foot ring */}
              <rect x="42" y="220" width="96" height="20" rx="6" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />
              <rect x="65" y="225" width="50" height="8" rx="4" fill="#0F172A" opacity="0.3" />
            </svg>

            {/* Percentage Display */}
            <div className="mt-3 text-center">
              <span className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                {currentCylinder.currentLevelPercentage}%
              </span>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {statusInfo.daysRemaining > 0
                  ? `~${statusInfo.daysRemaining} Days of gas remaining`
                  : 'Cylinder exhausted! No gas remaining'}
              </p>
            </div>
          </div>

          {/* Quick 1-Click Action: "Report Empty Now" */}
          <button
            onClick={handleEmptyClick}
            className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>Mark Cylinder as Empty (0%)</span>
          </button>
        </div>

        {/* Right Column: Controls & Refill Planner (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Level Adjustment & Presets Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Update Cylinder Level
                </h3>
                <p className="text-xs text-slate-400">
                  Slide or pick preset when you check cylinder weight
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Updated {new Date(currentCylinder.lastUpdated).toLocaleDateString()} by {currentCylinder.lastUpdatedBy}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span className="text-red-600">0% Empty</span>
                <span className="text-amber-600">20% Low (Alert)</span>
                <span className="text-emerald-600">50% Half</span>
                <span className="text-emerald-600">100% Full</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => handleLevelChange(parseInt(e.target.value, 10))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Quick Level Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => handleLevelChange(100)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  currentCylinder.currentLevelPercentage === 100
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                100% Full
              </button>
              <button
                onClick={() => handleLevelChange(50)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  currentCylinder.currentLevelPercentage === 50
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                50% Half
              </button>
              <button
                onClick={() => handleLevelChange(20)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  currentCylinder.currentLevelPercentage === 20
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400'
                }`}
              >
                20% Low
              </button>
              <button
                onClick={() => handleLevelChange(0)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  currentCylinder.currentLevelPercentage === 0
                    ? 'bg-red-700 text-white border-red-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-red-600 border-red-200 dark:border-red-900 hover:border-red-500'
                }`}
              >
                0% Empty
              </button>
            </div>
          </div>

          {/* Gas Refill Coordination Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Refill Booking & Schedule
                </h3>
              </div>
              {!currentCylinder.booking && (
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/25 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Refill Now</span>
                </button>
              )}
            </div>

            {currentCylinder.booking ? (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      {currentCylinder.booking.provider} Refill Booked
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-200/80 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                      #{currentCylinder.booking.bookingRef}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Status: {currentCylinder.booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Booked By:
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {currentCylinder.booking.bookedByName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Expected Delivery ETA:
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      📅 {currentCylinder.booking.expectedDeliveryDate}
                    </span>
                  </div>
                </div>

                {currentCylinder.booking.notes && (
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 italic bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl">
                    Note: {currentCylinder.booking.notes}
                  </p>
                )}

                {/* Delivery arrival confirmation */}
                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Once the delivery boy delivers cylinder:
                  </span>
                  <button
                    onClick={() => confirmRefillDelivered(currentCylinder.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Delivered & Full</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No active gas refill booking for this cylinder
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When level is low, any member can record the booking details so everyone knows when it will arrive.
                </p>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plan Refill Booking</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refill Booking Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">
              Book Gas Cylinder Refill
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter booking reference and expected delivery date to coordinate with the family.
            </p>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    LPG Distributor
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="Indane">Indane (IOCL)</option>
                    <option value="HP Gas">HP Gas (HPCL)</option>
                    <option value="Bharat Gas">Bharat Gas (BPCL)</option>
                    <option value="Super Gas">Super Gas</option>
                    <option value="Other">Other Provider</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Booking Ref / Order ID
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cost / Price (₹)
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="853"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Instructions / Notes
                </label>
                <input
                  type="text"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Keep cash/UPI ready at gate, delivery boy calls before arrival"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  This booking will automatically sync to our shared family calendar with a reminder.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
