import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  FamilyMember,
  MemberStatus,
  GroceryItem,
  DayMealPlan,
  CalendarEvent,
  GasCylinder,
  ChatMessage,
  AppNotification,
  UserRole,
  MemberPermissions,
  GasBookingRecord,
  MealEntry,
} from '../types/family';
import {
  calculateGasStatus,
  shouldTriggerGasAlert,
  getIngredientsForDish,
  createMealCalendarEvent,
} from '../utils/familyLogic';

interface FamilyContextType {
  // Auth & Current User
  currentUser: FamilyMember | null;
  currentRole: UserRole;
  isAdmin: boolean;
  setCurrentUser: (user: FamilyMember | null) => void;
  loginWithPhone: (
    phone: string,
    name?: string,
    relation?: string,
    avatar?: string
  ) => { status: MemberStatus | 'new'; member: FamilyMember };
  logout: () => void;
  switchUser: (memberId: string) => void;
  updateProfile: (
    memberId: string,
    updates: { name?: string; relation?: string; avatar?: string; phone?: string }
  ) => void;

  // Family Members Management (Admin)
  members: FamilyMember[];
  pendingMembers: FamilyMember[];
  approveMember: (memberId: string, customPermissions?: Partial<MemberPermissions>) => void;
  rejectMember: (memberId: string) => void;
  addMemberDirectly: (memberData: {
    name: string;
    phone: string;
    relation: string;
    avatar: string;
    permissions?: Partial<MemberPermissions>;
  }) => FamilyMember;
  removeMember: (memberId: string) => void;
  updateMemberPermissions: (memberId: string, permissions: MemberPermissions) => void;
  updateMemberLocation: (
    memberId: string,
    coords: { lat: number; lng: number; address?: string; landmark?: string },
    batteryLevel?: number
  ) => void;
  toggleLocationSharing: (memberId: string, isSharing: boolean) => void;

  // Groceries
  groceries: GroceryItem[];
  addGroceryItem: (item: Omit<GroceryItem, 'id' | 'addedAt' | 'isBought' | 'addedByMemberId' | 'addedByName'>) => void;
  toggleGroceryBought: (itemId: string) => void;
  deleteGroceryItem: (itemId: string) => void;
  clearBoughtGroceries: () => void;

  // Meals & Weekly Planner
  mealPlans: DayMealPlan[];
  addMealToDay: (
    date: string,
    meal: Omit<MealEntry, 'id' | 'addedAt' | 'addedByMemberId' | 'addedByName' | 'syncedToGrocery' | 'syncedToCalendar'>
  ) => void;
  deleteMealFromDay: (date: string, mealId: string) => void;
  syncMealIngredientsToGrocery: (date: string, mealId: string) => void;
  syncMealToCalendar: (date: string, mealId: string) => void;

  // Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdByMemberId' | 'createdByName'>) => void;
  deleteCalendarEvent: (eventId: string) => void;
  toggleCalendarEventCompleted: (eventId: string) => void;

  // Gas Cylinder & Booking
  cylinders: GasCylinder[];
  updateGasLevel: (cylinderId: string, newPercentage: number, notes?: string) => void;
  markCylinderEmpty: (cylinderId: string) => void;
  bookGasRefill: (
    cylinderId: string,
    bookingData: Omit<GasBookingRecord, 'id' | 'cylinderId' | 'bookedByMemberId' | 'bookedByName' | 'bookedDate'>
  ) => void;
  confirmRefillDelivered: (cylinderId: string) => void;

