import { DAILY_TASKS, defaultSkills, defaultProjects, defaultEnglishTopics } from '../constants';
import { getTodayKey, safeParseFloat, safeParseInt } from '../utils';

export function useCalculations(state, getTodayTasks, getTodayMeals, getTodaySchedule) {
  const todayKey = getTodayKey();
  const todayTasks = getTodayTasks();
  const todayMeals = getTodayMeals();
  const todaySchedule = getTodaySchedule();

  // Daily completion
  const dailyCompleted = DAILY_TASKS.filter(t => todayTasks[t.key]).length;
  const dailyTotal = DAILY_TASKS.length;
  const dailyCompletionRate = dailyTotal > 0 ? dailyCompleted / dailyTotal : 0;

  // Calories and protein
  const totalKcal = todayMeals.reduce((sum, m) => sum + safeParseInt(m?.kcal, 0), 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + safeParseInt(m?.protein, 0), 0);

  // Weight
  const currentWeight = safeParseFloat(state.currentWeight, 72);
  const startWeight = safeParseFloat(state.weightGoal?.start, 72);
  const targetWeight = safeParseFloat(state.weightGoal?.target, 60);
  const weightLost = startWeight - currentWeight;
  const totalToLose = startWeight - targetWeight;
  const weightProgress = totalToLose > 0 ? Math.min(Math.max((weightLost / totalToLose) * 100, 0), 100) : 0;

  // Week calculation
  const getWeekNumber = () => {
    try {
      const start = new Date(state.startDate || getTodayKey());
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 12);
    } catch (e) {
      return 1;
    }
  };

  const weekNumber = getWeekNumber();

  // Phase
  const getPhase = () => {
    if (weekNumber <= 4) return { name: 'Fundamenty', color: 'bg-blue-500' };
    if (weekNumber <= 8) return { name: 'Zaawansowane', color: 'bg-purple-500' };
    return { name: 'Portfolio & Rekrutacja', color: 'bg-green-500' };
  };

  const phase = getPhase();

  // Get completion rate for any day
  const getDayCompletion = (dateKey) => {
    try {
      const dayTasks = state.dailyHistory?.[dateKey] || {};
      const completed = DAILY_TASKS.filter(t => dayTasks[t.key]).length;
      return DAILY_TASKS.length > 0 ? completed / DAILY_TASKS.length : 0;
    } catch (e) {
      return 0;
    }
  };

  // Schedule completion
  const scheduleCompleted = todaySchedule.filter(t => t.done).length;
  const scheduleTotal = todaySchedule.length;
  const scheduleCompletionRate = scheduleTotal > 0 ? scheduleCompleted / scheduleTotal : 0;

  // Skills progress
  const skills = state.skills || defaultSkills;
  const skillsCompleted = skills.filter(s => s.done).length;
  const skillsTotal = skills.length;

  // Projects progress
  const projects = state.projects || defaultProjects;
  const projectsDone = projects.filter(p => p.status === 'done').length;
  const projectsInProgress = projects.filter(p => p.status === 'inprogress').length;
  const projectsTotal = projects.length;

  // English progress
  const englishTopics = state.englishTopics || defaultEnglishTopics;
  const englishCompleted = englishTopics.filter(t => t.done).length;
  const englishTotal = englishTopics.length;

  // Weekly weight goal
  const weeklyWeightGoal = () => {
    const weeklyTarget = totalToLose / 12;
    const expectedLoss = weeklyTarget * weekNumber;
    const goalWeight = startWeight - expectedLoss;
    const isOnTrack = currentWeight <= goalWeight + 0.5;
    return {
      weeklyTarget: weeklyTarget.toFixed(2),
      expectedLoss: expectedLoss.toFixed(1),
      goalWeight: goalWeight.toFixed(1),
      isOnTrack,
      remainingToGoal: (currentWeight - targetWeight).toFixed(1)
    };
  };

  // Perfect day check
  const isPerfectDay = dailyCompleted === dailyTotal &&
                       totalKcal >= 1400 && totalKcal <= 1600 &&
                       scheduleCompleted === scheduleTotal && scheduleTotal > 0;

  return {
    // Daily
    dailyCompleted,
    dailyTotal,
    dailyCompletionRate,

    // Meals
    totalKcal,
    totalProtein,

    // Weight
    currentWeight,
    startWeight,
    targetWeight,
    weightLost,
    totalToLose,
    weightProgress,

    // Week & Phase
    weekNumber,
    phase,

    // Helpers
    getDayCompletion,

    // Schedule
    scheduleCompleted,
    scheduleTotal,
    scheduleCompletionRate,

    // Skills
    skills,
    skillsCompleted,
    skillsTotal,

    // Projects
    projects,
    projectsDone,
    projectsInProgress,
    projectsTotal,

    // English
    englishTopics,
    englishCompleted,
    englishTotal,

    // Weekly goals
    weeklyWeightGoal,

    // Achievement
    isPerfectDay,
  };
}
