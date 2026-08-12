import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Upload, Play, Trash2, CheckCircle2, AlertTriangle, Search, Copy } from 'lucide-react';
import { DEFAULT_AUDIO_ASSETS } from '../../data/initialData';
import { AudioEngine } from '../../engine/AudioEngine';
import {
  deleteAudio,
  fetchUploadedAudio,
  mergeAudioAssets,
  uploadAudio,
  validateAudioFile,
} from '../../services/audioStorage';
import type { AudioAsset } from '../../types';

const GROUP_LABELS: Record<string, string> = {
  SYSTEM: 'სისტემური',
  CORE: 'ძირითადი მითითებები',
  MANEUVER: 'მანევრები',
  HAZARD: 'საფრთხე და ნიშნები',
  TECHNICAL: 'ტექნიკური კითხვები',
};

/**
 * ხმოვანი ფაილების მართვა.
 * ადმინი თითოეულ ტექსტს ურთავს ჩაწერილ ფაილს; სანამ ფაილი არ არის,
 * აპლიკაცია სინთეზურ ხმას იყენებს და ეს ღიად ჩანს.
 */
export const AudioManager: React.FC<{ adminName: string }> = ({ adminName }) => {
  const [assets, setAssets] = useState<AudioAsset[]>(DEFAULT_AUDIO_ASSETS);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const uploaded = await fetchUploadedAudio();
        if (cancelled) return;
        const merged = mergeAudioAssets(DEFAULT_AUDIO_ASSETS, uploaded);
        setAssets(merged);
        AudioEngine.applyUploadedAssets(merged);
      } catch {
        // Firestore მიუწვდომელია — ნაგულისხმევი სია მაინც უნდა ჩანდეს
        if (!cancelled) setError('ატვირთული ხმების სია ვერ ჩაიტვირთა. ნაჩვენებია ნაგულისხმევი ტექსტები.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const recorded = assets.filter((a) => a.url).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.titleKa.toLowerCase().includes(q) ||
        a.textKa.toLowerCase().includes(q) ||
        a.key.toLowerCase().includes(q),
    );
  }, [assets, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, AudioAsset[]>();
    filtered.forEach((a) => {
      const g = a.group ?? 'CORE';
      map.set(g, [...(map.get(g) ?? []), a]);
    });
    return [...map.entries()];
  }, [filtered]);

  async function handleFile(asset: AudioAsset, file: File) {
    setError(null);
    const invalid = validateAudioFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusyKey(asset.key);
    try {
      const res = await uploadAudio(asset.key, file, adminName);
      const next = assets.map((a) =>
        a.key === asset.key
          ? {
              ...a,
              url: res.url,
              sizeBytes: res.sizeBytes,
              isCustomUploaded: true,
              uploadedAt: new Date().toISOString(),
              uploadedBy: adminName,
              ...(res.durationSeconds ? { durationSeconds: res.durationSeconds } : {}),
            }
          : a,
      );
      setAssets(next);
      AudioEngine.applyUploadedAssets(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ატვირთვა ვერ მოხერხდა.');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDelete(asset: AudioAsset) {
    if (!asset.url) return;
    setBusyKey(asset.key);
    try {
      await deleteAudio(asset.key);
      const next = assets.map((a) =>
        a.key === asset.key
          ? { ...a, url: undefined, sizeBytes: undefined, isCustomUploaded: false }
          : a,
      );
      setAssets(next);
      AudioEngine.applyUploadedAssets(next);
    } catch {
      setError('წაშლა ვერ მოხერხდა.');
    } finally {
      setBusyKey(null);
    }
  }

  function copyScript() {
    const text = assets
      .map((a, i) => `${i + 1}. [${a.key}]\n${a.textKa}`)
      .join('\n\n');
    void navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full">
              <Mic className="w-3.5 h-3.5" />
              ხმოვანი ფაილების მართვა
            </div>
            <h2 className="text-2xl font-extrabold">ქართული ხმოვანი მითითებები</h2>
            <p className="text-sm text-indigo-100 max-w-2xl">
              ჩაწერე თითოეული ტექსტი ზუსტად ისე, როგორც წერია, და ატვირთე შესაბამის ველში.
              სანამ ფაილი არ აიტვირთება, სისტემა ბრაუზერის სინთეზურ ხმას იყენებს.
              <span className="block mt-1 text-indigo-200/80">
                ფაილის ლიმიტი 400 კბ — mp3, 64 kbps, mono სავსებით საკმარისია.
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">
              {recorded}
              <span className="text-lg text-indigo-300">/{assets.length}</span>
            </p>
            <p className="text-xs text-indigo-200">ჩაწერილია</p>
          </div>
        </div>

        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all"
            style={{ width: `${assets.length ? (recorded / assets.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 rounded-xl p-4 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ძებნა ტექსტში ან კოდში"
            aria-label="ხმოვანი ფრაზების ძებნა"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
        <button
          onClick={copyScript}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Copy className="w-4 h-4" />
          ჩასაწერი ტექსტების კოპირება
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">იტვირთება…</p>
      ) : (
        grouped.map(([group, items]) => (
          <section key={group} className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {GROUP_LABELS[group] ?? group}
            </h3>
            <div className="space-y-2">
              {items.map((a) => (
                <div
                  key={a.key}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {a.titleKa}
                      </span>
                      <code className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {a.key}
                      </code>
                      {a.url ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          ჩაწერილი
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          სინთეზური ხმა
                        </span>
                      )}
                    </div>
                    {/* ზუსტად ეს ტექსტი უნდა ჩაიწეროს */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">„{a.textKa}"</p>
                    {(a.durationSeconds || a.sizeBytes) && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {a.durationSeconds ? `${a.durationSeconds.toFixed(1)} წმ` : ''}
                        {a.durationSeconds && a.sizeBytes ? ' · ' : ''}
                        {a.sizeBytes ? `${Math.round(a.sizeBytes / 1024)} კბ` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => void AudioEngine.playInstruction(a.key, { force: true })}
                      title="მოსმენა"
                      aria-label={`მოსმენა: ${a.titleKa}`}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    <input
                      ref={(el) => {
                        inputs.current[a.key] = el;
                      }}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleFile(a, f);
                        e.target.value = '';
                      }}
                    />
                    <button
                      onClick={() => inputs.current[a.key]?.click()}
                      disabled={busyKey === a.key}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold"
                    >
                      <Upload className="w-4 h-4" />
                      {busyKey === a.key ? 'იტვირთება…' : a.url ? 'შეცვლა' : 'ატვირთვა'}
                    </button>

                    {a.url && (
                      <button
                        onClick={() => void handleDelete(a)}
                        disabled={busyKey === a.key}
                        title="წაშლა"
                        aria-label={`წაშლა: ${a.titleKa}`}
                        className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};