  // Chat & Receipts
  chatMessages: ChatMessage[];
  sendMessage: (text: string, type?: ChatMessage['type'], metadata?: ChatMessage['metadata']) => void;
  markChatAsRead: (messageId: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;

  // Real-time active banner / toast
  activeToast: AppNotification | null;
  dismissToast: () => void;
}

// Storage keys bumped to v3 to guarantee mock members are removed and clean state is active!
const STORAGE_KEY_MEMBERS = 'familynest_members_v3';
const STORAGE_KEY_GROCERIES = 'familynest_groceries_v3';
const STORAGE_KEY_MEALS = 'familynest_meals_v3';
const STORAGE_KEY_CALENDAR = 'familynest_calendar_v3';
const STORAGE_KEY_CYLINDERS = 'familynest_cylinders_v3';
const STORAGE_KEY_CHAT = 'familynest_chat_v3';
const STORAGE_KEY_NOTIFICATIONS = 'familynest_notifications_v3';
const STORAGE_KEY_CURRENT_USER = 'familynest_current_user_v3';

// Only Admin Shaikh Hanif is present. All other members removed as requested!
const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'mem-admin',
    name: 'Shaikh Hanif',
    phone: '+919876543210',
    relation: 'Father (Admin)',
    avatar: '👨‍💼',
    color: '#2563EB',
    role: 'admin',
    status: 'approved',
    permissions: {
      canManageGroceries: true,
      canEditMealPlan: true,
      canBookGas: true,
      canTraceLocations: true,
      canManageCalendar: true,
    },
    joinedAt: new Date().toISOString(),
    lastActive: 'Just now',
    location: {
      lat: 19.067,
      lng: 72.868,
      address: 'Bandra Kurla Complex (BKC), Mumbai',
      landmark: 'Office / Tech Tower',
      batteryLevel: 92,
      timestamp: 'Just now',
      statusMessage: 'Family Administrator',
      isSharing: true,
    },
  },
];

const INITIAL_GROCERIES: GroceryItem[] = [
  {
    id: 'g-1',
    name: 'Fresh Cow Milk',
    category: 'Dairy & Eggs',
    quantity: '2 Litres',
    addedByMemberId: 'mem-admin',
    addedByName: 'Shaikh Hanif',
    addedAt: new Date().toISOString(),
    isBought: false,
    isUrgent: true,
    notes: 'Morning tea and coffee',
  },
  {
    id: 'g-2',
    name: 'Basmati Rice (Daawat / India Gate)',
    category: 'Grains & Bakery',
    quantity: '5 kg',
    addedByMemberId: 'mem-admin',
    addedByName: 'Shaikh Hanif',
    addedAt: new Date().toISOString(),
    isBought: false,
    isUrgent: true,
    notes: 'Kitchen stock replenish',
  },
];

const INITIAL_CYLINDERS: GasCylinder[] = [
  {
    id: 'cyl-1',
    name: 'Main Kitchen Stove Cylinder',
    capacityKg: 14.2,
    currentLevelPercentage: 18, // 18% triggers the requested automated drop alert
    status: 'low',
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: 'Shaikh Hanif',
    daysRemainingEstimate: 4,
    booking: {
      id: 'bk-101',
      cylinderId: 'cyl-1',
      bookingRef: 'IND-8849204',
      provider: 'Indane',
      bookedByMemberId: 'mem-admin',
      bookedByName: 'Shaikh Hanif',
      bookedDate: new Date().toISOString(),
      expectedDeliveryDate: '2026-10-31',
      cost: 853,
      status: 'booked',
      notes: 'Booked via IndianOil One app. Delivery scheduled for Saturday morning.',
    },
  },
  {
    id: 'cyl-2',
    name: 'Backup / Utility Cylinder',
    capacityKg: 14.2,
    currentLevelPercentage: 85,
    status: 'full',
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: 'Shaikh Hanif',
    daysRemainingEstimate: 30,
  },
];

function getDaysForWeek(): DayMealPlan[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0

  return days.map((dayName, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - currentDayIndex + idx);
    const dateStr = d.toISOString().split('T')[0];

    return {
      date: dateStr,
      dayOfWeek: dayName,
      meals: [], // Clean slate for family members to add their favorite dishes!
    };
  });
}

