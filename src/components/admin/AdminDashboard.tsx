import React, { useState } from 'react';
import { AudioManager } from './AudioManager';
import { RouteVersion, ExamRuleSet, AuditLog } from '../../types';
import {
  Shield,
  MapPin,
  Volume2,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  UploadCloud,
} from 'lucide-react';
import { getRoutes, saveRoute, getRulesets, getAuditLogs, pushSeedToCloud } from '../../services/db';

export const AdminDashboard: React.FC<{ adminName?: string }> = ({ adminName }) => {
  const [activeTab, setActiveTab] = useState<'ROUTES' | 'RULES' | 'AUDIO' | 'AUDIT'>('ROUTES');
  const [routes, setRoutes] = useState<RouteVersion[]>(getRoutes());
  const rulesets = getRulesets();
  const auditLogs = getAuditLogs();

  const [selectedRoute, setSelectedRoute] = useState<RouteVersion | null>(null);
  const [seedState, setSeedState] = useState<'IDLE' | 'BUSY' | 'DONE' | 'ERROR'>('IDLE');

  /** ლოკალური ცნობარები (მარშრუტები, წესები, კითხვები) Firestore-ში ატვირთვა */
  async function handleSeed() {
    setSeedState('BUSY');
    try {
      await pushSeedToCloud();
      setSeedState('DONE');
    } catch {
      setSeedState('ERROR');
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            ადმინისტრატორის მართვის პანელი
          </span>
          <h1 className="text-2xl font-bold mt-2">სისტემის ადმინისტრირება</h1>
          <p className="text-xs text-slate-300 mt-1">
            საგამოცდო წესები, მარშრუტების ვერსიები, ხმოვანი აქტივები და აუდიტის ლოგები
          </p>

          {/* ბაზის შევსება — ერთჯერადი ოპერაცია ახალ პროექტზე */}
          <button
            onClick={handleSeed}
            disabled={seedState === 'BUSY'}
            className="mt-3 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700"
          >
            <UploadCloud className="w-4 h-4" />
            {seedState === 'BUSY'
              ? 'იტვირთება…'
              : seedState === 'DONE'
                ? 'ცნობარები ატვირთულია ✓'
                : seedState === 'ERROR'
                  ? 'ვერ აიტვირთა — შეამოწმე წესები'
                  : 'ცნობარების ატვირთვა ბაზაში'}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('ROUTES')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'ROUTES' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            მარშრუტები ({routes.length})
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'RULES' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            წესები ({rulesets.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIO')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'AUDIO' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ხმები (Audio)
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'AUDIT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            აუდიტი
          </button>
        </div>
      </div>

      {/* TAB 1: ROUTES MANAGEMENT */}
      {activeTab === 'ROUTES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">მარშრუტების მართვა</h2>
            <button
              onClick={() => {
                const newR: RouteVersion = {
                  id: 'route-new-' + Date.now(),
                  city: 'Telavi',
                  routeNumber: routes.length + 1,
                  versionDate: '2026-08-08',
                  validFrom: '2026-08-08',
                  category: 'B',
                  status: 'ACTIVE',
                  lastVerifiedDate: '2026-08-08',
                  officialSourceUrl: 'https://saagentomvd.ge',
                  startPoint: { lat: 41.9182, lng: 45.4771 },
                  finishPoint: { lat: 41.9215, lng: 45.4802 },
                  polyline: [],
                  instructions: [],
                  checkpoints: [],
                  speedZones: [],
                  hazardNotes: [],
                };
                saveRoute(newR);
                setRoutes(getRoutes());
              }}
              className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> ახალი მარშრუტის დამატება
            </button>
          </div>

          <div className="space-y-3">
            {routes.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {r.city} — მარშრუტი #{r.routeNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ვერსია: {r.versionDate} • შემოწმებულია: {r.lastVerifiedDate} • ბრძანებები: {r.instructions.length}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={r.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-600"
                    title="ოფიციალური წყარო"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RULESETS */}
      {activeTab === 'RULES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            საგამოცდო წესები და შეფასების კრიტერიუმები (Configurable Ruleset)
          </h2>

          {rulesets.map((rs) => (
            <div key={rs.id} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{rs.name}</h3>
                  <p className="text-xs text-slate-500">ვერსია: {rs.version} • აქტიურია: {rs.activeFrom}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                  ზღვარი: {rs.lightErrorFailThreshold} მსუბუქი შეცდომა
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {rs.rules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border flex justify-between items-center">
                    <div>
                      <span className="font-mono text-indigo-600 font-bold">{rule.code}</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{rule.nameKa}</p>
                    </div>
                    <span
                      className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                        rule.severity === 'LIGHT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AUDIO ASSETS */}
      {activeTab === 'AUDIO' && <AudioManager adminName={adminName ?? 'ადმინი'} />}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">აუდიტის ლოგები (Audit Trail)</h2>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border text-xs flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                  <p className="text-slate-500">{log.userRole} • {log.details}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
