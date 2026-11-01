import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhoneNumber,
  calculateGasStatus,
  shouldTriggerGasAlert,
  canPerformAction,
  getIngredientsForDish,
  createMealCalendarEvent,
  getReceiptSummary,
} from './familyLogic';
import { FamilyMember, ChatMessage, MealEntry } from '../types/family';

test('normalizePhoneNumber handles valid 10-digit mobile numbers', () => {
  const result = normalizePhoneNumber('9876543210');
  assert.equal(result.isValid, true);
  assert.equal(result.normalized, '+919876543210');
});

test('normalizePhoneNumber formats numbers with spaces and dashes', () => {
  const result = normalizePhoneNumber('+91 98765-43210');
  assert.equal(result.isValid, true);
  assert.equal(result.normalized, '+919876543210');
});

test('normalizePhoneNumber rejects too short numbers', () => {
  const result = normalizePhoneNumber('12345');
  assert.equal(result.isValid, false);
  assert.ok(result.error);
});

test('calculateGasStatus correctly categorizes gas levels', () => {
  assert.equal(calculateGasStatus(100).status, 'full');
  assert.equal(calculateGasStatus(45).status, 'medium');
  assert.equal(calculateGasStatus(15).status, 'low');
  assert.equal(calculateGasStatus(0).status, 'empty');
  assert.equal(calculateGasStatus(0).isUrgent, true);
  assert.equal(calculateGasStatus(15).isUrgent, true);
  assert.equal(calculateGasStatus(80).isUrgent, false);
});

test('shouldTriggerGasAlert triggers when crossing critical thresholds', () => {
  // Dropping to empty
  assert.equal(shouldTriggerGasAlert(0, 15), true);
  // Dropping to low
  assert.equal(shouldTriggerGasAlert(18, 25), true);
  // Regular decrease staying above low
  assert.equal(shouldTriggerGasAlert(50, 60), false);
  // Staying at 0
  assert.equal(shouldTriggerGasAlert(0, 0), false);
});

test('canPerformAction honors admin override and member approval status', () => {
  const adminMember: FamilyMember = {
    id: 'admin-1',
    name: 'Shaikh Hanif',
    phone: '+919876543210',
    relation: 'Father',
    avatar: '👨‍💼',
    color: '#3B82F6',
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
    lastActive: new Date().toISOString(),
    location: {
      lat: 19.076,
      lng: 72.8777,
      address: 'Bandra, Mumbai',
      landmark: 'Home',
      batteryLevel: 90,
      timestamp: new Date().toISOString(),
      isSharing: true,
    },
  };

  const pendingMember: FamilyMember = {
    ...adminMember,
    id: 'pending-1',
    role: 'member',
    status: 'pending',
  };

  const approvedMemberWithoutGasPerm: FamilyMember = {
    ...adminMember,
    id: 'member-1',
    role: 'member',
    status: 'approved',
    permissions: {
      canManageGroceries: true,
      canEditMealPlan: true,
      canBookGas: false,
      canTraceLocations: false,
      canManageCalendar: true,
    },
  };

  assert.equal(canPerformAction(adminMember, 'canBookGas'), true);
  assert.equal(canPerformAction(pendingMember, 'canManageGroceries'), false);
  assert.equal(canPerformAction(approvedMemberWithoutGasPerm, 'canBookGas'), false);
  assert.equal(canPerformAction(approvedMemberWithoutGasPerm, 'canManageGroceries'), true);
});

test('getIngredientsForDish extracts known recipe ingredients', () => {
  const ingredients = getIngredientsForDish('Dinner: Butter Chicken');
  assert.ok(ingredients.length > 2);
  assert.ok(ingredients.some((i) => i.toLowerCase().includes('chicken')));
});

test('createMealCalendarEvent produces proper event object', () => {
  const meal: MealEntry = {
    id: 'meal-101',
    type: 'dinner',
    dishName: 'Paneer Tikka',
    addedByMemberId: 'mem-1',
    addedByName: 'Fatima',
    addedAt: new Date().toISOString(),
    ingredients: ['Paneer', 'Capsicum'],
    syncedToGrocery: true,
    syncedToCalendar: false,
  };

  const event = createMealCalendarEvent(meal, '2026-10-30', 'mem-1', 'Fatima');
  assert.equal(event.title, 'Dinner: Paneer Tikka');
  assert.equal(event.time, '20:30');
  assert.equal(event.category, 'meal');
});

test('getReceiptSummary calculates delivered and read receipts', () => {
  const members: FamilyMember[] = [
    { id: '1', name: 'Hanif', status: 'approved' } as any,
    { id: '2', name: 'Fatima', status: 'approved' } as any,
    { id: '3', name: 'Ayaan', status: 'approved' } as any,
  ];

  const message: ChatMessage = {
    id: 'msg-1',
    senderId: '1',
    senderName: 'Hanif',
    senderAvatar: '👨‍💼',
    senderColor: '#3B82F6',
    text: 'Please check gas cylinder level',
    timestamp: '2026-10-29T10:00:00Z',
    type: 'text',
    deliveredTo: ['2', '3'],
    readBy: [{ memberId: '2', memberName: 'Fatima', readAt: '2026-10-29T10:02:00Z' }],
  };

  const receipt = getReceiptSummary(message, members, '1');
  assert.equal(receipt.isDeliveredToAll, true);
  assert.equal(receipt.totalRecipients, 2);
  assert.equal(receipt.readCount, 1);
  assert.deepEqual(receipt.readByNames, ['Fatima']);
  assert.deepEqual(receipt.pendingNames, ['Ayaan']);
});
