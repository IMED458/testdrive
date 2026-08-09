import React, { useState } from 'react';
import { ExamEngine } from '../../engine/ExamEngine';
import { ManeuverType, ErrorSeverity } from '../../types';
import {
  AlertOctagon,
  RotateCcw,
  PlusCircle,
  CheckCircle,
  XCircle,
  Volume2,
  StopCircle,
  ShieldAlert,
} from 'lucide-react';
import { AudioEngine } from '../../engine/AudioEngine';

interface InstructorLiveViewProps {
  examEngine: ExamEngine;
  onFinishExam: () => void;
}

export const InstructorLiveView: React.FC<InstructorLiveViewProps> = ({
  examEngine,
  onFinishExam,
}) => {
  const session = examEngine.getSession();
  const routeEngine = examEngine.getRouteEngine();
  const routeState = routeEngine.getState();

  const [showQuickErrorModal, setShowQuickErrorModal] = useState(false);
  const [showUndoBanner, setShowUndoBanner] = useState(false);
  const [lastActionText, setLastActionText] = useState('');

  // Active Maneuver State for Evaluation Card
  const activeManeuver: ManeuverType = routeState.activeManeuver || 'GENERAL_OBSERVATION';

  const [mirror, setMirror] = useState<boolean | null>(null);
  const [indicator, setIndicator] = useState<boolean | null>(null);
  const [blindSpot, setBlindSpot] = useState<boolean | null>(null);
  const [stopSign, setStopSign] = useState<boolean | null>(null);

  const handleRecordManeuverEval = (isPositive: boolean) => {
    examEngine.addInstructorEvaluation({
      maneuverType: activeManeuver,
      mirrorChecked: mirror ?? true,
      blindSpotChecked: blindSpot ?? true,
      indicatorUsed: indicator ?? true,
      indicatorTimely: true,
      lanePositionCorrect: true,
      speedAppropriate: true,
      priorityRespected: isPositive,
      stoppedAtStopSign: stopSign ?? true,
    });

    setLastActionText(`მანევრი (${activeManeuver}) შეფასდა`);
    setShowUndoBanner(true);
    setTimeout(() => setShowUndoBanner(false), 8000);

    // Reset card inputs
    setMirror(null);
    setIndicator(null);
    setBlindSpot(null);
    setStopSign(null);
  };

  const handleAddQuickError = (code: string, nameKa: string, severity: ErrorSeverity) => {
    examEngine.addError('rule-' + code, code, nameKa, severity, 'INSTRUCTOR', activeManeuver);
    setShowQuickErrorModal(false);

    setLastActionText(`შეცდომა დაფიქსირდა: ${nameKa}`);
    setShowUndoBanner(true);
    setTimeout(() => setShowUndoBanner(false), 8000);
  };

  const handleUndo = () => {
    const undone = examEngine.undoLastError();
    if (undone) {
      setLastActionText('ბოლო შეცდომა გაუქმდა');
    }
    setShowUndoBanner(false);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Undo Floating Banner */}
      {showUndoBanner && (
        <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-xl text-xs font-bold border border-slate-700 animate-bounce">
          <span>{lastActionText}</span>
          <button
            onClick={handleUndo}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-3 py-1 rounded-lg flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> გაუქმება (Undo)
          </button>
        </div>
      )}

      {/* Top Header Stats */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between border border-slate-800 shadow-lg">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">მოსწავლე: {session.userName}</span>
          <p className="text-sm font-extrabold">{session.city} — მარშრუტი #{session.routeNumber}</p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="text-center px-2 py-1 bg-amber-500/20 rounded-lg border border-amber-500/30">
            <p className="text-xs font-bold text-amber-400">{session.lightErrorCount}</p>
            <p className="text-[9px] text-amber-300">მსუბუქი</p>
          </div>
          <div className="text-center px-2 py-1 bg-rose-500/20 rounded-lg border border-rose-500/30">
            <p className="text-xs font-bold text-rose-400">{session.seriousErrorCount}</p>
            <p className="text-[9px] text-rose-300">სერიოზული</p>
          </div>
        </div>
      </div>

      {/* CONTEXT-SENSITIVE MANEUVER EVALUATION CARD (LARGE TOUCH BUTTONS) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-indigo-500 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div>
            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              მიმდინარე მანევრი
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {activeManeuver === 'LEFT_TURN' && 'მარცხენა მოხვევა'}
              {activeManeuver === 'RIGHT_TURN' && 'მარჯვენა მოხვევა'}
              {activeManeuver === 'STOP_SIGN' && 'STOP ნიშანი'}
              {activeManeuver === 'PEDESTRIAN_CROSSING' && 'ქვეითთა გადასასვლელი'}
              {activeManeuver === 'ROUNDABOUT' && 'წრიული მოძრაობა'}
              {activeManeuver === 'LANE_CHANGE_LEFT' && 'ზოლის შეცვლა'}
              {activeManeuver === 'GENERAL_OBSERVATION' && 'ზოგადი დაკვირვება'}
            </h2>
          </div>

          <button
            onClick={() => AudioEngine.replayLastInstruction()}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 hover:bg-slate-200"
            title="ხმოვანი ბრძანების განმეორება"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Large Checklist YES / NO Buttons */}
        <div className="space-y-3">
          {/* Mirror Question */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              1. შეამოწმა თუ არა სარკე?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMirror(true)}
                className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  mirror === true
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border'
                }`}
              >
                <CheckCircle className="w-5 h-5" /> [კი]
              </button>

              <button
                onClick={() => setMirror(false)}
                className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  mirror === false
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border'
                }`}
              >
                <XCircle className="w-5 h-5" /> [არა]
              </button>
            </div>
          </div>

          {/* Indicator Question */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              2. ჩართო თუ არა ციმციმა დროულად?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIndicator(true)}
                className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  indicator === true
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border'
                }`}
              >
                <CheckCircle className="w-5 h-5" /> [კი]
              </button>

              <button
                onClick={() => setIndicator(false)}
                className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  indicator === false
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border'
                }`}
              >
                <XCircle className="w-5 h-5" /> [არა]
              </button>
            </div>
          </div>

          {/* STOP Sign specific question */}
          {activeManeuver === 'STOP_SIGN' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                3. STOP ნიშანთან სრულად გაჩერდა (თვლების გაჩერება)?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStopSign(true)}
                  className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all ${
                    stopSign === true ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800 border'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" /> [კი]
                </button>

                <button
                  onClick={() => setStopSign(false)}
                  className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all ${
                    stopSign === false ? 'bg-rose-600 text-white' : 'bg-white text-slate-800 border'
                  }`}
                >
                  <XCircle className="w-5 h-5" /> [არა]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Record evaluation button */}
        <button
          onClick={() => handleRecordManeuverEval(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          მანევრის შეფასების შენახვა
        </button>
      </div>

      {/* QUICK ERROR BUTTON & FINISH EXAM */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => setShowQuickErrorModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-black text-sm py-4 rounded-2xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> [+ შეცდომა]
        </button>

        <button
          onClick={onFinishExam}
          className="bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <StopCircle className="w-5 h-5 text-emerald-400" /> გამოცდის დასრულება
        </button>
      </div>

      {/* QUICK ERROR BOTTOM SHEET MODAL */}
      {showQuickErrorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                შეცდომის სწრაფი დაფიქსირება
              </h3>
              <button
                onClick={() => setShowQuickErrorModal(false)}
                className="text-xs font-bold text-slate-400"
              >
                დახურვა
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase">მსუბუქი შეცდომები</p>
              <button
                onClick={() => handleAddQuickError('OBS-01', 'სარკეში უყურადღებობა', 'LIGHT')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold hover:bg-slate-100"
              >
                • სარკეში უყურადღებობა / Observation
              </button>
              <button
                onClick={() => handleAddQuickError('IND-01', 'ციმციმას დაგვიანებით ჩართვა', 'LIGHT')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold hover:bg-slate-100"
              >
                • ციმციმას დაგვიანებით ჩართვა
              </button>
              <button
                onClick={() => handleAddQuickError('CTL-01', 'ძრავის ჩაქრობა დაძვრისას', 'LIGHT')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold hover:bg-slate-100"
              >
                • ძრავის ჩაქრობა (Stall)
              </button>

              <p className="text-xs font-bold text-rose-500 uppercase pt-2">სერიოზული შე测დომები</p>
              <button
                onClick={() => handleAddQuickError('STP-01', 'STOP ნიშანთან სრული გაჩერების იგნორირება', 'SERIOUS')}
                className="w-full text-left p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-800 dark:text-rose-200 hover:bg-rose-100"
              >
                • STOP ნიშანთან სრული გაჩერების იგნორირება
              </button>
              <button
                onClick={() => handleAddQuickError('IND-03', 'ციმციმას სრული არჩართვა', 'SERIOUS')}
                className="w-full text-left p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-800 dark:text-rose-200 hover:bg-rose-100"
              >
                • ციმციმას სრული არჩართვა მანევრისას
              </button>
              <button
                onClick={() => handleAddQuickError('PRY-01', 'უპირატესობის დარღვევა (Priority)', 'SERIOUS')}
                className="w-full text-left p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-800 dark:text-rose-200 hover:bg-rose-100"
              >
                • უპირატესობის დარღვევა გზაჯვარედინზე
              </button>

              <p className="text-xs font-bold text-rose-700 uppercase pt-2">დისკვალიფიკაცია</p>
              <button
                onClick={() => handleAddQuickError('DSQ-01', 'წითელ შუქნიშანზე გავლით მოძრაობა', 'DISQUALIFYING')}
                className="w-full text-left p-3 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700"
              >
                • წითელ შუქნიშანზე გავლით მოძრაობა
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
