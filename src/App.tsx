import React, { useEffect, useState } from 'react';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ToastBanner } from './components/ToastBanner';
import { DashboardView } from './components/DashboardView';
import { GroceryView } from './components/GroceryView';
import { MealPlannerView } from './components/MealPlannerView';
import { GasTrackerView } from './components/GasTrackerView';
import { CalendarView } from './components/CalendarView';
import { LocationTracingView } from './components/LocationTracingView';
import { FamilyChatView } from './components/FamilyChatView';
import { AdminDrawer } from './components/AdminDrawer';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { AccountStatusScreen } from './components/AccountStatusScreen';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { FamilyMembersPanel } from './components/FamilyMembersPanel';
import { FamilyMember } from './types/family';

const MainAppContent: React.FC = () => {
  const { currentUser } = useFamily();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  // Signing out from the old menu button also signs out of Firebase
  useEffect(() => {
    if (!currentUser) {
      signOut();
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigateTab={setActiveTab} />;
      case 'groceries':
        return <GroceryView />;
      case 'meals':
        return <MealPlannerView onNavigateTab={setActiveTab} />;
      case 'gas':
        return <GasTrackerView />;
      case 'calendar':
        return <CalendarView />;
      case 'location':
        return <LocationTracingView />;
      case 'chat':
        return <FamilyChatView />;
      case 'admin':
        return (
          <div className="py-6">
            <FamilyMembersPanel />
            <AdminDrawer isOpen={true} onClose={() => setActiveTab('dashboard')} />
          </div>
        );
      default:
        return <DashboardView onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-500 selection:text-white pb-20 md:pb-8">
      {/* Real-time Notification Toast Banner */}
      <ToastBanner />

      {/* Top Header Navbar */}
      <Navbar onNavigateTab={setActiveTab} activeTab={activeTab} />

      {/* Sub-nav / Bottom Navigation */}
      <BottomNav activeTab={activeTab} onNavigateTab={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {renderActiveView()}
      </main>

      {/* Admin Drawer Modal if triggered */}
      {isAdminDrawerOpen && (
        <AdminDrawer
          isOpen={isAdminDrawerOpen}
          onClose={() => setIsAdminDrawerOpen(false)}
        />
      )}
    </div>
  );
};

const DEFAULT_PERMISSIONS = {
  canManageGroceries: true,
  canEditMealPlan: true,
  canBookGas: true,
  canTraceLocations: true,
  canManageCalendar: true,
};

const AppGate: React.FC = () => {
  const { authUser, profile, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!authUser) return <AuthScreen />;
  if (isSuperAdmin) return <SuperAdminPanel />;
  if (!profile) return <AccountStatusScreen kind="no-profile" />;
  if (profile.status === 'pending') return <AccountStatusScreen kind="pending" />;
  if (profile.status === 'rejected') return <AccountStatusScreen kind="rejected" />;

  const isHead = profile.role === 'head';
  const seedMember: FamilyMember = {
    id: profile.uid,
    name: profile.name,
    phone: profile.phone,
    relation: profile.relation || (isHead ? 'Family Head' : 'Family Member'),
    avatar: isHead ? '👨‍💼' : '👤',
    color: isHead ? '#2563EB' : '#0D9488',
    role: isHead ? 'admin' : 'member',
    status: 'approved',
    permissions: DEFAULT_PERMISSIONS,
    joinedAt: new Date().toISOString(),
    lastActive: 'Just now',
    location: {
      lat: 19.076,
      lng: 72.8777,
      address: 'Location not shared yet',
      landmark: 'Not shared',
      batteryLevel: 100,
      timestamp: 'Just now',
      isSharing: false,
    },
  };

  return (
    <FamilyProvider key={profile.uid} storageScope={profile.uid} seedMember={seedMember}>
      <MainAppContent />
    </FamilyProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
