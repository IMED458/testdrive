import React from 'react';
import { InstructorProfile, StudentProfile, ExamSession } from '../../types';
import { Users, UserPlus, Play, History, CheckCircle, Clock } from 'lucide-react';

interface InstructorDashboardProps {
  instructor: InstructorProfile;
  students: StudentProfile[];
  recentSessions: ExamSession[];
  onAddStudent: () => void;
  onStartSimulation: () => void;
  onSelectStudent: (student: StudentProfile) => void;
  onViewHistory: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  instructor,
  students,
  recentSessions,
  onAddStudent,
  onStartSimulation,
  onSelectStudent,
  onViewHistory,
}) => {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome & Instructor Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              ინსტრუქტორის მართვის პანელი • {instructor.mainCity}
            </span>
            <h1 className="text-2xl font-bold mt-2">ინსტრუქტორის სიმულატორი</h1>
            <p className="text-xs text-slate-300 mt-1">
              მართე მოსწავლეების გაკვეთილები, შეაფასე საგამოცდო მანევრები რეალურ დროში და გააანალიზე პროგრესი
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onStartSimulation}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              გაკვეთილის / სიმულაციის დაწყება
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onAddStudent}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">ახალი მოსწავლე</p>
          <p className="text-[10px] text-slate-400">მოსწავლის დამატება CRM-ში</p>
        </button>

        <button
          onClick={onStartSimulation}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">სიმულაცია</p>
          <p className="text-[10px] text-slate-400">რეალურ დროში შეფასება</p>
        </button>

        <button
          onClick={onViewHistory}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">ისტორია</p>
          <p className="text-[10px] text-slate-400">ჩატარებული გაკვეთილები</p>
        </button>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">აქტიური მოსწავლეები</p>
          <p className="text-[10px] text-slate-400">{students.length} მოსწავლე</p>
        </div>
      </div>

      {/* Active Students List Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">მოსწავლეების სია</h2>
          <span className="text-xs text-indigo-600 font-bold">{students.length} სულ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {students.map((st) => (
            <div
              key={st.id}
              onClick={() => onSelectStudent(st)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">გიორგი მაისურაძე</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  კატეგორია {st.category} ({st.transmission}) • {st.totalDrivingMinutes} წუთი მართვა
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-indigo-600">{st.preparationScore}%</span>
                <p className="text-[10px] text-slate-400">ქულა</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
