import React, { useState, useEffect, useRef } from 'react';
import { ExamEngine } from '../../engine/ExamEngine';
import { RouteMap } from '../map/RouteMap';
import { InstructorLiveView } from './InstructorLiveView';
import { AudioEngine } from '../../engine/AudioEngine';
import { Volume2, VolumeX, Pause, Play, AlertOctagon, Navigation, MapPin } from 'lucide-react';
import { Geo, describeGeoStatus, type GeoState } from '../../services/geolocation';

interface ExamDrivingViewProps {
  examEngine: ExamEngine;
  onFinishExam: () => void;
}

export const ExamDrivingView: React.FC<ExamDrivingViewProps> = ({
  examEngine,
  onFinishExam,
}) => {
  const session = examEngine.getSession();
  const routeEngine = examEngine.getRouteEngine();
  const route = routeEngine.getRoute();
  const [routeState, setRouteState] = useState(routeEngine.getState());

  const isInstructorMode = session.mode === 'INSTRUCTOR_TEST' || session.mode === 'COMPANION';
  const isLearningMode = session.mode === 'LEARNING';

  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(AudioEngine.getIsMuted());

  /**
   * რეალური GPS.
   *
   * ადრე აქ იყო ყალბი სიმულაცია: setInterval ყოველ 3 წამში მარშრუტის
   * შემდეგ წერტილზე „გადაჰქონდა" მომხმარებელი და სიზუსტეს 5 მ-ს უწერდა.
   * ახლა მდებარეობა მოწყობილობიდან მოდის, ცდომილებითურთ.
   */
  const [geo, setGeo] = useState<GeoState>(Geo.snapshot);
  // ბოლო დამუშავებული წერტილის დრო — ერთი და იმავე reading-ის ორჯერ დამუშავების წინააღმდეგ
  const lastHandledRef = useRef<number>(0);

  useEffect(() => {
    Geo.start();
    // ერთი გამოწერა; დაბრუნებული ფუნქცია watch-საც აჩერებს, თუ სხვა მსმენელი აღარაა
    const unsubscribe = Geo.subscribe(setGeo);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fix = geo.fix;
    if (!fix) return;
    if (examEngine.getStage() !== 'DRIVING') return;
    if (fix.timestamp === lastHandledRef.current) return;
    lastHandledRef.current = fix.timestamp;

    examEngine.updateGpsPosition(fix.coords, fix.accuracy);
    setRouteState({ ...routeEngine.getState() });
  }, [geo.fix, examEngine, routeEngine]);
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    AudioEngine.setMuted(next);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      examEngine.resumeExam();
      setIsPaused(false);
    } else {
      examEngine.pauseExam();
      setIsPaused(true);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top Status Header */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-xl font-extrabold tracking-mono font-mono text-emerald-400">
            {formatTimer(session.durationSeconds)}
          </div>
          <div className="text-xs text-slate-400 border-l border-slate-700 pl-3">
            <p className="font-bold text-white">{routeState.currentSpeedKmh} კმ/სთ</p>
            <p className="text-[10px]">
              GPS: {geo.fix ? `±${Math.round(geo.fix.accuracy)}მ` : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="ხმის ჩართვა/გამორთვა"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            onClick={handlePauseResume}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1"
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'გაგრძელება' : 'პაუზა'}
          </button>
        </div>
      </div>

      {/* GPS-ის რეალური მდგომარეობა — არასოდეს ვამბობთ „მუშაობს", თუ წერტილი არ გვაქვს */}
      {geo.status !== 'READY' && (
        <div
          className={`p-3 rounded-2xl border flex items-start gap-3 text-sm ${
            geo.status === 'DENIED' || geo.status === 'UNAVAILABLE' || geo.status === 'TIMEOUT'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
          }`}
          role="status"
        >
          <Navigation className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{describeGeoStatus(geo)}</p>
            {geo.fix && (
              <p className="text-xs opacity-80 mt-0.5">
                მიმდინარე სიზუსტე: ±{Math.round(geo.fix.accuracy)} მ — ავტომატური შეფასება
                შეზღუდულია.
              </p>
            )}
            {(geo.status === 'DENIED' || geo.status === 'UNAVAILABLE') && (
              <button
                onClick={() => Geo.start()}
                className="mt-2 text-xs font-bold underline"
              >
                ხელახლა ცდა
              </button>
            )}
          </div>
        </div>
      )}

      {/* Voice Instruction Banner */}
      <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-wider">
              მიმდინარე ბრძანება
            </span>
            <p className="text-sm font-bold leading-tight">
              {routeState.activeInstruction?.instructionText || 'იმოძრავეთ პირდაპირ საგამოცდო მარშრუტზე.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => AudioEngine.replayLastInstruction()}
          className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3 py-2 rounded-xl backdrop-blur shrink-0"
        >
          განმეორება
        </button>
      </div>

      {/* Driver Self-Test View vs Instructor Evaluation View */}
      {isInstructorMode ? (
        <InstructorLiveView examEngine={examEngine} onFinishExam={onFinishExam} />
      ) : (
        <div className="space-y-4">
          {/* Map View */}
          <RouteMap
            route={route}
            {...(geo.fix ? { currentPosition: geo.fix.coords } : {})}
            showPolyline={isLearningMode} // Strict exam hides polyline to simulate real test
            showInstructions={isLearningMode}
            height="360px"
          />

          {/* Learning Mode Hints */}
          {isLearningMode && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 text-xs space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                სწავლის რჩევა (Learning Mode)
              </p>
              <p className="text-amber-800 dark:text-amber-300">
                ყურადღება: ამ მარშრუტზე განსაკუთრებულ ყურადღებას მოითხოვს STOP ნიშანი და ბარათაშვილის წრიული მოძრაობა.
              </p>
            </div>
          )}

          {/* Finish Exam Button */}
          <div className="pt-2">
            <button
              onClick={onFinishExam}
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-black text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              <AlertOctagon className="w-5 h-5 text-rose-500" /> გამოცდის დასრულება და შედეგის ნახვა
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
