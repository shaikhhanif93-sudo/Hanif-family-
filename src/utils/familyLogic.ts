import {
  GasLevelStatus,
  FamilyMember,
  MemberPermissions,
  ChatMessage,
  MealEntry,
  CalendarEvent,
  GroceryCategory,
} from '../types/family';

/**
 * Normalizes phone number: strips non-digit characters except leading +,
 * and ensures standard format (e.g., +91 98765 43210 or 10 digits).
 */
export function normalizePhoneNumber(raw: string): {
  isValid: boolean;
  normalized: string;
  formatted: string;
  error?: string;
} {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, normalized: '', formatted: '', error: 'Phone number cannot be empty' };
  }

  const clean = raw.trim().replace(/[\s\-()]/g, '');
  const digitsOnly = clean.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      normalized: clean,
      formatted: raw,
      error: 'Please enter a valid 10-digit mobile number',
    };
  }

  // Last 10 digits as base number
  const last10 = digitsOnly.slice(-10);
  const countryCode = clean.startsWith('+')
    ? clean.slice(0, clean.length - 10)
    : '+91';

  const normalized = `${countryCode.startsWith('+') ? countryCode : '+' + countryCode}${last10}`;
  const formatted = `${countryCode} ${last10.slice(0, 5)} ${last10.slice(5)}`;

  return {
    isValid: true,
    normalized,
    formatted,
  };
}

/**
 * Evaluates gas cylinder status based on percentage level.
 */
export function calculateGasStatus(percentage: number): {
  status: GasLevelStatus;
  daysRemaining: number;
  label: string;
  isUrgent: boolean;
} {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  // Average household cylinder lasts ~30-40 days. Let's use 35 days full
  const daysRemaining = Math.max(0, Math.round((clamped / 100) * 35));

  if (clamped <= 0) {
    return {
      status: 'empty',
      daysRemaining: 0,
      label: 'Cylinder is Empty!',
      isUrgent: true,
    };
  }

  if (clamped <= 20) {
    return {
      status: 'low',
      daysRemaining,
      label: 'Critical - Low Gas',
      isUrgent: true,
    };
  }

  if (clamped <= 50) {
    return {
      status: 'medium',
      daysRemaining,
      label: 'Half Level',
      isUrgent: false,
    };
  }

  return {
    status: 'full',
    daysRemaining,
    label: 'Adequate Gas',
    isUrgent: false,
  };
}

/**
 * Checks whether an automated alert broadcast should be triggered when gas drops.
 */
export function shouldTriggerGasAlert(newLevel: number, previousLevel: number): boolean {
  if (newLevel <= 0 && previousLevel > 0) return true;
  if (newLevel <= 20 && previousLevel > 20) return true;
  return false;
}

/**
 * Checks user action authorization. Admins have global permission.
 * Members require an 'approved' status and the respective flag enabled.
 */
export function canPerformAction(
  member: FamilyMember | null | undefined,
  permissionKey: keyof MemberPermissions
): boolean {
  if (!member) return false;
  if (member.role === 'admin') return true;
  if (member.status !== 'approved') return false;
  return Boolean(member.permissions[permissionKey]);
}

/**
 * Common recipes ingredients library for smart auto-population
 */
