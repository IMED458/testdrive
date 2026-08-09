import React from 'react';
import { StudentProfile, User, RouteVersion, RoadWarning } from '../../types';
import {
  Play,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  studentProfile: StudentProfile;
  routes: RouteVersion[];
  roadWarnings: RoadWarning[];
  onStartExam: (mode: 'SELF_TEST' | 'LEARNING', route?: RouteVersion) => void;
  onViewRoutes: () => void;
  onViewProgress: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  studentProfile,
  routes,
  roadWarnings,
  onStartExam,
  onViewRoutes,
  onViewProgress,
}) => {
  const activeRoutes = routes.filter((r) => r.status !== 'ARCHIVED');
  const practicedCount = Math.min(activeRoutes.length, Math.round(studentProfile.totalSimulations / 3) + 1);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Award className="w-64 h-64" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 backdrop-blur border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ქალაქის გამოცდის სიმულატორი • {currentUser.preferredCity}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            გამარჯობა, {currentUser.firstName}!
          </h1>
          <p className="text-sm text-indigo-100 leading-relaxed">
            მოემზადე პრაქტიკული გამოცდისთვის რეალურ საგზაო მარშრუტებზე. მიიღე ხმოვანი ინსტრუქციები და გააანალიზე შენი შეცდომები.
          </p>

          {/* Main Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartExam('SELF_TEST')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              გამოცდის სიმულაციის დაწყება
            </button>

            <button
              onClick={() => onStartExam('LEARNING')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-5 py-3 rounded-xl backdrop-blur flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              მარშრუტის სწავლა
            </button>
          </div>
        </div>
      </div>

      {/* Preparation Score & Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">მომზადების ქულა</p>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {studentProfile.preparationScore}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">დაფუძნებულია ბოლო სიმულაციებზე</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg border border-indigo-100 dark:border-indigo-900">
            {studentProfile.preparationScore >= 70 ? 'Good' : 'Train'}
          </div>
        </div>

        {/* Total Simulations */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ჩატარებული სიმულაციები</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {studentProfile.totalSimulations}
            </p>
            <span className="text-xs font-semibold text-emerald-600">
              {studentProfile.totalPasses} PASS / {studentProfile.totalFails} FAIL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">სულ {studentProfile.totalDrivingMinutes} წუთი მართვა</p>
        </div>

        {/* Frequent Mistake */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ხშირი შეცდომა</p>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 line-clamp-1">
            {studentProfile.frequentMistakes[0] || 'სარკეში უყურადღებობა'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">საჭიროებს განსაკუთრებულ ყურადღებას</p>
        </div>

        {/* Route Coverage */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">მარშრუტების დაფარვა ({currentUser.preferredCity})</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {practicedCount} / {activeRoutes.length}
            </p>
            <span className="text-xs font-bold text-indigo-600">
              {Math.round((practicedCount / activeRoutes.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${(practicedCount / activeRoutes.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Road Warnings Banner */}
      {roadWarnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
              მიმდინარე საგზაო შეტყობინება ({roadWarnings[0].city})
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {roadWarnings[0].locationName}: {roadWarnings[0].warningText}
            </p>
          </div>
        </div>
      )}

      {/* Route List Preview & Recommendation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentUser.preferredCity}-ის საგამოცდო მარშრუტები
            </h2>
            <p className="text-xs text-slate-500">ოფიციალური მარშრუტები და მათი სტატუსი</p>
          </div>
          <button
            onClick={onViewRoutes}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            ყველას ნახვა <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recommended Route Badge */}
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">
              რეკომენდებული შემდეგი ვარჯიში: <b>მარშრუტი #3 (თელავი)</b>
            </span>
          </div>
          <button
            onClick={() => onStartExam('SELF_TEST', activeRoutes[2] || activeRoutes[0])}
            className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-700"
          >
            დაწყება
          </button>
        </div>

        {/* Route Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeRoutes.slice(0, 4).map((route) => (
            <div
              key={route.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    მარშრუტი #{route.routeNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      route.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {route.status === 'ACTIVE' ? 'აქტიური' : 'საგზაო სამუშაო'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ვერსია: {route.versionDate} • შემოწმებული: {route.lastVerifiedDate}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStartExam('LEARNING', route)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  სწავლა
                </button>
                <button
                  onClick={() => onStartExam('SELF_TEST', route)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  ტესტი
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
