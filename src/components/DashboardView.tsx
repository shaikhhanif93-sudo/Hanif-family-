import React from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  ShoppingCart,
  UtensilsCrossed,
  Calendar,
  Flame,
  MapPin,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Battery,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import { Avatar } from './Avatar';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    isAdmin,
    pendingMembers,
    groceries,
    mealPlans,
    calendarEvents,
    cylinders,
    chatMessages,
    members,
  } = useFamily();

  // Find primary cylinder
  const primaryCylinder = cylinders[0];
  const isGasLow = primaryCylinder && primaryCylinder.currentLevelPercentage <= 20;

  // Unbought groceries
  const pendingGroceries = groceries.filter((g) => !g.isBought);
  const urgentGroceries = groceries.filter((g) => g.isUrgent && !g.isBought);

  // Today's meal plan
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMealPlan = mealPlans.find((m) => m.date === todayStr) || mealPlans[0];

  // Next calendar events
  const upcomingEvents = calendarEvents
    .filter((e) => !e.isCompleted)
    .slice(0, 2);

  // Latest chat message
  const latestMessage = chatMessages[chatMessages.length - 1];

  const approvedMembers = members.filter((m) => m.status === 'approved');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar
              avatar={currentUser?.avatar}
              name={currentUser?.name}
              size="md"
              className="bg-white/20 ring-2 ring-white/40"
            />
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
              {currentUser?.role === 'admin' ? 'Family Administrator' : currentUser?.relation}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Assalamu alaikum, {currentUser?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
            Welcome to the family hub. Everything you need to coordinate groceries, meals, daily schedules, gas refill, and live tracing.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 rounded-l-full pointer-events-none" />
      </div>

      {/* Admin Pending Approvals Callout Banner */}
      {isAdmin && pendingMembers.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-up">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base">
                {pendingMembers.length} Family Member(s) Awaiting Your Approval!
              </h2>
              <p className="text-xs text-amber-100">
                {pendingMembers.map((m) => `${m.name} (${m.phone})`).join(', ')} requested access.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('admin')}
            className="px-4 py-2 rounded-xl bg-white text-amber-900 font-black text-xs shadow-xs hover:bg-amber-50 transition-colors self-start sm:self-center shrink-0"
          >
            Review & Approve Now →
          </button>
        </div>
      )}

      {/* High-Priority Gas Warning Tile */}
      {isGasLow && primaryCylinder && (
        <div
          onClick={() => onNavigateTab('gas')}
          className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-red-500 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-red-600 uppercase tracking-wider bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-md">
                  Action Required
                </span>
                <span className="text-xs font-bold text-slate-500">Automated Alert Sent</span>
              </div>
              <h3 className="font-black text-base text-slate-800 dark:text-slate-100 mt-0.5">
                {primaryCylinder.name} is Low ({primaryCylinder.currentLevelPercentage}%)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {primaryCylinder.booking
                  ? `Refill already booked (${primaryCylinder.booking.provider} #${primaryCylinder.booking.bookingRef}), ETA: ${primaryCylinder.booking.expectedDeliveryDate}`
                  : 'Cylinder level dropped. Please plan refill booking together with family.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
            <span>Manage Gas Refill</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Shared Groceries */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                {pendingGroceries.length} To Buy
              </span>
            </div>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              Shared Grocery List
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {urgentGroceries.length > 0
                ? `🚨 ${urgentGroceries.length} urgent item(s) needed today!`
                : 'Checked items update across all family phones.'}
            </p>

            {/* Quick list preview */}
            <div className="mt-4 space-y-1.5">
              {pendingGroceries.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('groceries')}
            className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Open Grocery List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Weekly Meal Planner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                {todayMealPlan?.dayOfWeek || 'Today'}
              </span>
            </div>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              Weekly Meal Planner
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add dishes, sync ingredients to groceries & schedule on calendar.
            </p>

            {/* Today's planned meals preview */}
            <div className="mt-4 space-y-1.5">
              {todayMealPlan?.meals.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No meals planned yet for {todayMealPlan.dayOfWeek}. Click to suggest a dish!
                </p>
              ) : (
                todayMealPlan?.meals.slice(0, 2).map((meal) => (
                  <div
                    key={meal.id}
                    className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 text-xs border border-amber-100 dark:border-amber-900/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold uppercase text-[9px] text-amber-700 dark:text-amber-300 block">
                        {meal.type}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {meal.dishName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">By {meal.addedByName.split(' ')[0]}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('meals')}
            className="mt-5 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>View Meal Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Gas Cylinder & Refill */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-red-400 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
                {primaryCylinder?.currentLevelPercentage}% Level
              </span>
            </div>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              LPG Gas Cylinder
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {primaryCylinder?.daysRemainingEstimate} days estimated remaining at normal usage.
            </p>

            {/* Gauge progress bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Cylinder Level</span>
                <span className={isGasLow ? 'text-red-600' : 'text-emerald-600'}>
                  {primaryCylinder?.currentLevelPercentage}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isGasLow ? 'bg-red-600' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${primaryCylinder?.currentLevelPercentage || 0}%` }}
                />
              </div>
              {primaryCylinder?.booking && (
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold pt-1">
                  📦 Refill ETA: {primaryCylinder.booking.expectedDeliveryDate}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('gas')}
            className="mt-5 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Cylinder Details & Refill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Shared Calendar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-purple-400 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                {calendarEvents.length} Events
              </span>
            </div>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              Shared Schedule
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upcoming appointments, gas delivery reminders & grocery trips.
            </p>

            <div className="mt-4 space-y-1.5">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {ev.title}
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold shrink-0">
                    {ev.date.split('-')[2]}/{ev.date.split('-')[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="mt-5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Open Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 5: Family Live Location Tracing */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {approvedMembers.length} Active
              </span>
            </div>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              Live Member Tracing
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Admin trace view, verified GPS pins, battery and safety status.
            </p>

            <div className="mt-4 space-y-1.5">
              {approvedMembers.length === 1 ? (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 text-center space-y-2">
                  <p>You are currently the only member. Add your family to start tracing!</p>
                  <button
                    onClick={() => onNavigateTab('admin')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Family Member</span>
                  </button>
                </div>
              ) : (
                approvedMembers.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Avatar avatar={m.avatar} name={m.name} size="xs" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {m.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">({m.location.landmark})</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                      🔋 {m.location.batteryLevel}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('location')}
            className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>View Radar Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 6: Family Chat with Transparent Receipts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                Read Receipts
              </span>
            </div>

            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              Family Group Chat
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Visible to everyone with double blue ticks and read timestamp audit.
            </p>

            {latestMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                  {latestMessage.senderName}:
                </span>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                  "{latestMessage.text}"
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('chat')}
            className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Open Family Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
