import React, { useState, useMemo } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Check,
  Trash2,
  Filter,
  Flame,
  UtensilsCrossed,
  ShoppingCart,
  HeartPulse,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CalendarEvent, CalendarEventCategory } from '../types/family';
import { canPerformAction } from '../utils/familyLogic';
import { Avatar } from './Avatar';

const EVENT_CATEGORIES: { id: CalendarEventCategory; label: string; icon: any; color: string }[] = [
  { id: 'family', label: 'Family Event', icon: Users, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { id: 'meal', label: 'Meal Plan Dish', icon: UtensilsCrossed, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  { id: 'gas_refill', label: 'Gas Refill ETA', icon: Flame, color: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' },
  { id: 'grocery_trip', label: 'Grocery Trip', icon: ShoppingCart, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { id: 'doctor_health', label: 'Health & Doctor', icon: HeartPulse, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
  { id: 'reminder', label: 'General Reminder', icon: Clock, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
];

export const CalendarView: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    toggleCalendarEventCompleted,
    members,
    currentUser,
  } = useFamily();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [category, setCategory] = useState<CalendarEventCategory>('family');
  const [location, setLocation] = useState('');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([currentUser?.id || 'mem-admin']);

  const canManage = canPerformAction(currentUser, 'canManageCalendar');

  const filteredEvents = useMemo(() => {
    return [...calendarEvents]
      .filter((ev) => {
        if (filterCategory !== 'all' && ev.category !== filterCategory) return false;
        if (filterMemberId !== 'all' && !ev.assignedMemberIds.includes(filterMemberId)) return false;
        return true;
      })
      .sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time || '00:00'}`;
        const dateTimeB = `${b.date}T${b.time || '00:00'}`;
        return dateTimeA.localeCompare(dateTimeB);
      });
  }, [calendarEvents, filterCategory, filterMemberId]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    addCalendarEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      category,
      assignedMemberIds: assignedMemberIds.length > 0 ? assignedMemberIds : [currentUser?.id || 'mem-admin'],
      location: location.trim() || undefined,
      reminderMinutesBefore: 60,
    });

    setTitle('');
    setDescription('');
    setLocation('');
    setIsAddModalOpen(false);
  };

  const toggleAssignee = (id: string) => {
    setAssignedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const getCategoryInfo = (cat: CalendarEventCategory) => {
    return EVENT_CATEGORIES.find((c) => c.id === cat) || EVENT_CATEGORIES[0];
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                Shared Family Calendar & Schedule
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Coordinated household schedule synced with meal plans & gas refill deliveries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              {filteredEvents.length} Scheduled Events
            </span>
            <span className="text-xs text-slate-400">
              All members stay in sync across mobile devices
            </span>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/25 self-start md:self-center transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Event</span>
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`shrink-0 px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filterCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Categories
          </button>
          {EVENT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl font-medium transition-colors ${
                filterCategory === c.id
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Member filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs text-slate-400 font-medium">Member:</span>
          <select
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-hidden"
          >
            <option value="all">Everyone in Family</option>
            {members.filter((m) => m.status === 'approved').map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Timeline / List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No calendar events found
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Plan family appointments or sync dishes and gas refill delivery dates.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const catInfo = getCategoryInfo(event.category);
            const Icon = catInfo.icon;
            const assignedMembers = members.filter((m) =>
              event.assignedMemberIds.includes(m.id)
            );

            return (
              <div
                key={event.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  event.isCompleted
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Category icon block */}
                  <div className={`p-3 rounded-2xl shrink-0 ${catInfo.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {catInfo.label}
                      </span>
                      <h3
                        className={`text-sm sm:text-base font-bold truncate ${
                          event.isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {event.title}
                      </h3>
                    </div>

                    {event.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Meta: Date, time, location, assignees */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                        <CalendarIcon className="w-3.5 h-3.5 text-purple-500" />
                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </span>

                      {event.time && (
                        <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          <span>{event.time}</span>
                        </span>
                      )}

                      {event.location && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span>{event.location}</span>
                        </span>
                      )}

                      {/* Assignees avatars */}
                      {assignedMembers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400">For:</span>
                          <div className="flex -space-x-1">
                            {assignedMembers.map((m) => (
                              <Avatar
                                key={m.id}
                                avatar={m.avatar}
                                name={m.name}
                                size="xs"
                                className="ring-1 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-700"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => toggleCalendarEventCompleted(event.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      event.isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{event.isCompleted ? 'Completed' : 'Mark Done'}</span>
                  </button>

                  {canManage && (
                    <button
                      onClick={() => deleteCalendarEvent(event.id)}
                      aria-label="Delete calendar event"
                      className="p-1.5 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">
              Add Event to Shared Calendar
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule appointments, family outings or important household reminders.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doctor appointment, D-Mart Grocery Run, School Parent Meeting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CalendarEventCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Place
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Home, Hospital, Bandra"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Family Members
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {members.filter((m) => m.status === 'approved').map((m) => {
                    const isAssigned = assignedMemberIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleAssignee(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                          isAssigned
                            ? 'bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Avatar avatar={m.avatar} name={m.name} size="xs" />
                        <span>{m.name}</span>
                        {isAssigned && <Check className="w-3 h-3 text-purple-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details for the family..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
