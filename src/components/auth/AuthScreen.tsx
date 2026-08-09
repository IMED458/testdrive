import React, { useState } from 'react';
import { Car, Mail, Lock, User as UserIcon, Phone, ShieldAlert, GraduationCap } from 'lucide-react';
import { loginUser, registerUser, translateAuthError } from '../../services/auth';
import type { DrivingCategory, TransmissionType, User } from '../../types';

const CITIES = ['Telavi', 'Rustavi', 'Tbilisi', 'Kutaisi', 'Batumi'];
const CITY_LABELS: Record<string, string> = {
  Telavi: 'თელავი',
  Rustavi: 'რუსთავი',
  Tbilisi: 'თბილისი',
  Kutaisi: 'ქუთაისი',
  Batumi: 'ბათუმი',
};

/** შესვლა და რეგისტრაცია — Firebase Authentication */
export const AuthScreen: React.FC<{ onAuthenticated: (u: User) => void }> = ({
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Telavi');
  const [category, setCategory] = useState<DrivingCategory>('B');
  const [transmission, setTransmission] = useState<TransmissionType>('MANUAL');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'REGISTER') {
      if (!firstName.trim() || !lastName.trim()) {
        setError('სახელი და გვარი სავალდებულოა.');
        return;
      }
      if (password.length < 6) {
        setError('პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.');
        return;
      }
      if (password !== password2) {
        setError('პაროლები არ ემთხვევა.');
        return;
      }
    }

    setBusy(true);
    try {
      const user =
        mode === 'LOGIN'
          ? await loginUser(email, password)
          : await registerUser({
              firstName,
              lastName,
              email,
              password,
              phone,
              preferredCity: city,
              category,
              transmission,
              role,
            });
      onAuthenticated(user);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      // დაუზუსტებელი შეცდომის დიაგნოსტიკა კონსოლში — მომხმარებელს ქართული ტექსტი რჩება
      console.error('[auth]', code, (err as Error)?.message);
      setError(translateAuthError(code));
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto">
            <Car className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">მართვის გამოცდის სიმულატორი</h1>
          <p className="text-sm text-slate-400">
            {mode === 'LOGIN' ? 'შედი ანგარიშში' : 'შექმენი ახალი ანგარიში'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          {/* რეჟიმის გადამრთველი */}
          <div className="flex bg-slate-800/60 rounded-xl p-1">
            {(['LOGIN', 'REGISTER'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'LOGIN' ? 'შესვლა' : 'რეგისტრაცია'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3" noValidate>
            {mode === 'REGISTER' && (
              <>
                {/* როლის არჩევა */}
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { v: 'STUDENT', label: 'მოსწავლე', Icon: GraduationCap },
                      { v: 'INSTRUCTOR', label: 'ინსტრუქტორი', Icon: Car },
                    ] as const
                  ).map(({ v, label, Icon }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRole(v)}
                      aria-pressed={role === v}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                        role === v
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      className={field}
                      placeholder="სახელი"
                      aria-label="სახელი"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      className={field}
                      placeholder="გვარი"
                      aria-label="გვარი"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    className={field}
                    placeholder="ტელეფონი (არასავალდებულო)"
                    aria-label="ტელეფონი"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label="ქალაქი"
                  className="w-full px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {CITY_LABELS[c]}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DrivingCategory)}
                    aria-label="კატეგორია"
                    className="w-full px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm"
                  >
                    <option value="B">B კატეგორია</option>
                    <option value="BE">BE კატეგორია</option>
                  </select>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                    aria-label="ტრანსმისია"
                    className="w-full px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm"
                  >
                    <option value="MANUAL">მექანიკა</option>
                    <option value="AUTOMATIC">ავტომატიკა</option>
                  </select>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className={field}
                placeholder="ელ. ფოსტა"
                aria-label="ელ. ფოსტა"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className={field}
                placeholder="პაროლი"
                aria-label="პაროლი"
                type="password"
                autoComplete={mode === 'LOGIN' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === 'REGISTER' && (
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className={field}
                  placeholder="გაიმეორე პაროლი"
                  aria-label="გაიმეორე პაროლი"
                  type="password"
                  autoComplete="new-password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-rose-950/50 border border-rose-900 text-rose-200 rounded-xl p-3 text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-[0.99]"
            >
              {busy ? 'იტვირთება…' : mode === 'LOGIN' ? 'შესვლა' : 'ანგარიშის შექმნა'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 leading-relaxed px-4">
          ეს პლატფორმა სასწავლო სიმულატორია და არ წარმოადგენს საქართველოს შსს-ს ან
          მომსახურების სააგენტოს ოფიციალურ პროდუქტს.
        </p>
      </div>
    </div>
  );
};
