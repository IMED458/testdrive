import React, { useState } from 'react';
import { ExamSession } from '../../types';
import { RouteMap } from '../map/RouteMap';
import { getRoutes } from '../../services/db';
import { CheckCircle2, XCircle, Clock, MapPin, Award, Share2, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ExamReportViewProps {
  session: ExamSession;
  onDone: () => void;
}

export const ExamReportView: React.FC<ExamReportViewProps> = ({ session, onDone }) => {
  const allRoutes = getRoutes();
  const route = allRoutes.find((r) => r.id === session.routeVersionId) || allRoutes[0];

  const isPass = session.result === 'PASS';

  const [whatWentWell, setWhatWentWell] = useState<string[]>(session.whatWentWell || []);
  const [needsImprovement, setNeedsImprovement] = useState<string[]>(session.needsImprovement || []);

  const wellOptions = ['სიჩქარის კონტროლი', 'პარკირება', 'ზოლში განლაგება', 'სარკეებში დაკვირვება', 'ციმციმის გამოყენება'];
  const improveOptions = ['STOP ნიშანთან გაჩერება', 'მკვდარი ზონის შემოწმება', 'დათმობის უპირატესობა', 'აღმართზე დაძვრა'];

  const toggleWell = (opt: string) => {
    setWhatWentWell((prev) => (prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt]));
  };

  const toggleImprove = (opt: string) => {
    setNeedsImprovement((prev) => (prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt]));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header Result Banner */}
      <div
        className={`p-6 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 ${
          isPass
            ? 'bg-gradient-to-r from-emerald-800 to-teal-900'
            : 'bg-gradient-to-r from-rose-900 to-slate-900'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-black text-2xl">
            {isPass ? <CheckCircle2 className="w-10 h-10 text-emerald-400" /> : <XCircle className="w-10 h-10 text-rose-400" />}
          </div>
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
              საგამოცდო შედეგი • {session.city} მარშრუტი #{session.routeNumber}
            </span>
            <h1 className="text-3xl font-extrabold">{isPass ? 'PASS (ჩაბარებულია)' : 'FAIL (ვერ ჩაბარდა)'}</h1>
            <p className="text-xs text-white/80 mt-1">
              ხანგრძლივობა: {Math.round(session.durationSeconds / 60)} წუთი • მოდელი: {session.mode}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5"
        >
          <Share2 className="w-4 h-4" /> გაზიარება / PDF
        </button>
      </div>

      {/* Error Breakdown Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-2xl font-black text-amber-600">{session.lightErrorCount}</p>
          <p className="text-xs text-slate-500 font-semibold">მსუბუქი შეცდომა</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-2xl font-black text-rose-600">{session.seriousErrorCount}</p>
          <p className="text-xs text-slate-500 font-semibold">სერიოზული შეცდომა</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-2xl font-black text-rose-800">{session.disqualifyingErrorCount}</p>
          <p className="text-xs text-slate-500 font-semibold">დისკვალიფიკაცია</p>
        </div>
      </div>

      {/* Map Replay View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          გავლილი გზის რუკა (Map Replay)
        </h2>
        <RouteMap route={route} height="320px" showPolyline={true} />
      </div>

      {/* Chronological Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          მოვლენების და შეცდომების ქრონოლოგია
        </h2>

        <div className="space-y-2">
          {session.errorEvents.length === 0 ? (
            <p className="text-xs text-emerald-600 font-bold py-4 text-center">
              ✓ შეცდომები არ დაფიქსირებულა! იდეალური მართვა!
            </p>
          ) : (
            session.errorEvents.map((err) => (
              <div
                key={err.id}
                className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">
                    {Math.floor(err.elapsedSeconds / 60)}:{Math.floor(err.elapsedSeconds % 60).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{err.ruleNameKa}</span>
                    <span className="text-[10px] text-slate-400 block">{err.ruleCode}</span>
                  </div>
                </div>

                <span
                  className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                    err.severity === 'LIGHT'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {err.severity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* What Went Well / Needs Improvement Interactive Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Well */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
            <ThumbsUp className="w-4 h-4" /> რა გაკეთდა კარგად
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {wellOptions.map((opt) => {
              const selected = whatWentWell.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleWell(opt)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    selected
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Needs Improvement */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase">
            <ThumbsDown className="w-4 h-4" /> გასაუმჯობესებელია
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {improveOptions.map((opt) => {
              const selected = needsImprovement.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleImprove(opt)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    selected
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Done CTA */}
      <div className="pt-4 text-center">
        <button
          onClick={onDone}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/20"
        >
          შედეგის შენახვა და დაბრუნება
        </button>
      </div>
    </div>
  );
};
