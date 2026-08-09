import React, { useState } from 'react';
import { RouteVersion, RoadWarning } from '../../types';
import { RouteMap } from '../map/RouteMap';
import { MapPin, AlertTriangle, ExternalLink, Play, BookOpen, ShieldCheck } from 'lucide-react';

interface StudentRoutesProps {
  city: string;
  routes: RouteVersion[];
  roadWarnings: RoadWarning[];
  onStartExam: (mode: 'SELF_TEST' | 'LEARNING', route: RouteVersion) => void;
}

export const StudentRoutes: React.FC<StudentRoutesProps> = ({
  city,
  routes,
  roadWarnings,
  onStartExam,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<RouteVersion>(routes[0] || null);

  const cityWarnings = roadWarnings.filter((w) => w.city.toLowerCase() === city.toLowerCase() && w.isActive);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" />
          {city}-ის საგამოცდო მარშრუტები ({routes.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          ოფიციალურ მონაცემებზე დაფუძნებული საგამოცდო მარშრუტები და ვერსიები
        </p>
      </div>

      {/* Road Work Warnings */}
      {cityWarnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
              ყურადღება — ამ ქალაქში დაფიქსირებულია მიმდინარე საგზაო სამუშაოები!
            </p>
            {cityWarnings.map((w) => (
              <p key={w.id} className="text-xs text-amber-800 dark:text-amber-300">
                <b>{w.locationName}:</b> {w.warningText} (წყარო: {w.source})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Route Interactive Selector & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route List sidebar */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">აირჩიეთ მარშრუტი</p>

          {routes.map((route) => {
            const isSelected = selectedRoute?.id === route.id;
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-base">
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
                  ინსტრუქციები: {route.instructions.length} • საკონტროლო პუნქტი: {route.checkpoints.length}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">ვერსია: {route.versionDate}</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    შემოწმებული: {route.lastVerifiedDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Route Map & Details */}
        {selectedRoute && (
          <div className="lg:col-span-2 space-y-4 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedRoute.city} — მარშრუტი #{selectedRoute.routeNumber}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>კატეგორია: {selectedRoute.category}</span>
                  <span>•</span>
                  <span>ვერსია: {selectedRoute.versionDate}</span>
                  <span>•</span>
                  <a
                    href={selectedRoute.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    ოფიციალური წყარო <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStartExam('LEARNING', selectedRoute)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-200 flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  სწავლის რეჟიმი
                </button>
                <button
                  onClick={() => onStartExam('SELF_TEST', selectedRoute)}
                  className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  სიმულაციის დაწყება
                </button>
              </div>
            </div>

            {/* Map View */}
            <RouteMap
              route={selectedRoute}
              height="380px"
              warnings={cityWarnings}
              showInstructions={true}
            />

            {/* Instructions Timeline Preview */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                საგამოცდო ბრძანებები და მანევრები ({selectedRoute.instructions.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedRoute.instructions.map((inst, idx) => (
                  <div
                    key={inst.id}
                    className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {inst.instructionText}
                      </p>
                      {inst.hazardNote && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                          ⚠️ {inst.hazardNote}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer note */}
            <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100 dark:border-slate-800">
              შენიშვნა: საგზაო პირობები შეიძლება რეალურ დროში შეიცვალოს. გზაზე არსებული ნიშნები და მოქმედი მოძრაობის ორგანიზება ყოველთვის უპირატესია აპლიკაციაში მოცემულ ინფორმაციაზე.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
