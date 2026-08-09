import React, { useState } from 'react';
import { StudentProfile, ExamSession, LessonNote } from '../../types';
import { User, Play, Plus, Pin, Phone, MapPin, Award, CheckCircle, XCircle } from 'lucide-react';
import { saveLessonNote, getLessonNotes } from '../../services/db';

interface InstructorStudentDetailProps {
  student: StudentProfile;
  sessions: ExamSession[];
  onStartLessonForStudent: (student: StudentProfile) => void;
  onBack: () => void;
}

export const InstructorStudentDetail: React.FC<InstructorStudentDetailProps> = ({
  student,
  sessions,
  onStartLessonForStudent,
  onBack,
}) => {
  const [notes, setNotes] = useState<LessonNote[]>(getLessonNotes(student.id));
  const [newNoteText, setNewNoteText] = useState('');

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const note: LessonNote = {
      id: 'note-' + Date.now(),
      studentProfileId: student.id,
      instructorId: 'prof-instructor-01',
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
    };
    saveLessonNote(note);
    setNotes([note, ...notes]);
    setNewNoteText('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header / Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
        >
          ← უკან დაბრუნება
        </button>

        <button
          onClick={() => onStartLessonForStudent(student)}
          className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          სიმულაციის დაწყება ამ მოსწავლისთვის
        </button>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center">
            გმ
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">გიორგი მაისურაძე</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              კატეგორია {student.category} • ტრანსმისია: {student.transmission} • ქალაქი: {student.preferredCity}
            </p>
            <p className="text-xs text-indigo-600 font-semibold mt-1">ტელ: 599 11 22 33</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">{student.preparationScore}%</p>
            <p className="text-[10px] text-slate-400">მომზადების ქულა</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-600">{student.totalPasses}</p>
            <p className="text-[10px] text-slate-400">PASS</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-rose-600">{student.totalFails}</p>
            <p className="text-[10px] text-slate-400">FAIL</p>
          </div>
        </div>
      </div>

      {/* Route Coverage Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ROUTE COVERAGE ({student.preferredCity})
          </h2>
          <p className="text-xs text-slate-500">მოსწავლის მიერ გავლილი და დასამუშავებელი მარშრუტები</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">მარშრუტი #1 (თელავი)</p>
              <p className="text-[11px] text-slate-500">4 მცდელობა • 3 PASS • 1 FAIL</p>
            </div>
            <span className="text-xs font-bold text-emerald-600">75% PASS</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">მარშრუტი #2 (თელავი)</p>
              <p className="text-[11px] text-slate-500">2 მცდელობა • 1 PASS • 1 FAIL</p>
            </div>
            <span className="text-xs font-bold text-amber-600">50% PASS</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-60">
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">მარშრუტი #3 (თელავი)</p>
              <p className="text-[11px] text-slate-500">ჯერ არ უვარჯიშია</p>
            </div>
            <span className="text-xs font-bold text-slate-400">0%</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">მარშრუტი #4 (თელავი)</p>
              <p className="text-[11px] text-slate-500">5 მცდელობა • 4 PASS • 1 FAIL</p>
            </div>
            <span className="text-xs font-bold text-emerald-600">80% PASS</span>
          </div>
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs font-bold text-indigo-900 dark:text-indigo-200">
          💡 რეკომენდაცია: შემდეგი რეკომენდებული მარშრუტი მოსწავლისთვის არის <b>Route #3</b>
        </div>
      </div>

      {/* Instructor Chronological Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          ინსტრუქტორის ჩანაწერები და რეკომენდაციები
        </h2>

        {/* Add note input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="დაამატეთ შენიშვნა მოსწავლეზე..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddNote}
            className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-indigo-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> დამატება
          </button>
        </div>

        {/* Notes list */}
        <div className="space-y-2">
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">ჩანაწერები არ არის</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start justify-between gap-2"
              >
                <div className="space-y-1">
                  <p>{note.text}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Pin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
