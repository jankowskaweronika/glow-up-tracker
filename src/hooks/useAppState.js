import { useState, useEffect, useCallback } from 'react';
import { initialState, defaultSkills, defaultProjects, defaultEnglishTopics } from '../constants';
import { getTodayKey, getYesterdayKey, safeParseFloat, safeParseInt } from '../utils';
import { useSupabaseSync } from './useSupabaseSync';

export function useAppState() {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  // Supabase sync
  const {
    shouldUseSupabase,
    loadFromSupabase,
    saveWeight,
    saveDailyTask,
    addMealToDb,
    removeMealFromDb,
    addScheduleTaskToDb,
    updateScheduleTaskInDb,
    removeScheduleTaskFromDb,
    copyScheduleToDb,
    saveSkillToDb,
    removeSkillFromDb,
    saveProjectToDb,
    removeProjectFromDb,
    saveEnglishTopicToDb,
    removeEnglishTopicFromDb,
    saveNoteToDb,
    saveWeightGoalToDb,
    resetUserData,
  } = useSupabaseSync();

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
      setIsLoading(true);
      try {
        // Próbuj załadować z Supabase jeśli dostępne
        if (shouldUseSupabase) {
          const supabaseData = await loadFromSupabase();
          if (supabaseData) {
            setState(supabaseData);
            setIsLoading(false);
            return;
          }
        }

        // Fallback do localStorage
        const saved = await window.storage?.get('glow-up-tracker-v2');
        if (saved?.value) {
          const parsed = JSON.parse(saved.value);
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
  }, [showNotification, shouldUseSupabase, loadFromSupabase]);

  // Save state to localStorage (backup)
  const saveToLocalStorage = async (newState) => {
    try {
      await window.storage?.set('glow-up-tracker-v2', JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Save state
  const saveState = async (newState) => {
    if (!newState || typeof newState !== 'object') {
      showNotification('Błąd: nieprawidłowe dane', 'error');
      return;
    }

    setState(newState);
    setSaveStatus('saving');

    try {
      // Zawsze zapisz do localStorage jako backup
      await saveToLocalStorage(newState);
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
  const toggleDailyTask = async (taskKey) => {
    const todayTasks = getTodayTasks();
    const newCompleted = !todayTasks[taskKey];

    const newState = {
      ...state,
      dailyHistory: {
        ...state.dailyHistory,
        [todayKey]: {
          ...todayTasks,
          [taskKey]: newCompleted
        }
      }
    };

    saveState(newState);

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await saveDailyTask(todayKey, taskKey, newCompleted);
      } catch (e) {
        console.error('Error syncing daily task:', e);
      }
    }
  };

  // Meals management
  const addMeal = async (newMeal) => {
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
    let mealId = Date.now();

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        mealId = await addMealToDb(todayKey, {
          name,
          kcal,
          protein: safeParseInt(newMeal.protein, 0),
        });
      } catch (e) {
        console.error('Error adding meal to DB:', e);
      }
    }

    saveState({
      ...state,
      meals: {
        ...state.meals,
        [todayKey]: [...todayMeals, {
          id: mealId,
          name: name,
          kcal: kcal,
          protein: safeParseInt(newMeal.protein, 0)
        }]
      }
    });
    showNotification('Posiłek dodany!', 'success');
    return true;
  };

  const removeMeal = async (mealId) => {
    const todayMeals = getTodayMeals().filter(m => m.id !== mealId);

    saveState({
      ...state,
      meals: {
        ...state.meals,
        [todayKey]: todayMeals
      }
    });

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await removeMealFromDb(mealId);
      } catch (e) {
        console.error('Error removing meal from DB:', e);
      }
    }
  };

  // Schedule management
  const addScheduleTask = async (newTask) => {
    const name = (newTask.name || '').trim();

    if (!name) {
      showNotification('Wpisz nazwę zadania', 'warning');
      return false;
    }

    const todaySchedule = getTodaySchedule();
    let taskId = Date.now();

    const task = {
      id: taskId,
      name: name,
      startTime: newTask.startTime || '12:00',
      endTime: newTask.endTime || '13:00',
      category: newTask.category || 'other',
      done: false
    };

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        taskId = await addScheduleTaskToDb(todayKey, task);
        task.id = taskId;
      } catch (e) {
        console.error('Error adding schedule task to DB:', e);
      }
    }

    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: [...todaySchedule, task].sort((a, b) =>
          (a.startTime || '').localeCompare(b.startTime || ''))
      }
    });
    showNotification('Zadanie dodane!', 'success');
    return true;
  };

  const toggleScheduleTask = async (taskId) => {
    const todaySchedule = getTodaySchedule();
    const task = todaySchedule.find(t => t.id === taskId);
    const newDone = task ? !task.done : false;

    const updatedSchedule = todaySchedule.map(t =>
      t.id === taskId ? { ...t, done: newDone } : t
    );

    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: updatedSchedule
      }
    });

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await updateScheduleTaskInDb(taskId, { done: newDone });
      } catch (e) {
        console.error('Error toggling schedule task:', e);
      }
    }
  };

  const removeScheduleTask = async (taskId) => {
    const todaySchedule = getTodaySchedule().filter(t => t.id !== taskId);

    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: todaySchedule
      }
    });

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await removeScheduleTaskFromDb(taskId);
      } catch (e) {
        console.error('Error removing schedule task:', e);
      }
    }
  };

  const copyYesterdaySchedule = async () => {
    const yesterdayTasks = getYesterdaySchedule();

    if (yesterdayTasks.length === 0) {
      showNotification('Brak zadań z wczoraj do skopiowania', 'warning');
      return;
    }

    let newTasks = yesterdayTasks.map(t => ({
      ...t,
      id: Date.now() + Math.random(),
      done: false
    }));

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        const dbTasks = await copyScheduleToDb(yesterdayKey, todayKey, yesterdayTasks);
        if (dbTasks.length > 0) {
          newTasks = dbTasks.map(t => ({
            id: t.id,
            name: t.name,
            startTime: t.start_time?.substring(0, 5),
            endTime: t.end_time?.substring(0, 5),
            category: t.category,
            done: t.done,
          }));
        }
      } catch (e) {
        console.error('Error copying schedule:', e);
      }
    }

    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: newTasks
      }
    });

    showNotification('Skopiowano harmonogram z wczoraj!', 'success');
  };

  // Skills management
  const addSkill = async (skillName) => {
    if (!skillName) return;
    const skills = state.skills || defaultSkills;
    const newSkill = { name: skillName, category: 'other', done: false };

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        const id = await saveSkillToDb(newSkill, skills.length);
        newSkill.id = id;
      } catch (e) {
        console.error('Error adding skill:', e);
      }
    }

    saveState({
      ...state,
      skills: [...skills, newSkill]
    });
  };

  const toggleSkill = async (index) => {
    const skills = [...(state.skills || defaultSkills)];
    skills[index] = { ...skills[index], done: !skills[index].done };

    saveState({ ...state, skills });

    // Sync z Supabase
    if (shouldUseSupabase && skills[index].id) {
      try {
        await saveSkillToDb(skills[index], index);
      } catch (e) {
        console.error('Error toggling skill:', e);
      }
    }
  };

  const removeSkill = async (index) => {
    const skills = state.skills || defaultSkills;
    const skill = skills[index];
    const newSkills = skills.filter((_, i) => i !== index);

    saveState({ ...state, skills: newSkills });

    // Sync z Supabase
    if (shouldUseSupabase && skill?.id) {
      try {
        await removeSkillFromDb(skill.id);
      } catch (e) {
        console.error('Error removing skill:', e);
      }
    }
  };

  // Projects management
  const addProject = async (projectName) => {
    if (!projectName) return;
    const projects = state.projects || defaultProjects;
    const newProject = { name: projectName, status: 'todo', tech: [] };

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        const id = await saveProjectToDb(newProject, projects.length);
        newProject.id = id;
      } catch (e) {
        console.error('Error adding project:', e);
      }
    }

    saveState({
      ...state,
      projects: [...projects, newProject]
    });
  };

  const updateProjectStatus = async (index, status) => {
    const projects = [...(state.projects || defaultProjects)];
    projects[index] = { ...projects[index], status };

    saveState({ ...state, projects });

    // Sync z Supabase
    if (shouldUseSupabase && projects[index].id) {
      try {
        await saveProjectToDb(projects[index], index);
      } catch (e) {
        console.error('Error updating project:', e);
      }
    }
  };

  const removeProject = async (index) => {
    const projects = state.projects || defaultProjects;
    const project = projects[index];
    const newProjects = projects.filter((_, i) => i !== index);

    saveState({ ...state, projects: newProjects });

    // Sync z Supabase
    if (shouldUseSupabase && project?.id) {
      try {
        await removeProjectFromDb(project.id);
      } catch (e) {
        console.error('Error removing project:', e);
      }
    }
  };

  // English topics management
  const addEnglishTopic = async (topicName) => {
    if (!topicName) return;
    const topics = state.englishTopics || defaultEnglishTopics;
    const newTopic = { name: topicName, done: false };

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        const id = await saveEnglishTopicToDb(newTopic, topics.length);
        newTopic.id = id;
      } catch (e) {
        console.error('Error adding english topic:', e);
      }
    }

    saveState({
      ...state,
      englishTopics: [...topics, newTopic]
    });
  };

  const toggleEnglishTopic = async (index) => {
    const topics = [...(state.englishTopics || defaultEnglishTopics)];
    topics[index] = { ...topics[index], done: !topics[index].done };

    saveState({ ...state, englishTopics: topics });

    // Sync z Supabase
    if (shouldUseSupabase && topics[index].id) {
      try {
        await saveEnglishTopicToDb(topics[index], index);
      } catch (e) {
        console.error('Error toggling english topic:', e);
      }
    }
  };

  const removeEnglishTopic = async (index) => {
    const topics = state.englishTopics || defaultEnglishTopics;
    const topic = topics[index];
    const newTopics = topics.filter((_, i) => i !== index);

    saveState({ ...state, englishTopics: newTopics });

    // Sync z Supabase
    if (shouldUseSupabase && topic?.id) {
      try {
        await removeEnglishTopicFromDb(topic.id);
      } catch (e) {
        console.error('Error removing english topic:', e);
      }
    }
  };

  // Weight management
  const updateWeight = async (weight) => {
    saveState({
      ...state,
      currentWeight: weight,
      weightHistory: {
        ...state.weightHistory,
        [todayKey]: weight
      }
    });

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await saveWeight(todayKey, weight);
      } catch (e) {
        console.error('Error saving weight:', e);
      }
    }
  };

  // Notes management
  const updateNotes = async (field, value) => {
    saveState({
      ...state,
      notes: {
        ...state.notes,
        [field]: value
      }
    });

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await saveNoteToDb(field, null, value);
      } catch (e) {
        console.error('Error saving note:', e);
      }
    }
  };

  const updateWeeklyPlan = async (weekKey, value) => {
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

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await saveNoteToDb('weekly', weekKey, value);
      } catch (e) {
        console.error('Error saving weekly plan:', e);
      }
    }
  };

  const updateDailyNote = async (dateKey, value) => {
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

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await saveNoteToDb('daily', dateKey, value);
      } catch (e) {
        console.error('Error saving daily note:', e);
      }
    }
  };

  // Weight goal management
  const updateWeightGoal = async (field, value) => {
    saveState({
      ...state,
      weightGoal: {
        ...state.weightGoal,
        [field]: value
      }
    });

    // Sync z Supabase
    if (shouldUseSupabase) {
      try {
        await saveWeightGoalToDb(field, value);
      } catch (e) {
        console.error('Error saving weight goal:', e);
      }
    }
  };

  // Reset all data
  const resetAll = async () => {
    const confirmed = window.confirm('Na pewno chcesz zresetowac CALY postep?\n\nTo usunie:\n- Wszystkie zadania\n- Historie wagi\n- Posilki\n- Notatki\n- Postepy w nauce\n\nTej operacji nie mozna cofnac!');

    if (confirmed) {
      const newState = {
        ...initialState,
        startDate: getTodayKey()
      };

      saveState(newState);

      // Sync z Supabase
      if (shouldUseSupabase) {
        try {
          await resetUserData();
        } catch (e) {
          console.error('Error resetting user data:', e);
        }
      }

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
