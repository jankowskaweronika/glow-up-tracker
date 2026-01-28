import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { defaultSkills, defaultProjects, defaultEnglishTopics } from '../constants';

export function useSupabaseSync() {
  const { user, isAuthenticated, isConfigured } = useAuth();

  const shouldUseSupabase = isConfigured && isAuthenticated && user;

  // ============================================
  // POBIERANIE DANYCH Z SUPABASE
  // ============================================

  const loadFromSupabase = useCallback(async () => {
    if (!shouldUseSupabase) return null;

    try {
      const userId = user.id;

      // Pobierz wszystkie dane równolegle
      const [
        profileRes,
        weightGoalRes,
        weightHistoryRes,
        dailyTasksRes,
        mealsRes,
        scheduleRes,
        skillsRes,
        projectsRes,
        englishTopicsRes,
        notesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('weight_goals').select('*').eq('user_id', userId).single(),
        supabase.from('weight_history').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('daily_tasks').select('*').eq('user_id', userId),
        supabase.from('meals').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('schedule').select('*').eq('user_id', userId).order('start_time', { ascending: true }),
        supabase.from('skills').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
        supabase.from('projects').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
        supabase.from('english_topics').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
        supabase.from('notes').select('*').eq('user_id', userId),
      ]);

      // Przekształć dane do formatu aplikacji
      const profile = profileRes.data;
      const weightGoal = weightGoalRes.data;

      // Weight history: { "2024-01-15": 72.5, ... }
      const weightHistory = {};
      (weightHistoryRes.data || []).forEach((w) => {
        weightHistory[w.date] = parseFloat(w.weight);
      });

      // Daily tasks: { "2024-01-15": { exercise: true, english: false, ... }, ... }
      const dailyHistory = {};
      (dailyTasksRes.data || []).forEach((t) => {
        if (!dailyHistory[t.date]) dailyHistory[t.date] = {};
        dailyHistory[t.date][t.task_key] = t.completed;
      });

      // Meals: { "2024-01-15": [{ id, name, kcal, protein }, ...], ... }
      const meals = {};
      (mealsRes.data || []).forEach((m) => {
        if (!meals[m.date]) meals[m.date] = [];
        meals[m.date].push({
          id: m.id,
          name: m.name,
          kcal: m.kcal,
          protein: m.protein,
        });
      });

      // Schedule: { "2024-01-15": [{ id, name, startTime, endTime, category, done }, ...], ... }
      const schedule = {};
      (scheduleRes.data || []).forEach((s) => {
        if (!schedule[s.date]) schedule[s.date] = [];
        schedule[s.date].push({
          id: s.id,
          name: s.name,
          startTime: s.start_time?.substring(0, 5), // "HH:MM"
          endTime: s.end_time?.substring(0, 5),
          category: s.category,
          done: s.done,
        });
      });

      // Skills
      const skills = (skillsRes.data || []).map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        done: s.done,
      }));

      // Projects
      const projects = (projectsRes.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        tech: p.tech || [],
        status: p.status,
      }));

      // English Topics
      const englishTopics = (englishTopicsRes.data || []).map((t) => ({
        id: t.id,
        name: t.name,
        done: t.done,
      }));

      // Notes
      const notes = {
        goals: '',
        projectIdeas: '',
        weeklyPlans: {},
        daily: {},
      };
      (notesRes.data || []).forEach((n) => {
        if (n.note_type === 'goals') notes.goals = n.content;
        else if (n.note_type === 'projectIdeas') notes.projectIdeas = n.content;
        else if (n.note_type === 'weekly') notes.weeklyPlans[n.note_key] = n.content;
        else if (n.note_type === 'daily') notes.daily[n.note_key] = n.content;
      });

      return {
        startDate: profile?.start_date || new Date().toISOString().split('T')[0],
        currentWeight: parseFloat(profile?.current_weight) || 72,
        weightGoal: {
          start: parseFloat(weightGoal?.start_weight) || 72,
          goal: parseFloat(weightGoal?.goal_weight) || 60,
        },
        weightHistory,
        dailyHistory,
        meals,
        schedule,
        skills: skills.length > 0 ? skills : defaultSkills,
        projects: projects.length > 0 ? projects : defaultProjects,
        englishTopics: englishTopics.length > 0 ? englishTopics : defaultEnglishTopics,
        notes,
      };
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      return null;
    }
  }, [shouldUseSupabase, user]);

  // ============================================
  // ZAPISYWANIE DANYCH DO SUPABASE
  // ============================================

  // Zapisz wagę
  const saveWeight = useCallback(
    async (date, weight) => {
      if (!shouldUseSupabase) return;

      await supabase.from('weight_history').upsert(
        { user_id: user.id, date, weight },
        { onConflict: 'user_id,date' }
      );

      await supabase
        .from('profiles')
        .update({ current_weight: weight })
        .eq('id', user.id);
    },
    [shouldUseSupabase, user]
  );

  // Zapisz daily task
  const saveDailyTask = useCallback(
    async (date, taskKey, completed) => {
      if (!shouldUseSupabase) return;

      await supabase.from('daily_tasks').upsert(
        { user_id: user.id, date, task_key: taskKey, completed },
        { onConflict: 'user_id,date,task_key' }
      );
    },
    [shouldUseSupabase, user]
  );

  // Dodaj posiłek
  const addMealToDb = useCallback(
    async (date, meal) => {
      if (!shouldUseSupabase) return null;

      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          date,
          name: meal.name,
          kcal: meal.kcal,
          protein: meal.protein || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    },
    [shouldUseSupabase, user]
  );

  // Usuń posiłek
  const removeMealFromDb = useCallback(
    async (mealId) => {
      if (!shouldUseSupabase) return;

      await supabase.from('meals').delete().eq('id', mealId).eq('user_id', user.id);
    },
    [shouldUseSupabase, user]
  );

  // Dodaj task do harmonogramu
  const addScheduleTaskToDb = useCallback(
    async (date, task) => {
      if (!shouldUseSupabase) return null;

      const { data, error } = await supabase
        .from('schedule')
        .insert({
          user_id: user.id,
          date,
          name: task.name,
          start_time: task.startTime,
          end_time: task.endTime,
          category: task.category || 'other',
          done: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    },
    [shouldUseSupabase, user]
  );

  // Aktualizuj task w harmonogramie
  const updateScheduleTaskInDb = useCallback(
    async (taskId, updates) => {
      if (!shouldUseSupabase) return;

      const dbUpdates = {};
      if (updates.done !== undefined) dbUpdates.done = updates.done;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.category !== undefined) dbUpdates.category = updates.category;

      await supabase
        .from('schedule')
        .update(dbUpdates)
        .eq('id', taskId)
        .eq('user_id', user.id);
    },
    [shouldUseSupabase, user]
  );

  // Usuń task z harmonogramu
  const removeScheduleTaskFromDb = useCallback(
    async (taskId) => {
      if (!shouldUseSupabase) return;

      await supabase.from('schedule').delete().eq('id', taskId).eq('user_id', user.id);
    },
    [shouldUseSupabase, user]
  );

  // Kopiuj harmonogram
  const copyScheduleToDb = useCallback(
    async (fromDate, toDate, tasks) => {
      if (!shouldUseSupabase) return [];

      // Usuń istniejące taski z toDate
      await supabase.from('schedule').delete().eq('user_id', user.id).eq('date', toDate);

      // Dodaj nowe
      const newTasks = tasks.map((t) => ({
        user_id: user.id,
        date: toDate,
        name: t.name,
        start_time: t.startTime,
        end_time: t.endTime,
        category: t.category,
        done: false,
      }));

      const { data } = await supabase.from('schedule').insert(newTasks).select();
      return data || [];
    },
    [shouldUseSupabase, user]
  );

  // Zapisz skill
  const saveSkillToDb = useCallback(
    async (skill, index) => {
      if (!shouldUseSupabase) return null;

      if (skill.id) {
        // Update
        await supabase
          .from('skills')
          .update({ name: skill.name, category: skill.category, done: skill.done })
          .eq('id', skill.id)
          .eq('user_id', user.id);
        return skill.id;
      } else {
        // Insert
        const { data } = await supabase
          .from('skills')
          .insert({
            user_id: user.id,
            name: skill.name,
            category: skill.category || 'other',
            done: skill.done || false,
            sort_order: index,
          })
          .select()
          .single();
        return data?.id;
      }
    },
    [shouldUseSupabase, user]
  );

  // Usuń skill
  const removeSkillFromDb = useCallback(
    async (skillId) => {
      if (!shouldUseSupabase || !skillId) return;

      await supabase.from('skills').delete().eq('id', skillId).eq('user_id', user.id);
    },
    [shouldUseSupabase, user]
  );

  // Zapisz projekt
  const saveProjectToDb = useCallback(
    async (project, index) => {
      if (!shouldUseSupabase) return null;

      if (project.id) {
        await supabase
          .from('projects')
          .update({
            name: project.name,
            description: project.description,
            tech: project.tech,
            status: project.status,
          })
          .eq('id', project.id)
          .eq('user_id', user.id);
        return project.id;
      } else {
        const { data } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            name: project.name,
            description: project.description || '',
            tech: project.tech || [],
            status: project.status || 'todo',
            sort_order: index,
          })
          .select()
          .single();
        return data?.id;
      }
    },
    [shouldUseSupabase, user]
  );

  // Usuń projekt
  const removeProjectFromDb = useCallback(
    async (projectId) => {
      if (!shouldUseSupabase || !projectId) return;

      await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);
    },
    [shouldUseSupabase, user]
  );

  // Zapisz temat angielskiego
  const saveEnglishTopicToDb = useCallback(
    async (topic, index) => {
      if (!shouldUseSupabase) return null;

      if (topic.id) {
        await supabase
          .from('english_topics')
          .update({ name: topic.name, done: topic.done })
          .eq('id', topic.id)
          .eq('user_id', user.id);
        return topic.id;
      } else {
        const { data } = await supabase
          .from('english_topics')
          .insert({
            user_id: user.id,
            name: topic.name,
            done: topic.done || false,
            sort_order: index,
          })
          .select()
          .single();
        return data?.id;
      }
    },
    [shouldUseSupabase, user]
  );

  // Usuń temat angielskiego
  const removeEnglishTopicFromDb = useCallback(
    async (topicId) => {
      if (!shouldUseSupabase || !topicId) return;

      await supabase.from('english_topics').delete().eq('id', topicId).eq('user_id', user.id);
    },
    [shouldUseSupabase, user]
  );

  // Zapisz notatkę
  const saveNoteToDb = useCallback(
    async (noteType, noteKey, content) => {
      if (!shouldUseSupabase) return;

      await supabase.from('notes').upsert(
        {
          user_id: user.id,
          note_type: noteType,
          note_key: noteKey,
          content,
        },
        { onConflict: 'user_id,note_type,note_key' }
      );
    },
    [shouldUseSupabase, user]
  );

  // Zapisz cele wagowe
  const saveWeightGoalToDb = useCallback(
    async (field, value) => {
      if (!shouldUseSupabase) return;

      const update = {};
      if (field === 'start') update.start_weight = value;
      if (field === 'goal') update.goal_weight = value;

      await supabase.from('weight_goals').update(update).eq('user_id', user.id);
    },
    [shouldUseSupabase, user]
  );

  // Resetuj dane użytkownika
  const resetUserData = useCallback(async () => {
    if (!shouldUseSupabase) return;

    // Usuń wszystkie dane użytkownika
    await Promise.all([
      supabase.from('weight_history').delete().eq('user_id', user.id),
      supabase.from('daily_tasks').delete().eq('user_id', user.id),
      supabase.from('meals').delete().eq('user_id', user.id),
      supabase.from('schedule').delete().eq('user_id', user.id),
      supabase.from('skills').delete().eq('user_id', user.id),
      supabase.from('projects').delete().eq('user_id', user.id),
      supabase.from('english_topics').delete().eq('user_id', user.id),
      supabase.from('notes').delete().eq('user_id', user.id),
    ]);

    // Resetuj profil
    await supabase
      .from('profiles')
      .update({ current_weight: 72, start_date: new Date().toISOString().split('T')[0] })
      .eq('id', user.id);

    // Resetuj cele wagowe
    await supabase
      .from('weight_goals')
      .update({ start_weight: 72, goal_weight: 60 })
      .eq('user_id', user.id);
  }, [shouldUseSupabase, user]);

  return {
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
  };
}

export default useSupabaseSync;
