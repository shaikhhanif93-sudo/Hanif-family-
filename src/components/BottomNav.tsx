import React from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  Flame,
  Calendar,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigateTab }) => {
  const { groceries, cylinders, pendingMembers, isAdmin } = useFamily();

  const pendingGroceryCount = groceries.filter((g) => !g.isBought).length;
  const isGasLow = cylinders.some((c) => c.status === 'low' || c.status === 'empty');

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'groceries', label: 'Groceries', icon: ShoppingCart, badge: pendingGroceryCount > 0 ? pendingGroceryCount : undefined },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'gas', label: 'Gas Refill', icon: Flame, isAlert: isGasLow },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <>
      {/* Desktop Sub-navigation Header Tabs */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.isAlert && !isActive ? 'text-red-500 animate-bounce' : ''}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                      isActive ? 'bg-white text-blue-600' : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.isAlert && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => onNavigateTab('admin')}
              className={`ml-auto px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Admin Approvals</span>
              {pendingMembers.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
                  {pendingMembers.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${item.isAlert && !isActive ? 'text-red-500 animate-bounce' : ''}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center ring-1 ring-white">
                      {item.badge}
                    </span>
                  )}
                  {item.isAlert && !isActive && (
                    <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-1 ring-white animate-ping" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
