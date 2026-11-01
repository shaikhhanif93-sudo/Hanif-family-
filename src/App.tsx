import React, { useState } from 'react';
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
import { AuthModal } from './components/AuthModal';

const MainAppContent: React.FC = () => {
  const { currentUser } = useFamily();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  // If user is not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <AuthModal isOpen={true} onClose={() => {}} />
      </div>
    );
  }

  // If user is pending approval
  if (currentUser.status === 'pending') {
    return <PendingApprovalScreen />;
  }

  // If user is rejected
  if (currentUser.status === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-xl border border-red-200">
          <div className="text-4xl mb-3">⛔</div>
          <h2 className="text-xl font-bold text-red-600">Access Declined</h2>
          <p className="text-xs text-slate-500 mt-2">
            Your login request was declined by the Family Admin. Please contact Shaikh Hanif.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Try Again / Switch User
          </button>
        </div>
      </div>
    );
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
            <AdminDrawer isOpen={true} onClose={() => setActiveTab('dashboard')} />
            <DashboardView onNavigateTab={setActiveTab} />
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

export default function App() {
  return (
    <FamilyProvider>
      <MainAppContent />
    </FamilyProvider>
  );
}
