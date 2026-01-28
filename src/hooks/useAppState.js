import { useState, useEffect, useCallback } from 'react';
import { initialState, defaultSkills, defaultProjects, defaultEnglishTopics } from '../constants';
import { getTodayKey, getYesterdayKey, safeParseFloat, safeParseInt } from '../utils';

export function useAppState() {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  // Notification handlers
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/data', { credentials: 'include' });
        if (res.ok) {
          const parsed = await res.json();
          if (parsed && typeof parsed === 'object') {
            setState(prev => ({
              ...prev,
              ...parsed,
              currentWeight: safeParseFloat(parsed.currentWeight, 72),
              dailyHistory: parsed.dailyHistory || {},
              meals: parsed.meals || {},
              schedule: parsed.schedule || {},
              weightHistory: parsed.weightHistory || {},
              notes: parsed.notes || initialState.notes,
            }));
          }
        }
      } catch (e) {
        console.error('Error loading data:', e);
        showNotification('Nie udało się wczytać danych. Zaczynamy od nowa.', 'warning');
      }
      setIsLoading(false);
    };
    loadData();
  }, [showNotification]);

  // Save state to storage
  const saveState = async (newState) => {
    if (!newState || typeof newState !== 'object') {
      showNotification('Błąd: nieprawidłowe dane', 'error');
      return;
    }

    setState(newState);
    setSaveStatus('saving');

    try {
      const res = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newState),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save:', e);
      setSaveStatus('error');
      showNotification('Nie udało się zapisać zmian!', 'error');
    }
  };

  // Data getters
  const getTodayTasks = () => state.dailyHistory?.[todayKey] || {};

  const getTodayMeals = () => {
    const meals = state.meals?.[todayKey];
    return Array.isArray(meals) ? meals : [];
  };

  const getTodaySchedule = () => {
    const schedule = state.schedule?.[todayKey];
    if (!Array.isArray(schedule)) return [];
    return [...schedule].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  };

  const getYesterdaySchedule = () => {
    const schedule = state.schedule?.[yesterdayKey];
    return Array.isArray(schedule) ? schedule : [];
  };

  // Daily tasks
  const toggleDailyTask = (taskKey) => {
    const todayTasks = getTodayTasks();
    saveState({
      ...state,
      dailyHistory: {
        ...state.dailyHistory,
        [todayKey]: {
          ...todayTasks,
          [taskKey]: !todayTasks[taskKey]
        }
      }
    });
  };

  // Meals management
  const addMeal = (newMeal) => {
    const name = (newMeal.name || '').trim();
    const kcal = safeParseInt(newMeal.kcal, 0);

    if (!name) {
      showNotification('Wpisz nazwę posiłku', 'warning');
      return false;
    }
    if (kcal <= 0) {
      showNotification('Wpisz poprawną liczbę kalorii', 'warning');
      return false;
    }

    const todayMeals = getTodayMeals();
    saveState({
      ...state,
      meals: {
        ...state.meals,
        [todayKey]: [...todayMeals, {
          id: Date.now(),
          name: name,
          kcal: kcal,
          protein: safeParseInt(newMeal.protein, 0)
        }]
      }
    });
    showNotification('Posiłek dodany! 🍽️', 'success');
    return true;
  };

  const removeMeal = (mealId) => {
    const todayMeals = getTodayMeals().filter(m => m.id !== mealId);
    saveState({
      ...state,
      meals: {
        ...state.meals,
        [todayKey]: todayMeals
      }
    });
  };

  // Schedule management
  const addScheduleTask = (newTask) => {
    const name = (newTask.name || '').trim();

    if (!name) {
      showNotification('Wpisz nazwę zadania', 'warning');
      return false;
    }

    const todaySchedule = getTodaySchedule();
    const task = {
      id: Date.now(),
      name: name,
      startTime: newTask.startTime || '12:00',
      endTime: newTask.endTime || '13:00',
      category: newTask.category || 'other',
      done: false
    };

    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: [...todaySchedule, task].sort((a, b) =>
          (a.startTime || '').localeCompare(b.startTime || ''))
      }
    });
    showNotification('Zadanie dodane! 📅', 'success');
    return true;
  };

  const toggleScheduleTask = (taskId) => {
    const todaySchedule = getTodaySchedule().map(t =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: todaySchedule
      }
    });
  };

  const removeScheduleTask = (taskId) => {
    const todaySchedule = getTodaySchedule().filter(t => t.id !== taskId);
    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: todaySchedule
      }
    });
  };

  const copyYesterdaySchedule = () => {
    const yesterdayTasks = getYesterdaySchedule().map(t => ({
      ...t,
      id: Date.now() + Math.random(),
      done: false
    }));
    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: yesterdayTasks
      }
    });
  };

  // Skills management
  const addSkill = (skillName) => {
    if (!skillName) return;
    const skills = state.skills || defaultSkills;
    saveState({
      ...state,
      skills: [...skills, { name: skillName, category: 'other', done: false }]
    });
  };

  const toggleSkill = (index) => {
    const skills = [...(state.skills || defaultSkills)];
    skills[index] = { ...skills[index], done: !skills[index].done };
    saveState({ ...state, skills });
  };

  const removeSkill = (index) => {
    const skills = (state.skills || defaultSkills).filter((_, i) => i !== index);
    saveState({ ...state, skills });
  };

  // Projects management
  const addProject = (projectName) => {
    if (!projectName) return;
    const projects = state.projects || defaultProjects;
    saveState({
      ...state,
      projects: [...projects, { name: projectName, status: 'todo', tech: [] }]
    });
  };

  const updateProjectStatus = (index, status) => {
    const projects = [...(state.projects || defaultProjects)];
    projects[index] = { ...projects[index], status };
    saveState({ ...state, projects });
  };

  const removeProject = (index) => {
    const projects = (state.projects || defaultProjects).filter((_, i) => i !== index);
    saveState({ ...state, projects });
  };

  // English topics management
  const addEnglishTopic = (topicName) => {
    if (!topicName) return;
    const topics = state.englishTopics || defaultEnglishTopics;
    saveState({
      ...state,
      englishTopics: [...topics, { name: topicName, done: false }]
    });
  };

  const toggleEnglishTopic = (index) => {
    const topics = [...(state.englishTopics || defaultEnglishTopics)];
    topics[index] = { ...topics[index], done: !topics[index].done };
    saveState({ ...state, englishTopics: topics });
  };

  const removeEnglishTopic = (index) => {
    const topics = (state.englishTopics || defaultEnglishTopics).filter((_, i) => i !== index);
    saveState({ ...state, englishTopics: topics });
  };

  // Weight management
  const updateWeight = (weight) => {
    saveState({
      ...state,
      currentWeight: weight,
      weightHistory: {
        ...state.weightHistory,
        [todayKey]: weight
      }
    });
  };

  // Notes management
  const updateNotes = (field, value) => {
    saveState({
      ...state,
      notes: {
        ...state.notes,
        [field]: value
      }
    });
  };

  const updateWeeklyPlan = (weekKey, value) => {
    saveState({
      ...state,
      notes: {
        ...state.notes,
        weeklyPlans: {
          ...state.notes.weeklyPlans,
          [weekKey]: value
        }
      }
    });
  };

  const updateDailyNote = (dateKey, value) => {
    saveState({
      ...state,
      notes: {
        ...state.notes,
        daily: {
          ...state.notes.daily,
          [dateKey]: value
        }
      }
    });
  };

  // Weight goal management
  const updateWeightGoal = (field, value) => {
    saveState({
      ...state,
      weightGoal: {
        ...state.weightGoal,
        [field]: value
      }
    });
  };

  // Reset all data
  const resetAll = () => {
    const confirmed = window.confirm('⚠️ Na pewno chcesz zresetować CAŁY postęp?\n\nTo usunie:\n• Wszystkie zadania\n• Historię wagi\n• Posiłki\n• Notatki\n• Postępy w nauce\n\nTej operacji nie można cofnąć!');

    if (confirmed) {
      saveState({
        ...initialState,
        startDate: getTodayKey()
      });
      showNotification('Dane zostały zresetowane', 'info');
    }
  };

  return {
    // State
    state,
    isLoading,
    notification,
    saveStatus,
    todayKey,
    yesterdayKey,

    // Notification
    showNotification,
    hideNotification,

    // Data getters
    getTodayTasks,
    getTodayMeals,
    getTodaySchedule,
    getYesterdaySchedule,

    // Daily tasks
    toggleDailyTask,

    // Meals
    addMeal,
    removeMeal,

    // Schedule
    addScheduleTask,
    toggleScheduleTask,
    removeScheduleTask,
    copyYesterdaySchedule,

    // Skills
    addSkill,
    toggleSkill,
    removeSkill,

    // Projects
    addProject,
    updateProjectStatus,
    removeProject,

    // English
    addEnglishTopic,
    toggleEnglishTopic,
    removeEnglishTopic,

    // Weight
    updateWeight,
    updateWeightGoal,

    // Notes
    updateNotes,
    updateWeeklyPlan,
    updateDailyNote,

    // Reset
    resetAll,

    // Raw save for custom updates
    saveState,
  };
}