const INITIAL_CALENDAR: CalendarEvent[] = [
  {
    id: 'cal-gas-1',
    title: '🔥 Gas Cylinder Refill Delivery ETA',
    description: 'Indane Gas refill delivery expected between 10 AM - 1 PM. Keep empty cylinder ready at gate.',
    date: '2026-10-31',
    time: '11:00',
    category: 'gas_refill',
    assignedMemberIds: ['mem-admin'],
    createdByMemberId: 'mem-admin',
    createdByName: 'Shaikh Hanif',
    location: 'Home Gate',
    reminderMinutesBefore: 60,
  },
  {
    id: 'cal-shop-1',
    title: '🛒 Family Supermarket Grocery Run',
    description: 'Weekly grocery run for household essentials.',
    date: '2026-10-31',
    time: '17:30',
    category: 'grocery_trip',
    assignedMemberIds: ['mem-admin'],
    createdByMemberId: 'mem-admin',
    createdByName: 'Shaikh Hanif',
    location: 'D-Mart Supermarket, Bandra',
    reminderMinutesBefore: 120,
  },
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'chat-welcome-1',
    senderId: 'mem-admin',
    senderName: 'Shaikh Hanif',
    senderAvatar: '👨‍💼',
    senderColor: '#2563EB',
    text: 'Assalamu alaikum! Welcome to our family hub. Please log in with your mobile number, add your profile picture, and let us coordinate groceries, meal plans, and schedules together.',
    timestamp: new Date().toISOString(),
    type: 'text',
    deliveredTo: [],
    readBy: [],
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-init-1',
    type: 'gas_low',
    title: '⚠️ Automated Gas Alert: Kitchen Cylinder Low',
    message: 'Gas cylinder level dropped to 18%. Refill has been booked for Saturday delivery.',
    timestamp: 'Just now',
    isRead: false,
    priority: 'urgent',
    actionTab: 'gas',
  },
];

