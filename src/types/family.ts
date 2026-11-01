export type UserRole = 'admin' | 'member';
export type MemberStatus = 'approved' | 'pending' | 'rejected';

export interface MemberPermissions {
  canManageGroceries: boolean;
  canEditMealPlan: boolean;
  canBookGas: boolean;
  canTraceLocations: boolean;
  canManageCalendar: boolean;
}

export interface MemberLocation {
  lat: number;
  lng: number;
  address: string;
  landmark: string;
  batteryLevel: number;
  isCharging?: boolean;
  timestamp: string;
  statusMessage?: string;
  isSharing: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relation: string; // e.g., 'Father', 'Mother', 'Son', 'Daughter', 'Grandma'
  avatar: string; // emoji or URL
  color: string;
  role: UserRole;
  status: MemberStatus;
  permissions: MemberPermissions;
  joinedAt: string;
  lastActive: string;
  location: MemberLocation;
  deviceInfo?: string;
}

export type GroceryCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Pantry & Spices'
  | 'Grains & Bakery'
  | 'Meat & Fish'
  | 'Household & Care'
  | 'Snacks & Drinks'
  | 'Other';

export interface GroceryItem {
  id: string;
  name: string;
  category: GroceryCategory;
  quantity: string;
  addedByMemberId: string;
  addedByName: string;
  addedAt: string;
  isBought: boolean;
  boughtByMemberId?: string;
  boughtByName?: string;
  boughtAt?: string;
  isUrgent: boolean;
  notes?: string;
  mealPlanOrigin?: string; // e.g. "From Friday Dinner: Paneer Tikka"
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface MealEntry {
  id: string;
  type: MealType;
  dishName: string;
  notes?: string;
  addedByMemberId: string;
  addedByName: string;
  addedAt: string;
  ingredients: string[];
  syncedToGrocery: boolean;
  syncedToCalendar: boolean;
}

export interface DayMealPlan {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 'Monday', 'Tuesday', ...
  meals: MealEntry[];
}

export type CalendarEventCategory =
  | 'family'
  | 'meal'
  | 'gas_refill'
  | 'grocery_trip'
  | 'school_work'
  | 'doctor_health'
  | 'reminder';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  category: CalendarEventCategory;
  assignedMemberIds: string[];
  createdByMemberId: string;
  createdByName: string;
  location?: string;
  reminderMinutesBefore?: number;
  isCompleted?: boolean;
}

export type GasLevelStatus = 'full' | 'medium' | 'low' | 'empty';

export interface GasBookingRecord {
  id: string;
  cylinderId: string;
  bookingRef: string;
  provider: 'Indane' | 'HP Gas' | 'Bharat Gas' | 'Super Gas' | 'Other';
  bookedByMemberId: string;
  bookedByName: string;
  bookedDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  cost?: number;
  status: 'booked' | 'dispatched' | 'out_for_delivery' | 'delivered';
  notes?: string;
}

export interface GasCylinder {
  id: string;
  name: string; // e.g. "Kitchen Stove Cylinder #1"
  capacityKg: number; // e.g. 14.2
  currentLevelPercentage: number; // 0 to 100
  status: GasLevelStatus;
  lastUpdated: string;
  lastUpdatedBy: string;
  daysRemainingEstimate: number;
  booking?: GasBookingRecord;
}

export interface ReadReceipt {
  memberId: string;
  memberName: string;
  readAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor: string;
  text: string;
  timestamp: string;
  type: 'text' | 'gas_alert' | 'grocery_alert' | 'meal_alert' | 'location_share' | 'system';
  deliveredTo: string[]; // member IDs
  readBy: ReadReceipt[];
  metadata?: {
    gasLevel?: number;
    groceryItemName?: string;
    dishName?: string;
    locationData?: {
      lat: number;
      lng: number;
      landmark: string;
    };
  };
}

export type NotificationType =
  | 'gas_empty'
  | 'gas_low'
  | 'gas_booked'
  | 'gas_delivered'
  | 'member_approval_request'
  | 'member_approved'
  | 'member_rejected'
  | 'grocery_added'
  | 'meal_added'
  | 'chat_mention'
  | 'calendar_reminder';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actorName?: string;
  targetMemberId?: string;
  actionTab?: 'groceries' | 'meals' | 'calendar' | 'gas' | 'chat' | 'admin' | 'location';
}
