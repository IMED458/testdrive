import React from 'react';
import { UserRole } from '../../types';
import {
  Home,
  MapPin,
  Play,
  TrendingUp,
  User,
  Users,
  History,
  Shield,
  FileCheck,
} from 'lucide-react';

interface BottomNavProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ role, activeTab, onTabChange }) => {
  let navItems: { id: string; label: string; icon: React.ReactNode }[] = [];

  if (role === 'STUDENT') {
    navItems = [
      { id: 'dashboard', label: 'მთავარი', icon: <Home className="w-5 h-5" /> },
      { id: 'routes', label: 'მარშრუტები', icon: <MapPin className="w-5 h-5" /> },
      { id: 'practice', label: 'სიმულაცია', icon: <Play className="w-5 h-5" /> },
      { id: 'progress', label: 'პროგრესი', icon: <TrendingUp className="w-5 h-5" /> },
      { id: 'profile', label: 'პროფილი', icon: <User className="w-5 h-5" /> },
    ];
  } else if (role === 'INSTRUCTOR') {
    navItems = [
      { id: 'dashboard', label: 'მთავარი', icon: <Home className="w-5 h-5" /> },
      { id: 'students', label: 'მოსწავლეები', icon: <Users className="w-5 h-5" /> },
      { id: 'start_lesson', label: 'გაკვეთილი', icon: <Play className="w-5 h-5" /> },
      { id: 'history', label: 'ისტორია', icon: <History className="w-5 h-5" /> },
      { id: 'profile', label: 'პროფილი', icon: <User className="w-5 h-5" /> },
    ];
  } else {
    // ADMIN
    navItems = [
      { id: 'dashboard', label: 'მართვა', icon: <Home className="w-5 h-5" /> },
      { id: 'routes_admin', label: 'მარშრუტები', icon: <MapPin className="w-5 h-5" /> },
      { id: 'rules_admin', label: 'წესები', icon: <Shield className="w-5 h-5" /> },
      { id: 'audit_logs', label: 'აუდიტი', icon: <FileCheck className="w-5 h-5" /> },
    ];
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
              }`}
            >
              <div className={isActive ? 'scale-110 transition-transform' : ''}>{item.icon}</div>
              <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
