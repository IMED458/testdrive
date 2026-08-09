import React, { useState, useEffect } from 'react';
import {
  UserRole,
  User,
  StudentProfile,
  InstructorProfile,
  RouteVersion,
  ExamSession,
  ExamMode,
} from './types';
import {
  getDemoUsers,
  getDemoStudentProfile,
  getDemoInstructorProfile,
  getRoutes,
  getRoadWarnings,
  getExamSessions,
  saveExamSession,
  getRuleSet,
  hasAcceptedConsent,
} from './services/db';

import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { SafetyModal } from './components/common/SafetyModal';

import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentRoutes } from './components/student/StudentRoutes';
import { StudentProgress } from './components/student/StudentProgress';

import { InstructorDashboard } from './components/instructor/InstructorDashboard';
import { InstructorStudentDetail } from './components/instructor/InstructorStudentDetail';

import { ExamEngine } from './engine/ExamEngine';
import { ExamPreCheck } from './components/exam/ExamPreCheck';
import { ExamDrivingView } from './components/exam/ExamDrivingView';
import { ExamReportView } from './components/exam/ExamReportView';

import { AdminDashboard } from './components/admin/AdminDashboard';

export function App() {
  const [users] = useState<User[]>(getDemoUsers());
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const currentUser = users.find((u) => u.role === currentRole) || users[0];

  const [activeCity, setActiveCity] = useState<string>('Telavi');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Safety Modal
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Data
  const routes = getRoutes().filter((r) => r.city.toLowerCase() === activeCity.toLowerCase());
  const roadWarnings = getRoadWarnings();
  const [sessions, setSessions] = useState<ExamSession[]>(getExamSessions());

  // Profiles
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(getDemoStudentProfile());
  const instructorProfile: InstructorProfile = getDemoInstructorProfile();

  // Selected Student for Instructor view
  const [selectedStudentForInstructor, setSelectedStudentForInstructor] = useState<StudentProfile | null>(null);

  // Exam Simulation Flow State
  const [examState, setExamState] = useState<'IDLE' | 'PRE_CHECK' | 'DRIVING' | 'REPORT'>('IDLE');
  const [examEngine, setExamEngine] = useState<ExamEngine | null>(null);
  const [activeExamMode, setActiveExamMode] = useState<ExamMode>('SELF_TEST');
  const [selectedRouteForExam, setSelectedRouteForExam] = useState<RouteVersion | undefined>(undefined);
  const [completedSession, setCompletedSession] = useState<ExamSession | null>(null);

  useEffect(() => {
    // Check if user has accepted consent
    if (!hasAcceptedConsent(currentUser.id)) {
      setIsSafetyModalOpen(true);
    }
  }, [currentUser.id]);

  // Handle Start Exam Click
  const handleStartExamFlow = (mode: ExamMode, route?: RouteVersion) => {
    setActiveExamMode(mode);
    setSelectedRouteForExam(route || routes[0]);
    setExamState('PRE_CHECK');
  };

  // Handle Pre-check finished and driving started
  const handlePreCheckComplete = (selectedRoute: RouteVersion) => {
    const ruleSet = getRuleSet();
    const engine = new ExamEngine(
      currentUser.id,
      `${currentUser.firstName} ${currentUser.lastName}`,
      activeExamMode,
      selectedRoute,
      ruleSet,
      currentRole === 'INSTRUCTOR' ? currentUser.id : undefined,
      currentRole === 'INSTRUCTOR' ? `${currentUser.firstName} ${currentUser.lastName}` : undefined
    );

    engine.startDriving();
    setExamEngine(engine);
    setExamState('DRIVING');
  };

  // Handle Exam Finished
  const handleFinishExam = () => {
    if (!examEngine) return;
    const finalSession = examEngine.finishExam();
    saveExamSession(finalSession);
    setSessions(getExamSessions());
    setCompletedSession(finalSession);
    setExamState('REPORT');

    // Update student stats
    if (finalSession.result === 'PASS') {
      setStudentProfile((prev) => ({
        ...prev,
        totalSimulations: prev.totalSimulations + 1,
        totalPasses: prev.totalPasses + 1,
        totalDrivingMinutes: prev.totalDrivingMinutes + Math.round(finalSession.durationSeconds / 60),
      }));
    } else {
      setStudentProfile((prev) => ({
        ...prev,
        totalSimulations: prev.totalSimulations + 1,
        totalFails: prev.totalFails + 1,
        totalDrivingMinutes: prev.totalDrivingMinutes + Math.round(finalSession.durationSeconds / 60),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Header Navigation */}
      <Header
        currentUser={currentUser}
        onRoleChange={(role) => {
          setCurrentRole(role);
          setActiveTab('dashboard');
          setSelectedStudentForInstructor(null);
        }}
        onOpenDisclaimer={() => setIsSafetyModalOpen(true)}
        activeCity={activeCity}
        onCityChange={(city) => setActiveCity(city)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* EXAM SIMULATION OVERLAY FLOW */}
        {examState === 'PRE_CHECK' && (
          <ExamPreCheck
            mode={activeExamMode}
            routes={routes}
            defaultRoute={selectedRouteForExam}
            onStartDriving={(route) => handlePreCheckComplete(route)}
            onCancel={() => setExamState('IDLE')}
          />
        )}

        {examState === 'DRIVING' && examEngine && (
          <ExamDrivingView examEngine={examEngine} onFinishExam={handleFinishExam} />
        )}

        {examState === 'REPORT' && completedSession && (
          <ExamReportView
            session={completedSession}
            onDone={() => {
              setExamState('IDLE');
              setExamEngine(null);
              setCompletedSession(null);
            }}
          />
        )}

        {/* REGULAR APP DASHBOARD / TAB CONTENT */}
        {examState === 'IDLE' && (
          <>
            {/* STUDENT VIEWS */}
            {currentRole === 'STUDENT' && (
              <>
                {activeTab === 'dashboard' && (
                  <StudentDashboard
                    currentUser={currentUser}
                    studentProfile={studentProfile}
                    routes={routes}
                    roadWarnings={roadWarnings}
                    onStartExam={(mode, route) => handleStartExamFlow(mode, route)}
                    onViewRoutes={() => setActiveTab('routes')}
                    onViewProgress={() => setActiveTab('progress')}
                  />
                )}

                {activeTab === 'routes' && (
                  <StudentRoutes
                    city={activeCity}
                    routes={routes}
                    roadWarnings={roadWarnings}
                    onStartExam={(mode, route) => handleStartExamFlow(mode, route)}
                  />
                )}

                {(activeTab === 'progress' || activeTab === 'practice') && (
                  <StudentProgress
                    profile={studentProfile}
                    sessions={sessions}
                    onViewSessionReport={(session) => {
                      setCompletedSession(session);
                      setExamState('REPORT');
                    }}
                  />
                )}
              </>
            )}

            {/* INSTRUCTOR VIEWS */}
            {currentRole === 'INSTRUCTOR' && (
              <>
                {selectedStudentForInstructor ? (
                  <InstructorStudentDetail
                    student={selectedStudentForInstructor}
                    sessions={sessions}
                    onStartLessonForStudent={(st) => handleStartExamFlow('INSTRUCTOR_TEST')}
                    onBack={() => setSelectedStudentForInstructor(null)}
                  />
                ) : (
                  <InstructorDashboard
                    instructor={instructorProfile}
                    students={[studentProfile]}
                    recentSessions={sessions}
                    onAddStudent={() => alert('ახალი მოსწავლის დამატების ფორმა')}
                    onStartSimulation={() => handleStartExamFlow('INSTRUCTOR_TEST')}
                    onSelectStudent={(st) => setSelectedStudentForInstructor(st)}
                    onViewHistory={() => setActiveTab('history')}
                  />
                )}
              </>
            )}

            {/* ADMIN VIEWS */}
            {currentRole === 'ADMIN' && <AdminDashboard adminName={currentUser.firstName} />}
          </>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      {examState === 'IDLE' && (
        <BottomNav
          role={currentRole}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedStudentForInstructor(null);
          }}
        />
      )}

      {/* Safety & Informed Consent Modal */}
      <SafetyModal
        userId={currentUser.id}
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        onConsentAccepted={() => setIsSafetyModalOpen(false)}
      />
    </div>
  );
}

export default App;
