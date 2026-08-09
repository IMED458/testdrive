import React from 'react';
import { User, UserRole } from '../../types';
import { ShieldCheck, Car, UserCheck, Settings, AlertTriangle, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  onOpenDisclaimer: () => void;
  onLogout?: () => void;
  activeCity: string;
  onCityChange: (city: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  onOpenDisclaimer,
  onLogout,
  activeCity,
  onCityChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Simulator Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                მართვის გამოცდა
              </span>
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-300/40">
                სიმულატორი
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              ქალაქში მართვის პრაქტიკული გამოცდის მოსამზადებელი პლატფორმა
            </p>
          </div>
        </div>

        {/* City Selector & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* City Selector */}
          <select
            value={activeCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Telavi">თელავი (5 მარშრუტი)</option>
            <option value="Rustavi">რუსთავი (8 მარშრუტი)</option>
            <option value="Tbilisi">თბილისი (გლდანი)</option>
            <option value="Kutaisi">ქუთაისი</option>
            <option value="Batumi">ბათუმი</option>
          </select>

          {/* როლის გადამრთველი — მხოლოდ ადმინისთვის.
              ჩვეულებრივი მომხმარებელი როლს თავად ვერ იცვლის. */}
          {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center text-xs font-semibold">
            <button
              onClick={() => onRoleChange('STUDENT')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currentUser.role === 'STUDENT'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              მოსწავლე
            </button>
            <button
              onClick={() => onRoleChange('INSTRUCTOR')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currentUser.role === 'INSTRUCTOR'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ინსტრუქტორი
            </button>
            <button
              onClick={() => onRoleChange('ADMIN')}
              className={`px-2.5 py-1 rounded-md transition-all hidden md:block ${
                currentUser.role === 'ADMIN'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ადმინი
            </button>
          </div>
          )}

          {/* Disclaimer Button */}
          <button
            onClick={onOpenDisclaimer}
            title="გაფრთხილება და პირობები"
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="გასვლა"
              aria-label="ანგარიშიდან გასვლა"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
