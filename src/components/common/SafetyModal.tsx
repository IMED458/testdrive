import React, { useState } from 'react';
import { ShieldAlert, CheckSquare, Square, FileText } from 'lucide-react';
import { saveConsent } from '../../services/db';

interface SafetyModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onConsentAccepted: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  userId,
  isOpen,
  onClose,
  onConsentAccepted,
}) => {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);

  if (!isOpen) return null;

  const canComplete = c1 && c2 && c3;

  const handleFinish = () => {
    if (!canComplete) return;

    saveConsent({
      id: 'consent-' + Date.now(),
      userId,
      disclaimerVersion: '2026-v1',
      acceptedAt: new Date().toISOString(),
      termsAccepted: true,
      simulatorAcknowledged: true,
      roadConditionsAcknowledged: true,
    });

    onConsentAccepted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
          <ShieldAlert className="w-8 h-8 shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ინფორმირებული თანხმობა და უსაფრთხოების წესები
            </h2>
            <p className="text-xs text-slate-500">გთხოვთ, ყურადღებით გაეცნოთ აპლიკაციით სარგებლობის პირობებს</p>
          </div>
        </div>

        {/* Scrollable Legal Disclaimer Text */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 space-y-3 mb-5">
          <p className="font-bold text-sm text-slate-900 dark:text-white">მნიშვნელოვანი ინფორმაცია</p>
          <p>
            ეს პლატფორმა წარმოადგენს სასწავლო და პრაქტიკული გამოცდის სიმულაციის დამხმარე ვებ-სერვისს.
          </p>
          <p>
            პლატფორმა არ წარმოადგენს საქართველოს შინაგან საქმეთა სამინისტროს, მომსახურების სააგენტოს ან სხვა სახელმწიფო უწყების ოფიციალურ პროდუქტს და არ არის მათ მიერ ჩატარებული პრაქტიკული გამოცდის შემცვლელი.
          </p>
          <p>
            პლატფორმაში წარმოდგენილი მარშრუტები, ხმოვანი ინსტრუქციები, საგზაო ინფორმაცია, შეფასებები და სასწავლო რეკომენდაციები განკუთვნილია მხოლოდ მოსამზადებელი და საინფორმაციო მიზნებისთვის.
          </p>
          <p>
            რეალურ გარემოში შესაძლებელია შეიცვალოს: ოფიციალური საგამოცდო მარშრუტი, საგზაო მოძრაობის ორგანიზება, ქუჩის მიმართულება, საგზაო ნიშნები, შუქნიშნები, სიჩქარის შეზღუდვა, საგზაო მონიშვნა, გზის დროებითი ჩაკეტვა და მიმდინარე სარემონტო სამუშაოები.
          </p>
          <p className="font-semibold text-amber-700 dark:text-amber-300">
            უსაფრთხოების მთავარი წესი: ავტომობილის მართვისას მძღოლმა არ უნდა მართოს ტელეფონის ეკრანი მოძრაობის პროცესში! ტელეფონის მართვა და შეფასებების მონიშვნა უნდა განახორციელოს მხოლოდ უსაფრთხოდ გაჩერებულ მდგომარეობაში მყოფმა მომხმარებელმა ან გვერდით მყოფმა ინსტრუქტორმა/თანმხლებმა პირმა.
          </p>
        </div>

        {/* Unchecked Mandatory Checkboxes */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setC1(!c1)}
            className="flex items-start gap-3 text-left w-full p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {c1 ? (
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              წავიკითხე და ვეთანხმები გამოყენების პირობებს
            </span>
          </button>

          <button
            type="button"
            onClick={() => setC2(!c2)}
            className="flex items-start gap-3 text-left w-full p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {c2 ? (
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              ვაცნობიერებ, რომ ეს პლატფორმა არის სასწავლო სიმულატორი და არა ოფიციალური გამოცდის სისტემა
            </span>
          </button>

          <button
            type="button"
            onClick={() => setC3(!c3)}
            className="flex items-start gap-3 text-left w-full p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {c3 ? (
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              ვაცნობიერებ, რომ მარშრუტები და საგზაო პირობები შეიძლება შეიცვალოს და რეალურ გზაზე მოქმედი ნიშნები ყოველთვის უპირატესია
            </span>
          </button>
        </div>

        {/* Finish CTA */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleFinish}
            disabled={!canComplete}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${
              canComplete
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            დადასტურება და გაგრძელება
          </button>
        </div>
      </div>
    </div>
  );
};
