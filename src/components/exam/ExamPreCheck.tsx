import React, { useState } from 'react';
import { RouteVersion, DrivingCategory, TransmissionType, ExamMode, TechnicalQuestion } from '../../types';
import { ShieldCheck, Navigation, Volume2, CheckCircle2, HelpCircle, AlertTriangle, Play } from 'lucide-react';
import { getTechnicalQuestions } from '../../services/db';
import { AudioEngine } from '../../engine/AudioEngine';

interface ExamPreCheckProps {
  mode: ExamMode;
  routes: RouteVersion[];
  defaultRoute?: RouteVersion;
  onStartDriving: (
    selectedRoute: RouteVersion,
    techAnswers: { questionId: string; isCorrect: boolean }[]
  ) => void;
  onCancel: () => void;
}

export const ExamPreCheck: React.FC<ExamPreCheckProps> = ({
  mode,
  routes,
  defaultRoute,
  onStartDriving,
  onCancel,
}) => {
  const [step, setStep] = useState<'ROUTE' | 'SAFETY' | 'GPS' | 'AUDIO' | 'TECH' | 'READY'>('ROUTE');

  const activeRoutes = routes.filter((r) => r.status !== 'ARCHIVED');
  const [selectedRoute, setSelectedRoute] = useState<RouteVersion>(defaultRoute || activeRoutes[0] || routes[0]);
  const [category, setCategory] = useState<DrivingCategory>('B');
  const [transmission, setTransmission] = useState<TransmissionType>('MANUAL');

  // Technical Questions
  const allQuestions = getTechnicalQuestions();
  const [quizQuestions] = useState<TechnicalQuestion[]>(allQuestions.slice(0, 2));
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Audio test
  const [audioTested, setAudioTested] = useState(false);

  const handleTestAudio = () => {
    AudioEngine.playInstruction('START_EXAM');
    setAudioTested(true);
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: optionIdx });
  };

  const handleConfirmQuiz = () => {
    setQuizAnswered(true);
    setStep('READY');
  };

  const handleFinalStart = () => {
    const techAnswers = quizQuestions.map((q) => ({
      questionId: q.id,
      isCorrect: selectedAnswers[q.id] === q.correctOptionIndex,
    }));
    onStartDriving(selectedRoute, techAnswers);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            საგამოცდო მომზადება • {mode === 'LEARNING' ? 'სწავლა' : 'სიმულაცია'}
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {step === 'ROUTE' && '1. მარშრუტისა და პარამეტრების არჩევა'}
            {step === 'SAFETY' && '2. უსაფრთხოების წესები'}
            {step === 'GPS' && '3. GPS სიზუსტის შემოწმება'}
            {step === 'AUDIO' && '4. ხმოვანი ბრძანებების შემოწმება'}
            {step === 'TECH' && '5. ტექნიკური კითხვები'}
            {step === 'READY' && '6. მზადყოფნა დაწყებისთვის'}
          </h1>
        </div>
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
          გაუქმება
        </button>
      </div>

      {/* STEP 1: ROUTE & PARAMETERS */}
      {step === 'ROUTE' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">საგამოცდო მარშრუტი</label>
            <select
              value={selectedRoute.id}
              onChange={(e) => {
                const found = activeRoutes.find((r) => r.id === e.target.value);
                if (found) setSelectedRoute(found);
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white"
            >
              {activeRoutes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.city} — მარშრუტი #{r.routeNumber} ({r.instructions.length} ბრძანება)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">კატეგორია</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DrivingCategory)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="B">B (მსუბუქი ავტომობილი)</option>
                <option value="BE">BE (მისაბმელით)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ტრანსმისია</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="MANUAL">მექანიკური (Manual)</option>
                <option value="AUTOMATIC">ავტომატური (Automatic)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep('SAFETY')}
              className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
            >
              შემდეგი: უსაფრთხოება →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SAFETY NOTICE */}
      {step === 'SAFETY' && (
        <div className="space-y-5">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>უსაფრთხოება პირველია!</span>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
              თუ თქვენ უშუალოდ მართავთ ავტომობილს, მოძრაობის პროცესში არ შეეხოთ ტელეფონის ეკრანს! ტელეფონის მართვა და შეფასებების მონიშვნა უნდა განახორციელოს მხოლოდ გვერდით მყოფმა ინსტრუქტორმა/თანმხლებმა პირმა ან გამოიყენეთ მხოლოდ ხმოვანი ინსტრუქციები.
            </p>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button onClick={() => setStep('ROUTE')} className="text-xs font-bold text-slate-500">
              ← უკან
            </button>
            <button
              onClick={() => setStep('GPS')}
              className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-md"
            >
              გავიგე — GPS შემოწმება →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GPS CHECK */}
      {step === 'GPS' && (
        <div className="space-y-5 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
            <Navigation className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">GPS სიგნალი აქტიურია</h3>
            <p className="text-xs text-slate-500 mt-1">
              სიზუსტე: ~5 მეტრი (GOOD) • საგამოცდო ზონასთან სიახლოვე დადასტურებულია
            </p>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button onClick={() => setStep('SAFETY')} className="text-xs font-bold text-slate-500">
              ← უკან
            </button>
            <button
              onClick={() => setStep('AUDIO')}
              className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-md"
            >
              შემდეგი: ხმის შემოწმება →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AUDIO TEST */}
      {step === 'AUDIO' && (
        <div className="space-y-5 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <Volume2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ხმოვანი ბრძანებების შემოწმება</h3>
            <p className="text-xs text-slate-500 mt-1">დააჭირეთ ღილაკს სატესტო ხმოვანი ბრძანების მოსასმენად</p>
          </div>

          <button
            onClick={handleTestAudio}
            className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-md inline-flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            ხმის ტესტირება
          </button>

          {audioTested && <p className="text-xs font-bold text-emerald-600">✓ ხმა წარმატებით შემოწმდა</p>}

          <div className="pt-4 flex justify-between items-center">
            <button onClick={() => setStep('GPS')} className="text-xs font-bold text-slate-500">
              ← უკან
            </button>
            <button
              onClick={() => setStep('TECH')}
              className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-md"
            >
              შემდეგი: ტექნიკური კითხვები →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: TECHNICAL QUESTIONS */}
      {step === 'TECH' && (
        <div className="space-y-5">
          <div className="space-y-4">
            {quizQuestions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  კითხვა #{qIdx + 1}: {q.questionKa}
                </p>
                <div className="space-y-2">
                  {q.optionsKa.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button onClick={() => setStep('AUDIO')} className="text-xs font-bold text-slate-500">
              ← უკან
            </button>
            <button
              onClick={handleConfirmQuiz}
              disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
              className={`font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md ${
                Object.keys(selectedAnswers).length >= quizQuestions.length
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              პასუხების დადასტურება →
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: READY TO DRIVE */}
      {step === 'READY' && (
        <div className="space-y-5 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">ყველაფერი მზად არის!</h2>
            <p className="text-xs text-slate-500 mt-1">
              {selectedRoute.city} — მარშრუტი #{selectedRoute.routeNumber}
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleFinalStart}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-3 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              სიმულაციის დაწყება!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