export const COMMON_RECIPE_INGREDIENTS: Record<string, { category: GroceryCategory; items: string[] }> = {
  'butter chicken': {
    category: 'Meat & Fish',
    items: ['Chicken 500g', 'Butter 100g', 'Fresh Cream', 'Tomato Puree', 'Kasuri Methi', 'Ginger Garlic Paste'],
  },
  'paneer tikka': {
    category: 'Dairy & Eggs',
    items: ['Paneer 300g', 'Capsicum 2 pcs', 'Onions 2 pcs', 'Curd/Yogurt 200g', 'Tikka Masala'],
  },
  'dal makhani': {
    category: 'Pantry & Spices',
    items: ['Black Urad Dal 250g', 'Kidney Beans (Rajma)', 'Butter 50g', 'Cream', 'Tomatoes 3 pcs'],
  },
  'biryani': {
    category: 'Grains & Bakery',
    items: ['Basmati Rice 1kg', 'Biryani Spices', 'Fried Onions (Birista)', 'Mint & Coriander leaves', 'Yogurt'],
  },
  'poha': {
    category: 'Grains & Bakery',
    items: ['Thick Poha 250g', 'Peanuts 50g', 'Curry Leaves', 'Mustard Seeds', 'Green Chillies', 'Lemon'],
  },
  'aloo paratha': {
    category: 'Produce',
    items: ['Potatoes 500g', 'Wheat Flour (Atta)', 'Green Chillies', 'Butter', 'Coriander leaves'],
  },
  'pasta': {
    category: 'Pantry & Spices',
    items: ['Penne/Fusilli Pasta 500g', 'Pasta Sauce', 'Olive Oil', 'Garlic', 'Cheese Block'],
  },
  'idli sambar': {
    category: 'Produce',
    items: ['Idli Batter 1kg', 'Toor Dal 200g', 'Drumsticks', 'Sambar Powder', 'Small Sambar Onions'],
  },
};

/**
 * Extracts ingredients for a dish, either looking up common recipes or splitting custom text
 */
export function getIngredientsForDish(dishName: string, explicitList?: string[]): string[] {
  if (explicitList && explicitList.length > 0) {
    return explicitList.filter((item) => item.trim().length > 0);
  }

  const normalized = dishName.toLowerCase().trim();
  for (const [recipe, data] of Object.entries(COMMON_RECIPE_INGREDIENTS)) {
    if (normalized.includes(recipe)) {
      return data.items;
    }
  }

  // Default basic pantry items if custom dish without specific recipe
  return [`${dishName} Ingredients`, 'Fresh Veggies/Produce', 'Cooking Oil / Ghee'];
}

/**
 * Creates calendar event from a planned meal
 */
export function createMealCalendarEvent(
  meal: MealEntry,
  date: string,
  familyMemberId: string,
  familyMemberName: string
): CalendarEvent {
  const timeMap = {
    breakfast: '08:30',
    lunch: '13:00',
    dinner: '20:30',
    snacks: '17:00',
  };

  const titlePrefix = meal.type.charAt(0).toUpperCase() + meal.type.slice(1);

  return {
    id: `event-meal-${meal.id}`,
    title: `${titlePrefix}: ${meal.dishName}`,
    description: `Planned by ${meal.addedByName}. Ingredients: ${meal.ingredients.join(', ')}`,
    date,
    time: timeMap[meal.type] || '12:00',
    category: 'meal',
    assignedMemberIds: [familyMemberId],
    createdByMemberId: familyMemberId,
    createdByName: familyMemberName,
    reminderMinutesBefore: 60,
  };
}

/**
 * Formats chat message receipt status
 */
export function getReceiptSummary(
  message: ChatMessage,
  allActiveMembers: FamilyMember[],
  currentUserId: string
): {
  isDeliveredToAll: boolean;
  deliveredCount: number;
  readCount: number;
  totalRecipients: number;
  readByNames: string[];
  pendingNames: string[];
} {
  const otherMembers = allActiveMembers.filter(
    (m) => m.id !== message.senderId && m.status === 'approved'
  );
  const totalRecipients = otherMembers.length;

  const readMemberIds = new Set(message.readBy.map((r) => r.memberId));
  const readByMembers = otherMembers.filter((m) => readMemberIds.has(m.id));
  const pendingMembers = otherMembers.filter((m) => !readMemberIds.has(m.id));

  const isDeliveredToAll = message.deliveredTo.length >= totalRecipients;

  return {
    isDeliveredToAll,
    deliveredCount: message.deliveredTo.length,
    readCount: readByMembers.length,
    totalRecipients,
    readByNames: readByMembers.map((m) => m.name),
    pendingNames: pendingMembers.map((m) => m.name),
  };
}
