import { useState } from 'react';

// Utils - initialize storage polyfill
import './utils';

// Auth
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth';

// Hooks
import { useAppState } from './hooks/useAppState';
import { useCalculations } from './hooks/useCalculations';
import { useAuth } from './hooks/useAuth';

// UI Components
import { Notification } from './components/ui/Notification';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Layout Components
import { Header } from './components/layout/Header';
import { TabNav } from './components/layout/TabNav';
import { Footer } from './components/layout/Footer';

// Tab Components
import { TodayTab } from './components/tabs/TodayTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { FoodTab } from './components/tabs/FoodTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { WeekTab } from './components/tabs/WeekTab';
import { PlanTab } from './components/tabs/PlanTab';

// Auth
import { LoginForm } from './components/LoginForm';

function GlowUpTrackerInner({ onLogout }) {
  const [activeTab, setActiveTab] = useState('today');

  // Main state hook
  const {
    state,
    isLoading,
    notification,
    saveStatus,
    todayKey,
    showNotification,
    hideNotification,
    getTodayTasks,
    getTodayMeals,
    getTodaySchedule,
    getYesterdaySchedule,
    toggleDailyTask,
    addMeal,
    removeMeal,
    addScheduleTask,
    toggleScheduleTask,
    removeScheduleTask,
    copyYesterdaySchedule,
    addSkill,
    toggleSkill,
    removeSkill,
    addProject,
    updateProjectStatus,
    removeProject,
    addEnglishTopic,
    toggleEnglishTopic,
    removeEnglishTopic,
    updateWeight,
    resetAll,
    saveState,
  } = useAppState();

  // Calculations hook
  const calculations = useCalculations(
    state,
    getTodayTasks,
    getTodayMeals,
    getTodaySchedule
  );

  // Show loading screen while data loads
  if (isLoading) {
    return <LoadingScreen />;
  }

  const todayTasks = getTodayTasks();
  const todayMeals = getTodayMeals();
  const todaySchedule = getTodaySchedule();
  const yesterdaySchedule = getYesterdaySchedule();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 pb-20">
      {/* Notification Toast */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header with Progress */}
        <Header
          saveStatus={saveStatus}
          weekNumber={calculations.weekNumber}
          phase={calculations.phase}
          currentWeight={calculations.currentWeight}
          weightLost={calculations.weightLost}
          weightProgress={calculations.weightProgress}
        />

        {/* Tab Navigation */}
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'today' && (
          <TodayTab
            todayTasks={todayTasks}
            todaySchedule={todaySchedule}
            totalKcal={calculations.totalKcal}
            totalProtein={calculations.totalProtein}
            dailyCompleted={calculations.dailyCompleted}
            toggleDailyTask={toggleDailyTask}
            toggleScheduleTask={toggleScheduleTask}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            todaySchedule={todaySchedule}
            yesterdaySchedule={yesterdaySchedule}
            addScheduleTask={addScheduleTask}
            toggleScheduleTask={toggleScheduleTask}
            removeScheduleTask={removeScheduleTask}
            copyYesterdaySchedule={copyYesterdaySchedule}
            state={state}
            saveState={saveState}
            todayKey={todayKey}
          />
        )}

        {activeTab === 'food' && (
          <FoodTab
            todayMeals={todayMeals}
            totalKcal={calculations.totalKcal}
            totalProtein={calculations.totalProtein}
            addMeal={addMeal}
            removeMeal={removeMeal}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            state={state}
            getDayCompletion={calculations.getDayCompletion}
            weightLost={calculations.weightLost}
            weightProgress={calculations.weightProgress}
          />
        )}

        {activeTab === 'week' && (
          <WeekTab
            state={state}
            weekNumber={calculations.weekNumber}
            currentWeight={calculations.currentWeight}
            dailyCompleted={calculations.dailyCompleted}
            totalKcal={calculations.totalKcal}
            todaySchedule={todaySchedule}
            updateWeight={updateWeight}
            saveState={saveState}
            todayKey={todayKey}
          />
        )}

        {activeTab === 'plan' && (
          <PlanTab
            state={state}
            weekNumber={calculations.weekNumber}
            saveState={saveState}
            addSkill={addSkill}
            toggleSkill={toggleSkill}
            removeSkill={removeSkill}
            addProject={addProject}
            updateProjectStatus={updateProjectStatus}
            removeProject={removeProject}
            addEnglishTopic={addEnglishTopic}
            toggleEnglishTopic={toggleEnglishTopic}
            removeEnglishTopic={removeEnglishTopic}
          />
        )}

        {/* Footer */}
        <Footer onReset={resetAll} onLogout={onLogout} />
      </div>
    </div>
  );
}

// Export with ErrorBoundary and AuthProvider wrapper
export default function GlowUpTracker() {
  const { isAuthenticated, isChecking, error, login, logout } = useAuth();

  if (isChecking) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} error={error} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedRoute>
          <GlowUpTrackerInner />
        </ProtectedRoute>
      </AuthProvider>
    </ErrorBoundary>
  );
}