const FamilyContext = createContext<FamilyContextType | null>(null);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Members state
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  // Current logged in user (Admin Shaikh Hanif)
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) return JSON.parse(saved);
      return members.find((m) => m.role === 'admin') || members[0];
    } catch {
      return members[0];
    }
  });

  // Groceries state
  const [groceries, setGroceries] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GROCERIES);
      return saved ? JSON.parse(saved) : INITIAL_GROCERIES;
    } catch {
      return INITIAL_GROCERIES;
    }
  });

  // Meals state
  const [mealPlans, setMealPlans] = useState<DayMealPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEALS);
      return saved ? JSON.parse(saved) : getDaysForWeek();
    } catch {
      return getDaysForWeek();
    }
  });

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CALENDAR);
      return saved ? JSON.parse(saved) : INITIAL_CALENDAR;
    } catch {
      return INITIAL_CALENDAR;
    }
  });

  // Cylinders state
  const [cylinders, setCylinders] = useState<GasCylinder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CYLINDERS);
      return saved ? JSON.parse(saved) : INITIAL_CYLINDERS;
    } catch {
      return INITIAL_CYLINDERS;
    }
  });

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      return saved ? JSON.parse(saved) : INITIAL_CHAT;
    } catch {
      return INITIAL_CHAT;
    }
  });

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // In-app active toast banner
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Sync back to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GROCERIES, JSON.stringify(groceries));
  }, [groceries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEALS, JSON.stringify(mealPlans));
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CALENDAR, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CYLINDERS, JSON.stringify(cylinders));
  }, [cylinders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Read receipts auto-updater
  useEffect(() => {
    if (!currentUser || currentUser.status !== 'approved') return;

    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.senderId === currentUser.id) return msg;
        const alreadyRead = msg.readBy.some((r) => r.memberId === currentUser.id);
        if (alreadyRead) return msg;

        return {
          ...msg,
          readBy: [
            ...msg.readBy,
            {
              memberId: currentUser.id,
              memberName: currentUser.name,
              readAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
      })
    );
  }, [currentUser]);

  const currentRole: UserRole = currentUser?.role || 'member';
  const isAdmin = currentUser?.role === 'admin';

  const pendingMembers = useMemo(
    () => members.filter((m) => m.status === 'pending'),
    [members]
  );

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);

    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 6000);
  };

  const dismissToast = () => setActiveToast(null);

  const loginWithPhone = (
    phone: string,
    name?: string,
    relation?: string,
    avatar?: string
  ): { status: MemberStatus | 'new'; member: FamilyMember } => {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const existing = members.find((m) => m.phone.replace(/\D/g, '').endsWith(cleanDigits));

    if (existing) {
      // If photo was provided, update it
      if (avatar && avatar !== existing.avatar) {
        updateProfile(existing.id, { avatar });
      }
      setCurrentUser(existing);
      return { status: existing.status, member: existing };
    }

    // New member registration -> Status is pending approval!
    const newMember: FamilyMember = {
      id: `mem-${Date.now()}`,
      name: name || `Family Member (${cleanDigits.slice(-4)})`,
      phone: phone.startsWith('+') ? phone : `+91 ${cleanDigits}`,
      relation: relation || 'Family Member',
      avatar: avatar || '👤',
      color: '#0D9488',
      role: 'member',
      status: 'pending', // Awaiting Admin Approval
      permissions: {
        canManageGroceries: true,
        canEditMealPlan: false,
        canBookGas: false,
        canTraceLocations: false,
        canManageCalendar: true,
      },
      joinedAt: new Date().toISOString(),
      lastActive: 'Just now',
      location: {
        lat: 19.076,
        lng: 72.8777,
        address: 'Mumbai, Maharashtra',
        landmark: 'Home Vicinity',
        batteryLevel: 85,
        timestamp: 'Just now',
        statusMessage: 'Joined family group',
        isSharing: true,
      },
    };

    setMembers((prev) => [...prev, newMember]);
    setCurrentUser(newMember);

    // Send admin notification
    addNotification({
      type: 'member_approval_request',
      title: 'New Member Approval Request',
      message: `${newMember.name} (${newMember.phone}) has signed up and is waiting for your admin approval.`,
      priority: 'high',
      actorName: newMember.name,
      actionTab: 'admin',
    });

    return { status: 'pending', member: newMember };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (memberId: string) => {
    const found = members.find((m) => m.id === memberId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const updateProfile = (
    memberId: string,
    updates: { name?: string; relation?: string; avatar?: string; phone?: string }
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            name: updates.name || m.name,
            relation: updates.relation || m.relation,
            avatar: updates.avatar || m.avatar,
            phone: updates.phone || m.phone,
          };
        }
        return m;
      })
    );

    setCurrentUser((curr) => {
      if (curr && curr.id === memberId) {
        return {
          ...curr,
          name: updates.name || curr.name,
          relation: updates.relation || curr.relation,
          avatar: updates.avatar || curr.avatar,
          phone: updates.phone || curr.phone,
        };
      }
      return curr;
    });

    addNotification({
      type: 'chat_mention',
      title: 'Profile Updated',
      message: 'Profile picture and details updated successfully.',
      priority: 'normal',
    });
  };

  const addMemberDirectly = (memberData: {
    name: string;
    phone: string;
    relation: string;
    avatar: string;
    permissions?: Partial<MemberPermissions>;
  }): FamilyMember => {
    const defaultPerms: MemberPermissions = {
      canManageGroceries: true,
      canEditMealPlan: true,
      canBookGas: true,
      canTraceLocations: true,
      canManageCalendar: true,
      ...(memberData.permissions || {}),
    };

    const newMember: FamilyMember = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: memberData.name.trim(),
      phone: memberData.phone.trim(),
      relation: memberData.relation.trim(),
      avatar: memberData.avatar.trim() || '👤',
      color: '#6366F1',
      role: 'member',
      status: 'approved', // Pre-approved by Admin!
      permissions: defaultPerms,
      joinedAt: new Date().toISOString(),
      lastActive: 'Just now',
      location: {
        lat: 19.076,
        lng: 72.8777,
        address: 'Sector 4, Bandra West, Mumbai',
        landmark: 'Home Sweet Home',
        batteryLevel: 95,
        timestamp: 'Just now',
        statusMessage: 'Connected to FamilyNest',
        isSharing: true,
      },
    };

    setMembers((prev) => [...prev, newMember]);

    addNotification({
      type: 'member_approved',
      title: 'Family Member Added',
      message: `${newMember.name} (${newMember.relation}) was added to the family.`,
      priority: 'normal',
    });

    sendMessage(`👋 Welcome ${newMember.name} (${newMember.relation}) to our family hub!`, 'system');

    return newMember;
  };

  const removeMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member || member.role === 'admin') return;

    setMembers((prev) => prev.filter((m) => m.id !== memberId));

    if (currentUser?.id === memberId) {
      const admin = members.find((m) => m.role === 'admin');
      setCurrentUser(admin || null);
    }

    addNotification({
      type: 'member_rejected',
      title: 'Member Removed',
      message: `${member.name} was removed from the family hub.`,
      priority: 'low',
    });
  };

  const approveMember = (memberId: string, customPermissions?: Partial<MemberPermissions>) => {
    let approvedMemberName = '';
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          approvedMemberName = m.name;
          return {
            ...m,
            status: 'approved',
            permissions: {
              ...m.permissions,
              ...(customPermissions || {}),
            },
          };
        }
        return m;
      })
    );

    setCurrentUser((curr) => {
      if (curr && curr.id === memberId) {
        return {
          ...curr,
          status: 'approved',
          permissions: { ...curr.permissions, ...(customPermissions || {}) },
        };
      }
      return curr;
    });

    addNotification({
      type: 'member_approved',
      title: 'Family Member Approved',
      message: `${approvedMemberName} has been approved by Admin and welcomed to FamilyNest!`,
      priority: 'normal',
      actionTab: 'chat',
    });

    sendMessage(`👋 Welcome ${approvedMemberName} to our family hub! Approved by Admin.`, 'system');
  };

  const rejectMember = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: 'rejected' } : m))
    );
    addNotification({
      type: 'member_rejected',
      title: 'Member Request Declined',
      message: 'Access request was declined by admin.',
      priority: 'low',
    });
  };

  const updateMemberPermissions = (memberId: string, permissions: MemberPermissions) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, permissions } : m))
    );
    if (currentUser?.id === memberId) {
      setCurrentUser((curr) => (curr ? { ...curr, permissions } : null));
    }
  };

  const updateMemberLocation = (
    memberId: string,
    coords: { lat: number; lng: number; address?: string; landmark?: string },
    batteryLevel?: number
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            location: {
              ...m.location,
              lat: coords.lat,
              lng: coords.lng,
              address: coords.address || m.location.address,
              landmark: coords.landmark || m.location.landmark,
              batteryLevel: batteryLevel ?? m.location.batteryLevel,
              timestamp: 'Just now',
            },
          };
        }
        return m;
      })
    );
  };

  const toggleLocationSharing = (memberId: string, isSharing: boolean) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, location: { ...m.location, isSharing } } : m))
    );
  };

  // Groceries actions
  const addGroceryItem = (
    itemData: Omit<GroceryItem, 'id' | 'addedAt' | 'isBought' | 'addedByMemberId' | 'addedByName'>
  ) => {
    const newItem: GroceryItem = {
      ...itemData,
      id: `g-${Date.now()}`,
      addedAt: new Date().toISOString(),
      isBought: false,
      addedByMemberId: currentUser?.id || 'unknown',
      addedByName: currentUser?.name || 'Family Member',
    };

    setGroceries((prev) => [newItem, ...prev]);

    if (newItem.isUrgent) {
      addNotification({
        type: 'grocery_added',
        title: '🚨 Urgent Grocery Needed!',
        message: `${currentUser?.name} added "${newItem.name}" (${newItem.quantity}) as urgent.`,
        priority: 'high',
        actionTab: 'groceries',
      });
    }
  };

  const toggleGroceryBought = (itemId: string) => {
    setGroceries((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextBought = !item.isBought;
          return {
            ...item,
            isBought: nextBought,
            boughtByMemberId: nextBought ? currentUser?.id : undefined,
            boughtByName: nextBought ? currentUser?.name : undefined,
            boughtAt: nextBought ? new Date().toISOString() : undefined,
          };
        }
        return item;
      })
    );
  };

  const deleteGroceryItem = (itemId: string) => {
    setGroceries((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearBoughtGroceries = () => {
    setGroceries((prev) => prev.filter((item) => !item.isBought));
  };

  // Meals Actions
  const addMealToDay = (
    date: string,
    mealData: Omit<MealEntry, 'id' | 'addedAt' | 'addedByMemberId' | 'addedByName' | 'syncedToGrocery' | 'syncedToCalendar'>
  ) => {
    const newMeal: MealEntry = {
      ...mealData,
      id: `meal-${Date.now()}`,
      addedAt: new Date().toISOString(),
      addedByMemberId: currentUser?.id || 'unknown',
      addedByName: currentUser?.name || 'Family Member',
      ingredients: mealData.ingredients.length > 0 ? mealData.ingredients : getIngredientsForDish(mealData.dishName),
      syncedToGrocery: false,
      syncedToCalendar: false,
    };

    setMealPlans((prev) =>
      prev.map((day) => {
        if (day.date === date) {
          return { ...day, meals: [...day.meals, newMeal] };
        }
        return day;
      })
    );

    addNotification({
      type: 'meal_added',
      title: 'New Meal Dish Added',
      message: `${currentUser?.name} added "${newMeal.dishName}" to weekly meal plan.`,
      priority: 'normal',
      actionTab: 'meals',
    });
  };

  const deleteMealFromDay = (date: string, mealId: string) => {
    setMealPlans((prev) =>
      prev.map((day) => {
        if (day.date === date) {
          return { ...day, meals: day.meals.filter((m) => m.id !== mealId) };
        }
        return day;
      })
    );
  };

  const syncMealIngredientsToGrocery = (date: string, mealId: string) => {
    const targetDay = mealPlans.find((d) => d.date === date);
    if (!targetDay) return;
    const meal = targetDay.meals.find((m) => m.id === mealId);
    if (!meal) return;

    const newItems: GroceryItem[] = meal.ingredients.map((ingName, idx) => ({
      id: `g-sync-${mealId}-${idx}-${Date.now()}`,
      name: ingName,
      category: 'Produce',
      quantity: '1 portion',
      addedByMemberId: currentUser?.id || 'unknown',
      addedByName: currentUser?.name || 'Meal Planner',
      addedAt: new Date().toISOString(),
      isBought: false,
      isUrgent: false,
      mealPlanOrigin: `${targetDay.dayOfWeek} ${meal.type}: ${meal.dishName}`,
    }));

    setGroceries((prev) => [...newItems, ...prev]);

    setMealPlans((prev) =>
      prev.map((day) => {
        if (day.date === date) {
          return {
            ...day,
            meals: day.meals.map((m) => (m.id === mealId ? { ...m, syncedToGrocery: true } : m)),
          };
        }
        return day;
      })
    );

    addNotification({
      type: 'grocery_added',
      title: 'Meal Ingredients Synced to Grocery',
      message: `Added ${newItems.length} ingredients from "${meal.dishName}" to grocery list.`,
      priority: 'normal',
      actionTab: 'groceries',
    });
  };

  const syncMealToCalendar = (date: string, mealId: string) => {
    const targetDay = mealPlans.find((d) => d.date === date);
    if (!targetDay) return;
    const meal = targetDay.meals.find((m) => m.id === mealId);
    if (!meal) return;

    const calendarEvent = createMealCalendarEvent(
      meal,
      date,
      currentUser?.id || 'mem-admin',
      currentUser?.name || 'Family'
    );

    setCalendarEvents((prev) => [calendarEvent, ...prev]);

    setMealPlans((prev) =>
      prev.map((day) => {
        if (day.date === date) {
          return {
            ...day,
            meals: day.meals.map((m) => (m.id === mealId ? { ...m, syncedToCalendar: true } : m)),
          };
        }
        return day;
      })
    );

    addNotification({
      type: 'calendar_reminder',
      title: 'Meal Added to Shared Calendar',
      message: `"${meal.dishName}" scheduled on ${targetDay.dayOfWeek} ${calendarEvent.time}.`,
      priority: 'normal',
      actionTab: 'calendar',
    });
  };

  // Calendar actions
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdByMemberId' | 'createdByName'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
      createdByMemberId: currentUser?.id || 'unknown',
      createdByName: currentUser?.name || 'Family Member',
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);
    addNotification({
      type: 'calendar_reminder',
      title: 'New Calendar Event Scheduled',
      message: `"${newEvent.title}" on ${newEvent.date} at ${newEvent.time || 'All Day'}.`,
      priority: 'normal',
      actionTab: 'calendar',
    });
  };

  const deleteCalendarEvent = (eventId: string) => {
    setCalendarEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  const toggleCalendarEventCompleted = (eventId: string) => {
    setCalendarEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, isCompleted: !ev.isCompleted } : ev))
    );
  };

  // Gas Cylinder Actions
  const updateGasLevel = (cylinderId: string, newPercentage: number, notes?: string) => {
    let triggeredAlert = false;
    let cylinderName = '';
    const clamped = Math.max(0, Math.min(100, Math.round(newPercentage)));

    setCylinders((prev) =>
      prev.map((cyl) => {
        if (cyl.id === cylinderId) {
          cylinderName = cyl.name;
          const statusInfo = calculateGasStatus(clamped);
          triggeredAlert = shouldTriggerGasAlert(clamped, cyl.currentLevelPercentage);

          return {
            ...cyl,
            currentLevelPercentage: clamped,
            status: statusInfo.status,
            daysRemainingEstimate: statusInfo.daysRemaining,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: currentUser?.name || 'Family Member',
          };
        }
        return cyl;
      })
    );

    if (triggeredAlert || clamped <= 20) {
      const isZero = clamped === 0;
      const title = isZero
        ? `🚨 CRITICAL: ${cylinderName} IS EMPTY!`
        : `⚠️ Automated Alert: ${cylinderName} Gas Level at ${clamped}%`;
      const msg = isZero
        ? `${currentUser?.name} reported the gas cylinder is completely empty! Please plan refill booking immediately.`
        : `Gas cylinder level dropped to ${clamped}%. Only ~${Math.round((clamped / 100) * 35)} days remaining. Please plan refill together.`;

      addNotification({
        type: isZero ? 'gas_empty' : 'gas_low',
        title,
        message: msg,
        priority: 'urgent',
        actionTab: 'gas',
      });

      sendMessage(
        `${title}\n${msg} ${notes ? `(Note: ${notes})` : ''}`,
        'gas_alert',
        { gasLevel: clamped }
      );
    }
  };

  const markCylinderEmpty = (cylinderId: string) => {
    updateGasLevel(cylinderId, 0, 'Reported empty by family member');
  };

  const bookGasRefill = (
    cylinderId: string,
    bookingData: Omit<GasBookingRecord, 'id' | 'cylinderId' | 'bookedByMemberId' | 'bookedByName' | 'bookedDate'>
  ) => {
    const newBooking: GasBookingRecord = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      cylinderId,
      bookedByMemberId: currentUser?.id || 'unknown',
      bookedByName: currentUser?.name || 'Family Member',
      bookedDate: new Date().toISOString(),
    };

    setCylinders((prev) =>
      prev.map((cyl) => (cyl.id === cylinderId ? { ...cyl, booking: newBooking } : cyl))
    );

    addCalendarEvent({
      title: `🔥 ${bookingData.provider} Gas Cylinder Refill ETA`,
      description: `Refill booked by ${currentUser?.name}. Ref #${bookingData.bookingRef}. Delivery scheduled for ${bookingData.expectedDeliveryDate}.`,
      date: bookingData.expectedDeliveryDate,
      time: '11:00',
      category: 'gas_refill',
      assignedMemberIds: members.map((m) => m.id),
      location: 'Home Gate',
      reminderMinutesBefore: 120,
    });

    addNotification({
      type: 'gas_booked',
      title: 'Gas Refill Booked Successfully',
      message: `${currentUser?.name} booked ${bookingData.provider} refill (Ref: ${bookingData.bookingRef}). ETA: ${bookingData.expectedDeliveryDate}`,
      priority: 'high',
      actionTab: 'gas',
    });

    sendMessage(
      `✅ Gas Refill Booked! Provider: ${bookingData.provider}, Ref: #${bookingData.bookingRef}. Expected delivery on ${bookingData.expectedDeliveryDate}.`,
      'text'
    );
  };

  const confirmRefillDelivered = (cylinderId: string) => {
    setCylinders((prev) =>
      prev.map((cyl) => {
        if (cyl.id === cylinderId) {
          return {
            ...cyl,
            currentLevelPercentage: 100,
            status: 'full',
            daysRemainingEstimate: 35,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: currentUser?.name || 'Family Member',
            booking: undefined,
          };
        }
        return cyl;
      })
    );

    addNotification({
      type: 'gas_delivered',
      title: 'Gas Refill Delivered & Connected',
      message: `Fresh cylinder installed at 100% full level by ${currentUser?.name}.`,
      priority: 'normal',
      actionTab: 'gas',
    });

    sendMessage(
      `🎉 New Gas Cylinder has arrived and is connected! Tank is 100% Full.`,
      'text'
    );
  };

  // Chat actions
  const sendMessage = (
    text: string,
    type: ChatMessage['type'] = 'text',
    metadata?: ChatMessage['metadata']
  ) => {
    if (!currentUser) return;

    const recipientIds = members
      .filter((m) => m.id !== currentUser.id && m.status === 'approved')
      .map((m) => m.id);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderColor: currentUser.color,
      text,
      timestamp: new Date().toISOString(),
      type,
      deliveredTo: recipientIds,
      readBy: [],
      metadata,
    };

    setChatMessages((prev) => [...prev, newMsg]);
  };

  const markChatAsRead = (messageId: string) => {
    if (!currentUser) return;
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          if (msg.readBy.some((r) => r.memberId === currentUser.id)) return msg;
          return {
            ...msg,
            readBy: [
              ...msg.readBy,
              {
                memberId: currentUser.id,
                memberName: currentUser.name,
                readAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        }
        return msg;
      })
    );
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <FamilyContext.Provider
      value={{
        currentUser,
        currentRole,
        isAdmin,
        setCurrentUser,
        loginWithPhone,
        logout,
        switchUser,
        updateProfile,
        members,
        pendingMembers,
        approveMember,
        rejectMember,
        addMemberDirectly,
        removeMember,
        updateMemberPermissions,
        updateMemberLocation,
        toggleLocationSharing,
        groceries,
        addGroceryItem,
        toggleGroceryBought,
        deleteGroceryItem,
        clearBoughtGroceries,
        mealPlans,
        addMealToDay,
        deleteMealFromDay,
        syncMealIngredientsToGrocery,
        syncMealToCalendar,
        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarEventCompleted,
        cylinders,
        updateGasLevel,
        markCylinderEmpty,
        bookGasRefill,
        confirmRefillDelivered,
        chatMessages,
        sendMessage,
        markChatAsRead,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        clearAllNotifications,
        addNotification,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
