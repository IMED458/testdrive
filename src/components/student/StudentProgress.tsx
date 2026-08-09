import React, { useState } from 'react';
import { StudentProfile, ExamSession } from '../../types';
import { TrendingUp, Award, CheckCircle, XCircle, Clock, Calendar, ArrowRight } from 'lucide-react';

interface StudentProgressProps {
  profile: StudentProfile;
  sessions: ExamSession[];
  onViewSessionReport: (session: ExamSession) => void;
}

export const StudentProgress: React.FC<StudentProgressProps> = ({
  profile,
  sessions,
  onViewSessionReport,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');

  const filteredSessions = sessions.filter((s) => {
    if (filterMode === 'PASS') return s.result === 'PASS';
    if (filterMode === 'FAIL') return s.result === 'FAIL';
    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          სტატისტიკა და პროგრესი
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          თქვენი ჩატარებული გამოცდების შედეგები, სუსტი მხარეები და შეცდომების ანალიზი
        </p>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">წარმატებული (PASS)</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{profile.totalPasses}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center font-bold">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">ჩაჭრილი (FAIL)</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{profile.totalFails}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">საერთო მართვის დრო</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{profile.totalDrivingMinutes} წთ</p>
          </div>
        </div>
      </div>

      {/* Error Breakdown Heatmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          შეცდომების გადანაწილება (Error Heatmap)
        </h2>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>სარკეში უყურადღებობა / Observation</span>
              <span className="text-amber-600">32%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '32%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>მოხვევის მაჩვენებელი (Indicator)</span>
              <span className="text-amber-600">24%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '24%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>STOP ნიშანთან გაჩერება</span>
              <span className="text-rose-600">20%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-rose-500 h-2 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>სავალ ნაწილზე განლაგება (Lane)</span>
              <span className="text-indigo-600">14%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '14%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Exam Sessions History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            გამოცდების ისტორია ({filteredSessions.length})
          </h2>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-md ${filterMode === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              ყველა
            </button>
            <button
              onClick={() => setFilterMode('PASS')}
              className={`px-2.5 py-1 rounded-md ${filterMode === 'PASS' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : ''}`}
            >
              PASS
            </button>
            <button
              onClick={() => setFilterMode('FAIL')}
              className={`px-2.5 py-1 rounded-md ${filterMode === 'FAIL' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : ''}`}
            >
              FAIL
            </button>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">ისტორია ცარიელია</p>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onViewSessionReport(session)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        session.result === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : session.result === 'FAIL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {session.result}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {session.city} — მარშრუტი #{session.routeNumber}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    ხანგრძლივობა: {Math.round(session.durationSeconds / 60)} წუთი • მსუბუქი: {session.lightErrorCount} • სერიოზული: {session.seriousErrorCount}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>რეპორტი</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
