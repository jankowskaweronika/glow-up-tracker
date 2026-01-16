  import React, { useState, useEffect, useCallback } from 'react';

// === STORAGE POLYFILL (for local development) ===
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value ? { key, value } : null;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    }
  };
}

// === UTILITY FUNCTIONS ===
const getTodayKey = () => {
  try {
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return new Date().toLocaleDateString('en-CA'); // fallback format YYYY-MM-DD
  }
};

const getWeekDates = (weeksBack = 0) => {
  try {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 - (weeksBack * 7));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  } catch (e) {
    console.error('Error getting week dates:', e);
    return [];
  }
};

const getLast30Days = () => {
  try {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  } catch (e) {
    console.error('Error getting last 30 days:', e);
    return [];
  }
};

// === SAFE NUMBER PARSING ===
const safeParseFloat = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const safeParseInt = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// === NOTIFICATION COMPONENT ===
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type] || 'bg-slate-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-pulse`}>
      <span>{type === 'success' ? '✔' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">✕</button>
    </div>
  );
};

// === ERROR BOUNDARY ===
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md text-center">
            <p className="text-4xl mb-4">😢</p>
            <h2 className="text-xl font-bold text-white mb-2">Ups! Coś poszło nie tak</h2>
            <p className="text-slate-400 mb-4">Aplikacja napotkała błąd. Spróbuj odświeżyć stronę.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-500 text-white px-6 py-2 rounded-xl hover:bg-purple-600"
            >
              Odśwież stronę
            </button>
            <button
              onClick={() => {
                if (confirm('Czy chcesz zresetować aplikację? To usunie wszystkie dane!')) {
                  window.storage?.delete('glow-up-tracker-v2');
                  window.location.reload();
                }
              }}
              className="block mx-auto mt-3 text-red-400 text-sm hover:text-red-300"
            >
              Resetuj aplikację (ostateczność)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const initialState = {
  startDate: getTodayKey(),
  currentWeight: 72,
  weightHistory: {},
  dailyHistory: {},
  meals: {},
  schedule: {},
  notes: {
    goals: '',
    projectIdeas: '',
    weeklyPlans: {},
    daily: {}
  },
  weeklyTasks: {
    frontend: { hoursCompleted: 0, projectProgress: false, githubStreak: false },
    english: { hoursCompleted: 0, newWords: 0, mockTest: false },
    health: { exerciseDays: 0 },
    work: { applicationsCount: 0, linkedinUpdated: false }
  }
};

const DAILY_TASKS = [
  { key: 'exercise', icon: '🏃', label: 'Ćwiczenia (20 min)' },
  { key: 'english', icon: '🇬🇧', label: 'Angielski (1h)' },
  { key: 'codingTheory', icon: '📖', label: 'Coding: Teoria/Kurs (1h)' },
  { key: 'codingPractice', icon: '💻', label: 'Coding: Projekt/Portfolio (1.5h)' },
  { key: 'water', icon: '💧', label: 'Woda 2L' }
];

const defaultSkills = [
  { name: 'React Hooks (useState, useEffect)', category: 'react', done: false },
  { name: 'useReducer, useCallback, useMemo', category: 'react', done: false },
  { name: 'Custom Hooks', category: 'react', done: false },
  { name: 'React Context API', category: 'react', done: false },
  { name: 'TypeScript basics', category: 'typescript', done: false },
  { name: 'TypeScript generyki', category: 'typescript', done: false },
  { name: 'TypeScript utility types', category: 'typescript', done: false },
  { name: 'Zustand / Redux Toolkit', category: 'react', done: false },
  { name: 'React Query / TanStack Query', category: 'react', done: false },
  { name: 'Next.js App Router', category: 'nextjs', done: false },
  { name: 'Next.js Server Components', category: 'nextjs', done: false },
  { name: 'Next.js API Routes', category: 'nextjs', done: false },
  { name: 'SSR vs SSG vs ISR', category: 'nextjs', done: false },
  { name: 'Jest - unit testing', category: 'testing', done: false },
  { name: 'React Testing Library', category: 'testing', done: false },
  { name: 'Cypress basics', category: 'testing', done: false },
  { name: 'Performance - lazy loading', category: 'other', done: false },
  { name: 'Performance - code splitting', category: 'other', done: false },
  { name: 'Git - rebase, cherry-pick', category: 'other', done: false },
  { name: 'REST API best practices', category: 'other', done: false },
  { name: 'Authentication (JWT, OAuth)', category: 'other', done: false },
];

const defaultProjects = [
  { name: 'Dashboard z API', description: 'Filtry, sortowanie, paginacja', tech: ['React', 'TypeScript', 'API'], status: 'todo' },
  { name: 'Fullstack App z Auth', description: 'Next.js + logowanie/rejestracja', tech: ['Next.js', 'Auth', 'DB'], status: 'todo' },
  { name: 'E-commerce / Sklep', description: 'Koszyk, produkty, checkout', tech: ['React', 'Zustand', 'Stripe'], status: 'todo' },
  { name: 'Portfolio Website', description: 'Strona osobista z projektami', tech: ['Next.js', 'Tailwind'], status: 'todo' },
];

const defaultEnglishTopics = [
  { name: 'Conditionals (0, 1, 2, 3, mixed)', done: false },
  { name: 'Reported Speech', done: false },
  { name: 'Passive Voice', done: false },
  { name: 'Modal Verbs (advanced)', done: false },
  { name: 'Relative Clauses', done: false },
  { name: 'Phrasal Verbs (100 najważniejszych)', done: false },
  { name: 'Collocations', done: false },
  { name: 'Linking words & connectors', done: false },
  { name: 'Formal vs Informal writing', done: false },
  { name: 'Reading comprehension strategies', done: false },
  { name: 'Listening - różne akcenty', done: false },
  { name: 'Speaking - IT vocabulary', done: false },
  { name: 'Writing - emails & reports', done: false },
];

function GlowUpTrackerInner() {
  const [state, setState] = useState(initialState);
  const [activeTab, setActiveTab] = useState('today');
  const [newMeal, setNewMeal] = useState({ name: '', kcal: '', protein: '' });
  const [newScheduleTask, setNewScheduleTask] = useState({ name: '', startTime: '17:00', endTime: '18:00', category: 'frontend' });
  const [newSkill, setNewSkill] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newEnglishTopic, setNewEnglishTopic] = useState('');
  const [showMotivation, setShowMotivation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const todayKey = getTodayKey();
  const yesterdayKey = (() => {
    try {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  })();

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await window.storage?.get('glow-up-tracker-v2');
        if (saved?.value) {
          const parsed = JSON.parse(saved.value);
          // Walidacja danych
          if (parsed && typeof parsed === 'object') {
            setState(prev => ({ 
              ...prev, 
              ...parsed,
              // Upewnij się że krytyczne pola istnieją
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

  const saveState = async (newState) => {
    // Walidacja przed zapisem
    if (!newState || typeof newState !== 'object') {
      showNotification('Błąd: nieprawidłowe dane', 'error');
      return;
    }

    setState(newState);
    setSaveStatus('saving');
    
    try {
      await window.storage?.set('glow-up-tracker-v2', JSON.stringify(newState));
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save:', e);
      setSaveStatus('error');
      showNotification('Nie udało się zapisać zmian!', 'error');
    }
  };

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

  const toggleDailyTask = (taskKey) => {
    const todayTasks = getTodayTasks();
    const newState = {
      ...state,
      dailyHistory: {
        ...state.dailyHistory,
        [todayKey]: {
          ...todayTasks,
          [taskKey]: !todayTasks[taskKey]
        }
      }
    };
    saveState(newState);
  };

  const addMeal = () => {
    const name = (newMeal.name || '').trim();
    const kcal = safeParseInt(newMeal.kcal, 0);
    
    if (!name) {
      showNotification('Wpisz nazwę posiłku', 'warning');
      return;
    }
    if (kcal <= 0) {
      showNotification('Wpisz poprawną liczbę kalorii', 'warning');
      return;
    }
    
    const todayMeals = getTodayMeals();
    const newState = {
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
    };
    saveState(newState);
    setNewMeal({ name: '', kcal: '', protein: '' });
    showNotification('Posiłek dodany! 🍽️', 'success');
  };

  const removeMeal = (mealId) => {
    const todayMeals = getTodayMeals().filter(m => m.id !== mealId);
    const newState = {
      ...state,
      meals: {
        ...state.meals,
        [todayKey]: todayMeals
      }
    };
    saveState(newState);
  };

  const addScheduleTask = () => {
    const name = (newScheduleTask.name || '').trim();
    
    if (!name) {
      showNotification('Wpisz nazwę zadania', 'warning');
      return;
    }
    
    const todaySchedule = getTodaySchedule();
    const newTask = {
      id: Date.now(),
      name: name,
      startTime: newScheduleTask.startTime || '12:00',
      endTime: newScheduleTask.endTime || '13:00',
      category: newScheduleTask.category || 'other',
      done: false
    };
    const newState = {
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: [...todaySchedule, newTask].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
      }
    };
    saveState(newState);
    setNewScheduleTask({ name: '', startTime: '17:00', endTime: '18:00', category: 'frontend' });
    showNotification('Zadanie dodane! 📅', 'success');
  };

  const toggleScheduleTask = (taskId) => {
    const todaySchedule = getTodaySchedule().map(t => 
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    const newState = {
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: todaySchedule
      }
    };
    saveState(newState);
  };

  const removeScheduleTask = (taskId) => {
    const todaySchedule = getTodaySchedule().filter(t => t.id !== taskId);
    const newState = {
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: todaySchedule
      }
    };
    saveState(newState);
  };

  // Skills management
  const addSkill = () => {
    if (!newSkill) return;
    const skills = state.skills || defaultSkills;
    saveState({
      ...state,
      skills: [...skills, { name: newSkill, category: 'other', done: false }]
    });
    setNewSkill('');
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
  const addProject = () => {
    if (!newProject) return;
    const projects = state.projects || defaultProjects;
    saveState({
      ...state,
      projects: [...projects, { name: newProject, status: 'todo', tech: [] }]
    });
    setNewProject('');
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
  const addEnglishTopic = () => {
    if (!newEnglishTopic) return;
    const topics = state.englishTopics || defaultEnglishTopics;
    saveState({
      ...state,
      englishTopics: [...topics, { name: newEnglishTopic, done: false }]
    });
    setNewEnglishTopic('');
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

  const updateWeight = (weight) => {
    const newState = {
      ...state,
      currentWeight: weight,
      weightHistory: {
        ...state.weightHistory,
        [todayKey]: weight
      }
    };
    saveState(newState);
  };

  const updateWeeklyTask = (category, field, value) => {
    const newState = {
      ...state,
      weeklyTasks: {
        ...state.weeklyTasks,
        [category]: {
          ...state.weeklyTasks[category],
          [field]: value
        }
      }
    };
    saveState(newState);
  };

  const resetAll = () => {
    const confirmed = window.confirm('⚠️ Na pewno chcesz zresetować CAÅY postęp?\n\nTo usunie:\n• Wszystkie zadania\n• Historię wagi\n• Posiłki\n• Notatki\n• Postępy w nauce\n\nTej operacji nie można cofnąć!');
    
    if (confirmed) {
      saveState({
        ...initialState,
        startDate: getTodayKey()
      });
      showNotification('Dane zostały zresetowane', 'info');
    }
  };

  // Calculations with safe defaults
  const todayTasks = getTodayTasks();
  const todayMeals = getTodayMeals();
  const dailyCompleted = DAILY_TASKS.filter(t => todayTasks[t.key]).length;
  const totalKcal = todayMeals.reduce((sum, m) => sum + safeParseInt(m?.kcal, 0), 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + safeParseInt(m?.protein, 0), 0);
  const currentWeight = safeParseFloat(state.currentWeight, 72);
  const startWeight = safeParseFloat(state.weightGoal?.start, 72);
  const weightLost = startWeight - currentWeight;
  const weightProgress = Math.min(Math.max((weightLost / 12) * 100, 0), 100);

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

  const getPhase = () => {
    if (weekNumber <= 4) return { name: 'Fundamenty', color: 'bg-blue-500' };
    if (weekNumber <= 8) return { name: 'Zaawansowane', color: 'bg-purple-500' };
    return { name: 'Portfolio & Rekrutacja', color: 'bg-green-500' };
  };

  const phase = getPhase();

  // Get completion rate for a specific day
  const getDayCompletion = (dateKey) => {
    try {
      const dayTasks = state.dailyHistory?.[dateKey] || {};
      const completed = DAILY_TASKS.filter(t => dayTasks[t.key]).length;
      return DAILY_TASKS.length > 0 ? completed / DAILY_TASKS.length : 0;
    } catch (e) {
      return 0;
    }
  };

  const motivationalQuotes = [
    "Każdy ekspert był kiedyś początkującym. 💪",
    "Nie chodzi o to, by być najlepszą. Chodzi o to, by być lepszą niż wczoraj.",
    "Za 3 miesiące podziękujesz sobie za to, że zaczęłaś dziś.",
    "Sukces to suma małych wysiłków powtarzanych każdego dnia.",
    "Twoja jedyna konkurencja to Ty z wczoraj.",
    "Małe kroki prowadzą do wielkich zmian.",
    "Dyscyplina to wybieranie między tym, czego chcesz teraz, a tym, czego chcesz najbardziej."
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">✨</div>
          <div className="text-white text-xl">Åadowanie...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 pb-20">
      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={hideNotification} 
        />
      )}
      
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            ✨ 3-Month Glow Up ✨
          </h1>
          <p className="text-slate-400 mt-1">Frontend • English B2 • Fitness</p>
          {/* Save status indicator */}
          <div className="flex justify-center items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              saveStatus === 'saved' ? 'bg-green-500' :
              saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-slate-500">
              {saveStatus === 'saved' ? 'Zapisano' :
               saveStatus === 'saving' ? 'Zapisywanie...' :
               'Błąd zapisu'}
            </span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 backdrop-blur">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className={`${phase.color} text-xs px-2 py-1 rounded-full`}>
                {phase.name}
              </span>
              <h2 className="text-xl font-semibold mt-1">Tydzień {weekNumber}/12</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{state.currentWeight} kg</p>
              <p className="text-xs text-slate-400">cel: 60 kg</p>
            </div>
          </div>
          
          {/* Weight Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>72 kg</span>
              <span className="text-green-400">-{weightLost.toFixed(1)} kg</span>
              <span>60 kg</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                style={{ width: `${weightProgress}%` }}
              />
            </div>
          </div>

          {/* Week Progress */}
          <div className="flex gap-1 mt-3">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < weekNumber - 1 ? 'bg-green-500' : 
                  i === weekNumber - 1 ? 'bg-yellow-500 animate-pulse' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'today', label: '📅 Dziś' },
            { id: 'schedule', label: '⏰ Plan dnia' },
            { id: 'food', label: '🍽️ Posiłki' },
            { id: 'history', label: '📊 Historia' },
            { id: 'week', label: '📈 Tydzień' },
            { id: 'plan', label: '📝 Cele' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TODAY TAB */}
        {activeTab === 'today' && (
          <div className="space-y-3">
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Stałe nawyki</h3>
                <span className="text-sm bg-slate-700 px-2 py-1 rounded-full">
                  {dailyCompleted}/{DAILY_TASKS.length}
                </span>
              </div>
              
              {DAILY_TASKS.map(task => (
                <button
                  key={task.key}
                  onClick={() => toggleDailyTask(task.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all ${
                    todayTasks[task.key]
                      ? 'bg-green-500/20 border border-green-500/50'
                      : 'bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-2xl">{task.icon}</span>
                  <div className="flex-1 text-left">
                    <p className={todayTasks[task.key] ? 'line-through text-slate-400' : ''}>
                      {task.label}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    todayTasks[task.key] 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-slate-500'
                  }`}>
                    {todayTasks[task.key] && <span className="text-xs">✔</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* Tasks from Schedule */}
            {getTodaySchedule().length > 0 && (
              <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">📅 Plan na dziś</h3>
                  <span className="text-sm bg-slate-700 px-2 py-1 rounded-full">
                    {getTodaySchedule().filter(t => t.done).length}/{getTodaySchedule().length}
                  </span>
                </div>
                
                {getTodaySchedule().map(task => {
                  const categoryIcons = {
                    frontend: '💻',
                    english: '🇬🇧',
                    exercise: '🏃',
                    other: '📌'
                  };
                  
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleScheduleTask(task.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all ${
                        task.done
                          ? 'bg-green-500/20 border border-green-500/50'
                          : 'bg-slate-700/30 hover:bg-slate-700/50'
                      }`}
                    >
                      <span className="text-2xl">{categoryIcons[task.category]}</span>
                      <div className="flex-1 text-left">
                        <p className={task.done ? 'line-through text-slate-400' : ''}>
                          {task.name}
                        </p>
                        <p className="text-xs text-slate-500">{task.startTime} - {task.endTime}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.done 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-slate-500'
                      }`}>
                        {task.done && <span className="text-xs">✔</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Calories summary in today tab */}
            <div className={`bg-slate-800/50 rounded-2xl p-4 backdrop-blur ${
              totalKcal >= 1400 && totalKcal <= 1500 
                ? 'border border-green-500/50' 
                : totalKcal > 1500 
                  ? 'border border-red-500/50'
                  : ''
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍽️</span>
                <div className="flex-1">
                  <p>Kalorie dzisiaj</p>
                  <p className="text-xs text-slate-400">cel: 1400-1500 kcal</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{totalKcal}</p>
                  <p className="text-xs text-slate-400">{totalProtein}g białka</p>
                </div>
              </div>
            </div>

            {dailyCompleted === DAILY_TASKS.length && getTodaySchedule().every(t => t.done) && totalKcal >= 1400 && totalKcal <= 1500 && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-semibold text-green-400">Perfekcyjny dzień!</p>
                <p className="text-sm text-slate-400">Wszystko zrobione + kalorie w normie!</p>
              </div>
            )}
          </div>
        )}

        {/* FOOD TAB */}
        {activeTab === 'food' && (
          <div className="space-y-3">
            {/* Add meal form */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">➕ Dodaj posiłek</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nazwa posiłku (np. Owsianka z owocami)"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="w-full bg-slate-700 rounded-xl px-4 py-3 placeholder-slate-500"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">Kalorie</label>
                    <input
                      type="number"
                      placeholder="kcal"
                      value={newMeal.kcal}
                      onChange={(e) => setNewMeal({ ...newMeal, kcal: e.target.value })}
                      className="w-full bg-slate-700 rounded-xl px-4 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">Białko (opcjonalnie)</label>
                    <input
                      type="number"
                      placeholder="g"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                      className="w-full bg-slate-700 rounded-xl px-4 py-2"
                    />
                  </div>
                </div>
                <button
                  onClick={addMeal}
                  disabled={!newMeal.name || !newMeal.kcal}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dodaj posiłek
                </button>
              </div>
            </div>

            {/* Today's meals */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">🍽️ Dzisiejsze posiłki</h3>
                <span className="text-sm text-slate-400">{todayMeals.length} posiłków</span>
              </div>

              {todayMeals.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Brak posiłków - dodaj pierwszy!</p>
              ) : (
                <div className="space-y-2">
                  {todayMeals.map(meal => (
                    <div key={meal.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-xs text-slate-400">
                          {meal.protein > 0 && `${meal.protein}g białka`}
                        </p>
                      </div>
                      <span className="text-green-400 font-medium">{meal.kcal} kcal</span>
                      <button
                        onClick={() => removeMeal(meal.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Daily summary */}
              <div className={`mt-4 p-4 rounded-xl ${
                totalKcal >= 1400 && totalKcal <= 1500 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : totalKcal > 1500 
                    ? 'bg-red-500/20 border border-red-500/50'
                    : 'bg-slate-700/50'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Suma dzisiaj</p>
                    <p className="text-xs text-slate-400">Cel: 1400-1500 kcal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{totalKcal} kcal</p>
                    <p className="text-sm text-slate-400">{totalProtein}g białka</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        totalKcal <= 1500 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((totalKcal / 1500) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0</span>
                    <span>1400</span>
                    <span>1500</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {/* Current date display */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur text-center">
              <p className="text-slate-400 text-sm">Dzisiaj jest</p>
              <p className="text-xl font-bold">
                {new Date().toLocaleDateString('pl-PL', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* 30-day heatmap with dates */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">📊 Ostatnie 30 dni</h3>
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['Pn', 'Wt', 'Åšr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
                  <div key={day} className="text-center text-xs text-slate-500 pb-1">{day}</div>
                ))}
                
                {/* Calendar grid */}
                {(() => {
                  const days = getLast30Days();
                  const firstDay = new Date(days[0]);
                  // Get day of week (0 = Sunday, convert to Monday = 0)
                  let startPadding = (firstDay.getDay() + 6) % 7;
                  
                  const paddedDays = [...Array(startPadding).fill(null), ...days];
                  
                  return paddedDays.map((date, i) => {
                    if (!date) {
                      return <div key={`empty-${i}`} className="aspect-square" />;
                    }
                    
                    const completion = getDayCompletion(date);
                    const isToday = date === todayKey;
                    const dayNum = new Date(date).getDate();
                    
                    return (
                      <div
                        key={date}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                          isToday ? 'ring-2 ring-yellow-400' : ''
                        } ${
                          completion === 0 ? 'bg-slate-700' :
                          completion < 0.5 ? 'bg-orange-500/60' :
                          completion < 1 ? 'bg-green-500/60' :
                          'bg-green-500'
                        }`}
                        title={`${new Date(date).toLocaleDateString('pl-PL')}: ${Math.round(completion * 100)}%`}
                      >
                        <span className={isToday ? 'font-bold' : ''}>{dayNum}</span>
                      </div>
                    );
                  });
                })()}
              </div>
              
              {/* Legend */}
              <div className="flex justify-center items-center gap-4 mt-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-slate-700 rounded" />
                  <span>0%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-orange-500/60 rounded" />
                  <span>&lt;50%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-500/60 rounded" />
                  <span>&lt;100%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Weekly breakdown */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-2">📅 Ten tydzień</h3>
              <p className="text-xs text-slate-400 mb-3">
                {new Date(getWeekDates()[0]).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} - {new Date(getWeekDates()[6]).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="space-y-2">
                {getWeekDates().map(date => {
                  const dayTasks = state.dailyHistory[date] || {};
                  const dayMeals = state.meals[date] || [];
                  const dayKcal = dayMeals.reduce((sum, m) => sum + m.kcal, 0);
                  const isToday = date === todayKey;
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('pl-PL', { weekday: 'short' });
                  const dayNum = dateObj.getDate();
                  const monthName = dateObj.toLocaleDateString('pl-PL', { month: 'short' });
                  
                  return (
                    <div 
                      key={date}
                      className={`p-3 rounded-xl ${
                        isToday ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center">
                          <p className="text-xs text-slate-400 uppercase">{dayName}</p>
                          <p className="font-bold">{dayNum} {monthName}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-1 mb-1">
                            {DAILY_TASKS.map(task => (
                              <div
                                key={task.key}
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                                  dayTasks[task.key] ? 'bg-green-500' : 'bg-slate-600'
                                }`}
                                title={task.label}
                              >
                                {dayTasks[task.key] ? '✔' : ''}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400">
                            {DAILY_TASKS.filter(t => dayTasks[t.key]).length}/{DAILY_TASKS.length} zadań
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            dayKcal >= 1400 && dayKcal <= 1500 ? 'text-green-400' :
                            dayKcal > 1500 ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {dayKcal > 0 ? `${dayKcal} kcal` : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weight history */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">⚖️ Historia wagi</h3>
              {Object.keys(state.weightHistory).length === 0 ? (
                <p className="text-slate-500 text-center py-4">
                  Brak zapisanej historii wagi
                </p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(state.weightHistory)
                    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                    .slice(0, 10)
                    .map(([date, weight]) => (
                      <div key={date} className="flex justify-between p-2 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-400">
                          {new Date(date).toLocaleDateString('pl-PL')}
                        </span>
                        <span className="font-medium">{weight} kg</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">📈 Statystyki</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/30 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {(() => {
                      try {
                        return Object.values(state.dailyHistory || {}).filter(day => 
                          day && DAILY_TASKS.every(t => day[t.key])
                        ).length;
                      } catch (e) {
                        return 0;
                      }
                    })()}
                  </p>
                  <p className="text-xs text-slate-400">Perfekcyjnych dni</p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {Object.keys(state.dailyHistory || {}).length}
                  </p>
                  <p className="text-xs text-slate-400">Dni śledzenia</p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-pink-400">
                    {weightLost.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-slate-400">Stracone kg</p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.round(weightProgress)}%
                  </p>
                  <p className="text-xs text-slate-400">Do celu</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEEK TAB */}
        {activeTab === 'week' && (
          <div className="space-y-3">
            
            {/* Weight Tracking */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">⚖️ Waga - Tydzień {weekNumber}</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => {
                    const newWeight = Math.max(40, (state.currentWeight - 0.1));
                    saveState({
                      ...state,
                      currentWeight: parseFloat(newWeight.toFixed(1)),
                      weightHistory: {
                        ...state.weightHistory,
                        [todayKey]: parseFloat(newWeight.toFixed(1))
                      }
                    });
                  }}
                  className="w-12 h-12 bg-slate-700 rounded-xl text-xl hover:bg-slate-600"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    value={state.currentWeight}
                    onChange={(e) => {
                      const newWeight = parseFloat(e.target.value) || 60;
                      saveState({
                        ...state,
                        currentWeight: newWeight,
                        weightHistory: {
                          ...state.weightHistory,
                          [todayKey]: newWeight
                        }
                      });
                    }}
                    className="w-full bg-slate-700 rounded-xl px-4 py-3 text-center text-3xl font-bold"
                    step="0.1"
                  />
                  <p className="text-xs text-slate-400 mt-1">kg</p>
                </div>
                <button
                  onClick={() => {
                    const newWeight = state.currentWeight + 0.1;
                    saveState({
                      ...state,
                      currentWeight: parseFloat(newWeight.toFixed(1)),
                      weightHistory: {
                        ...state.weightHistory,
                        [todayKey]: parseFloat(newWeight.toFixed(1))
                      }
                    });
                  }}
                  className="w-12 h-12 bg-slate-700 rounded-xl text-xl hover:bg-slate-600"
                >
                  +
                </button>
              </div>

              {/* Weight stats */}
              {(() => {
                const start = state.weightGoal?.start || 72;
                const target = state.weightGoal?.target || 60;
                const toLoose = start - target;
                const perWeek = toLoose / 12;
                const currentTarget = start - (perWeek * weekNumber);
                const diff = state.currentWeight - currentTarget;
                const isOnTrack = state.currentWeight <= currentTarget;
                
                return (
                  <div className="space-y-2">
                    <div className={`flex justify-between p-3 rounded-xl ${isOnTrack ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <span>Cel na tydzień {weekNumber}:</span>
                      <span className="font-bold">{currentTarget.toFixed(1)} kg</span>
                    </div>
                    <div className={`flex justify-between p-3 rounded-xl ${isOnTrack ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <span className="text-slate-300">Status:</span>
                      <span className={`font-bold ${isOnTrack ? 'text-green-400' : 'text-red-400'}`}>
                        {isOnTrack 
                          ? `✔ ${Math.abs(diff).toFixed(1)} kg przed planem!` 
                          : `✗ ${diff.toFixed(1)} kg powyżej celu`
                        }
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Daily targets to reach goal */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">🎯 Co musisz robić codziennie</h3>
              
              {(() => {
                const start = state.weightGoal?.start || 72;
                const target = state.weightGoal?.target || 60;
                const remaining = state.currentWeight - target;
                const weeksLeft = Math.max(12 - weekNumber + 1, 1);
                const daysLeft = weeksLeft * 7;
                const perDay = remaining / daysLeft;
                const kcalDeficit = Math.round(perDay * 7700); // 1kg = 7700 kcal
                
                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-700/30 rounded-xl">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Zostało do celu:</span>
                        <span className="font-bold text-pink-400">{remaining.toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Czas:</span>
                        <span>{weeksLeft} tyg ({daysLeft} dni)</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <p className="text-sm text-slate-400 mb-2">Żeby osiągnąć cel, codziennie:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🔥</span>
                          <span>Deficyt kaloryczny: <strong className="text-yellow-400">~{kcalDeficit} kcal/dzień</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🍽️</span>
                          <span>Jedz: <strong className="text-green-400">1400-1500 kcal</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏃</span>
                          <span>Ćwicz: <strong className="text-blue-400">20 min dziennie</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">💧</span>
                          <span>Pij: <strong>min. 2L wody</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                      <p className="text-sm text-slate-400">Tempo utraty wagi:</p>
                      <p className="text-2xl font-bold text-pink-400">{(perDay * 7).toFixed(2)} kg/tydzień</p>
                      <p className="text-xs text-slate-500">({(perDay * 1000).toFixed(0)}g dziennie)</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Today's progress */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">📊 Dzisiejszy postęp</h3>
              
              <div className="space-y-3">
                {/* Habits */}
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Stałe nawyki</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={dailyCompleted === DAILY_TASKS.length ? 'text-green-400' : 'text-slate-400'}>
                      {dailyCompleted}/{DAILY_TASKS.length}
                    </span>
                    <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(dailyCompleted / DAILY_TASKS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule tasks */}
                {getTodaySchedule().length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>Plan dnia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={getTodaySchedule().every(t => t.done) ? 'text-green-400' : 'text-slate-400'}>
                        {getTodaySchedule().filter(t => t.done).length}/{getTodaySchedule().length}
                      </span>
                      <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${(getTodaySchedule().filter(t => t.done).length / getTodaySchedule().length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Calories */}
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>🍽️</span>
                    <span>Kalorie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={
                      totalKcal >= 1400 && totalKcal <= 1500 ? 'text-green-400' :
                      totalKcal > 1500 ? 'text-red-400' : 'text-yellow-400'
                    }>
                      {totalKcal}/1500
                    </span>
                    <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${totalKcal <= 1500 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min((totalKcal / 1500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly summary */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">📈 Podsumowanie tygodnia</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/30 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-400">Dni z ćwiczeniami</p>
                  <p className="text-2xl font-bold text-green-400">
                    {getWeekDates().filter(date => state.dailyHistory?.[date]?.exercise).length}/7
                  </p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-400">Dni z angielskim</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {getWeekDates().filter(date => state.dailyHistory?.[date]?.english).length}/7
                  </p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-400">Dni z kodowaniem</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {getWeekDates().filter(date => state.dailyHistory?.[date]?.codingTheory || state.dailyHistory?.[date]?.codingPractice).length}/7
                  </p>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-400">Åšrednie kalorie</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {(() => {
                      try {
                        const weekDates = getWeekDates();
                        const total = weekDates.reduce((sum, date) => {
                          const meals = state.meals?.[date];
                          if (!Array.isArray(meals)) return sum;
                          return sum + meals.reduce((s, m) => s + safeParseInt(m?.kcal, 0), 0);
                        }, 0);
                        return Math.round(total / 7) || 0;
                      } catch (e) {
                        return 0;
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <div className="space-y-3">
            
            {/* My Goals */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">🎯 Moje cele</h3>
              <textarea
                value={state.notes?.goals || ''}
                onChange={(e) => saveState({
                  ...state,
                  notes: { ...state.notes, goals: e.target.value }
                })}
                placeholder="Wpisz swoje cele na te 3 miesiące...&#10;&#10;Np:&#10;• Znaleźć pracę jako Frontend Developer&#10;• Schudnąć do 60kg&#10;• Zdać egzamin B2"
                className="w-full bg-slate-700/50 rounded-xl px-4 py-3 min-h-32 placeholder-slate-500 resize-none"
              />
            </div>

            {/* Weekly Plan */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">📝 Plan na tydzień {weekNumber}</h3>
              </div>
              <textarea
                value={state.notes?.weeklyPlans?.[weekNumber] || ''}
                onChange={(e) => saveState({
                  ...state,
                  notes: { 
                    ...state.notes, 
                    weeklyPlans: { 
                      ...state.notes?.weeklyPlans, 
                      [weekNumber]: e.target.value 
                    }
                  }
                })}
                placeholder={`Co chcesz osiągnąć w tym tygodniu?&#10;&#10;Np:&#10;• Skończyć moduł React Hooks&#10;• Nauczyć się 100 nowych słówek&#10;• Ćwiczyć codziennie`}
                className="w-full bg-slate-700/50 rounded-xl px-4 py-3 min-h-28 placeholder-slate-500 resize-none"
              />
            </div>

            {/* Daily Notes */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">📔 Notatki na dziś</h3>
                <span className="text-xs text-slate-400">
                  {new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <textarea
                value={state.notes?.daily?.[todayKey] || ''}
                onChange={(e) => saveState({
                  ...state,
                  notes: { 
                    ...state.notes, 
                    daily: { 
                      ...state.notes?.daily, 
                      [todayKey]: e.target.value 
                    }
                  }
                })}
                placeholder="Zapisz przemyślenia, postępy, co się udało, co było trudne..."
                className="w-full bg-slate-700/50 rounded-xl px-4 py-3 min-h-24 placeholder-slate-500 resize-none"
              />
            </div>

            {/* Ideas / Projects */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">💡 Pomysły na projekty</h3>
              <textarea
                value={state.notes?.projectIdeas || ''}
                onChange={(e) => saveState({
                  ...state,
                  notes: { ...state.notes, projectIdeas: e.target.value }
                })}
                placeholder="Zapisuj pomysły na projekty do portfolio...&#10;&#10;Np:&#10;• Dashboard do śledzenia finansów&#10;• Aplikacja do nauki słówek&#10;• Clone Twittera"
                className="w-full bg-slate-700/50 rounded-xl px-4 py-3 min-h-28 placeholder-slate-500 resize-none"
              />
            </div>

            {/* Weight Calculator */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">⚖️ Kalkulator wagi</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-700/30 p-3 rounded-xl">
                  <p className="text-xs text-slate-400">Waga startowa</p>
                  <input
                    type="number"
                    value={state.weightGoal?.start || 72}
                    onChange={(e) => saveState({
                      ...state,
                      weightGoal: { ...state.weightGoal, start: parseFloat(e.target.value) || 72 }
                    })}
                    className="w-full bg-transparent text-xl font-bold mt-1"
                    step="0.1"
                  />
                </div>
                <div className="bg-slate-700/30 p-3 rounded-xl">
                  <p className="text-xs text-slate-400">Cel</p>
                  <input
                    type="number"
                    value={state.weightGoal?.target || 60}
                    onChange={(e) => saveState({
                      ...state,
                      weightGoal: { ...state.weightGoal, target: parseFloat(e.target.value) || 60 }
                    })}
                    className="w-full bg-transparent text-xl font-bold mt-1"
                    step="0.1"
                  />
                </div>
              </div>
              
              {(() => {
                const start = state.weightGoal?.start || 72;
                const target = state.weightGoal?.target || 60;
                const toLoose = start - target;
                const weeksLeft = Math.max(12 - weekNumber + 1, 1);
                const perWeek = toLoose / 12;
                const currentTarget = start - (perWeek * weekNumber);
                const remaining = state.currentWeight - target;
                const perWeekRemaining = remaining / weeksLeft;
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-400">Do zrzucenia łącznie:</span>
                      <span className="font-bold">{toLoose.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-400">Plan na tydzień:</span>
                      <span className="font-bold text-yellow-400">{perWeek.toFixed(2)} kg/tydz</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-400">Cel na tydzień {weekNumber}:</span>
                      <span className="font-bold">{currentTarget.toFixed(1)} kg</span>
                    </div>
                    <div className={`flex justify-between p-2 rounded-lg ${
                      state.currentWeight <= currentTarget ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      <span className="text-slate-400">Aktualna waga:</span>
                      <span className="font-bold">{state.currentWeight} kg {state.currentWeight <= currentTarget ? '✔' : `(+${(state.currentWeight - currentTarget).toFixed(1)})`}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-purple-500/20 rounded-lg">
                      <span className="text-slate-400">Zostało do celu:</span>
                      <span className="font-bold">{remaining.toFixed(1)} kg ({perWeekRemaining.toFixed(2)} kg/tydz przez {weeksLeft} tyg)</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Skills to learn - editable */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">💻 Tematy do nauki (Mid Developer)</h3>
              </div>
              
              {/* Add new skill */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Dodaj temat..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-sm"
                />
                <button
                  onClick={addSkill}
                  disabled={!newSkill}
                  className="px-4 py-2 bg-purple-500 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <div className="space-y-2">
                {(state.skills || defaultSkills).map((skill, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                      skill.done ? 'bg-green-500/20' : 'bg-slate-700/30'
                    }`}
                  >
                    <button
                      onClick={() => toggleSkill(index)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs flex-shrink-0 ${
                        skill.done ? 'bg-green-500 border-green-500' : 'border-slate-500'
                      }`}
                    >
                      {skill.done && '✔'}
                    </button>
                    <span className={`flex-1 text-sm ${skill.done ? 'line-through text-slate-400' : ''}`}>
                      {skill.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      skill.category === 'react' ? 'bg-blue-500/30 text-blue-300' :
                      skill.category === 'typescript' ? 'bg-purple-500/30 text-purple-300' :
                      skill.category === 'nextjs' ? 'bg-slate-500/30 text-slate-300' :
                      skill.category === 'testing' ? 'bg-green-500/30 text-green-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {skill.category}
                    </span>
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-slate-500 hover:text-red-400 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-sm text-slate-400 text-center">
                {(state.skills || defaultSkills).filter(s => s.done).length} / {(state.skills || defaultSkills).length} ukończone
              </div>
            </div>

            {/* Projects to build - editable */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">🚀 Projekty do portfolio</h3>
              </div>
              
              {/* Add new project */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Dodaj projekt..."
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProject()}
                  className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-sm"
                />
                <button
                  onClick={addProject}
                  disabled={!newProject}
                  className="px-4 py-2 bg-pink-500 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <div className="space-y-2">
                {(state.projects || defaultProjects).map((project, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-xl transition-all ${
                      project.status === 'done' ? 'bg-green-500/20 border border-green-500/30' :
                      project.status === 'inprogress' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                      'bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <select
                        value={project.status}
                        onChange={(e) => updateProjectStatus(index, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg bg-slate-600 ${
                          project.status === 'done' ? 'text-green-400' :
                          project.status === 'inprogress' ? 'text-yellow-400' :
                          'text-slate-400'
                        }`}
                      >
                        <option value="todo">📋 Do zrobienia</option>
                        <option value="inprogress">🔨 W trakcie</option>
                        <option value="done">✅ Gotowe</option>
                      </select>
                      <span className={`flex-1 font-medium ${project.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                        {project.name}
                      </span>
                      <button
                        onClick={() => removeProject(index)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                    {project.description && (
                      <p className="text-xs text-slate-400 mt-2 ml-20">{project.description}</p>
                    )}
                    {project.tech && (
                      <div className="flex gap-1 mt-2 ml-20">
                        {project.tech.map((t, i) => (
                          <span key={i} className="text-xs bg-slate-600/50 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between text-sm text-slate-400">
                <span>📋 {(state.projects || defaultProjects).filter(p => p.status === 'todo').length} do zrobienia</span>
                <span>🔨 {(state.projects || defaultProjects).filter(p => p.status === 'inprogress').length} w trakcie</span>
                <span>✅ {(state.projects || defaultProjects).filter(p => p.status === 'done').length} gotowe</span>
              </div>
            </div>

            {/* English B2 Topics */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">🇬🇧 Tematy B2 do opanowania</h3>
              </div>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Dodaj temat angielskiego..."
                  value={newEnglishTopic}
                  onChange={(e) => setNewEnglishTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEnglishTopic()}
                  className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-sm"
                />
                <button
                  onClick={addEnglishTopic}
                  disabled={!newEnglishTopic}
                  className="px-4 py-2 bg-blue-500 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <div className="space-y-2">
                {(state.englishTopics || defaultEnglishTopics).map((topic, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                      topic.done ? 'bg-green-500/20' : 'bg-slate-700/30'
                    }`}
                  >
                    <button
                      onClick={() => toggleEnglishTopic(index)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs flex-shrink-0 ${
                        topic.done ? 'bg-green-500 border-green-500' : 'border-slate-500'
                      }`}
                    >
                      {topic.done && '✔'}
                    </button>
                    <span className={`flex-1 text-sm ${topic.done ? 'line-through text-slate-400' : ''}`}>
                      {topic.name}
                    </span>
                    <button
                      onClick={() => removeEnglishTopic(index)}
                      className="text-slate-500 hover:text-red-400 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-sm text-slate-400 text-center">
                {(state.englishTopics || defaultEnglishTopics).filter(t => t.done).length} / {(state.englishTopics || defaultEnglishTopics).length} ukończone
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            {/* Today's date */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur text-center">
              <p className="text-xl font-bold">
                {new Date().toLocaleDateString('pl-PL', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long'
                })}
              </p>
            </div>

            {/* Add new task */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">➕ Dodaj zadanie</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Co chcesz zrobić? (np. Kurs React)"
                  value={newScheduleTask.name}
                  onChange={(e) => setNewScheduleTask({ ...newScheduleTask, name: e.target.value })}
                  className="w-full bg-slate-700 rounded-xl px-4 py-3 placeholder-slate-500"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">Od</label>
                    <input
                      type="time"
                      value={newScheduleTask.startTime}
                      onChange={(e) => setNewScheduleTask({ ...newScheduleTask, startTime: e.target.value })}
                      className="w-full bg-slate-700 rounded-xl px-4 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">Do</label>
                    <input
                      type="time"
                      value={newScheduleTask.endTime}
                      onChange={(e) => setNewScheduleTask({ ...newScheduleTask, endTime: e.target.value })}
                      className="w-full bg-slate-700 rounded-xl px-4 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">Kategoria</label>
                    <select
                      value={newScheduleTask.category}
                      onChange={(e) => setNewScheduleTask({ ...newScheduleTask, category: e.target.value })}
                      className="w-full bg-slate-700 rounded-xl px-3 py-2"
                    >
                      <option value="frontend">💻 Frontend</option>
                      <option value="english">🇬🇧 Angielski</option>
                      <option value="exercise">🏃 Ćwiczenia</option>
                      <option value="other">📌 Inne</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addScheduleTask}
                  disabled={!newScheduleTask.name}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dodaj do planu
                </button>
              </div>
            </div>

            {/* Quick add templates */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <h3 className="font-semibold mb-3">⚡ Szybkie dodawanie</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Ćwiczenia', startTime: '17:00', endTime: '17:20', category: 'exercise' },
                  { name: 'Angielski', startTime: '17:30', endTime: '18:30', category: 'english' },
                  { name: 'Kurs/Tutorial', startTime: '18:30', endTime: '19:30', category: 'frontend' },
                  { name: 'Projekt/Portfolio', startTime: '20:00', endTime: '21:30', category: 'frontend' },
                  { name: 'Anki słówka', startTime: '09:00', endTime: '09:15', category: 'english' },
                  { name: 'LeetCode', startTime: '21:30', endTime: '22:00', category: 'frontend' },
                ].map((template, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const todaySchedule = getTodaySchedule();
                      const newTask = { id: Date.now(), ...template, done: false };
                      saveState({
                        ...state,
                        schedule: {
                          ...state.schedule,
                          [todayKey]: [...todaySchedule, newTask].sort((a, b) => a.startTime.localeCompare(b.startTime))
                        }
                      });
                    }}
                    className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm transition-all"
                  >
                    {template.name} <span className="text-slate-400">({template.startTime})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's schedule */}
            <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">📅 Plan na dziś</h3>
                <span className="text-sm text-slate-400">
                  {getTodaySchedule().filter(t => t.done).length}/{getTodaySchedule().length} zrobione
                </span>
              </div>

              {getTodaySchedule().length === 0 ? (
                <p className="text-slate-500 text-center py-6">
                  Brak zaplanowanych zadań - dodaj pierwsze!
                </p>
              ) : (
                <div className="space-y-2">
                  {getTodaySchedule().map(task => {
                    const categoryColors = {
                      frontend: 'border-purple-500 bg-purple-500/10',
                      english: 'border-blue-500 bg-blue-500/10',
                      exercise: 'border-green-500 bg-green-500/10',
                      other: 'border-slate-500 bg-slate-500/10'
                    };
                    const categoryIcons = {
                      frontend: '💻',
                      english: '🇬🇧',
                      exercise: '🏃',
                      other: '📌'
                    };
                    
                    return (
                      <div 
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${
                          task.done ? 'bg-slate-700/20 opacity-60' : categoryColors[task.category]
                        }`}
                      >
                        <button
                          onClick={() => toggleScheduleTask(task.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            task.done 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-slate-400 hover:border-green-400'
                          }`}
                        >
                          {task.done && <span className="text-xs">✔</span>}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${task.done ? 'line-through text-slate-400' : ''}`}>
                            {categoryIcons[task.category]} {task.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {task.startTime} - {task.endTime}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeScheduleTask(task.id)}
                          className="text-slate-500 hover:text-red-400 p-1 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Copy from yesterday */}
            {getYesterdaySchedule().length > 0 && getTodaySchedule().length === 0 && (
              <button
                onClick={() => {
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
                }}
                className="w-full bg-slate-700/50 hover:bg-slate-700 py-3 rounded-xl text-sm transition-all"
              >
                📋 Skopiuj plan z wczoraj ({getYesterdaySchedule().length} zadań)
              </button>
            )}
          </div>
        )}

        {/* Motivation Button */}
        <button
          onClick={() => setShowMotivation(!showMotivation)}
          className="w-full mt-4 py-2 text-slate-400 text-sm hover:text-white transition-colors"
        >
          {showMotivation ? '✨ Schowaj motywację' : '✨ Potrzebuję motywacji'}
        </button>

        {showMotivation && (
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-4 text-center mt-2">
            <p className="text-lg">
              {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
            </p>
          </div>
        )}

        {/* Footer buttons */}
        <button
          onClick={resetAll}
          className="w-full mt-4 py-2 text-slate-500 text-xs hover:text-red-400 transition-colors bg-slate-800/30 rounded-xl"
        >
          🗑️ Resetuj wszystko
        </button>
      </div>
    </div>
  );
}

// Export z ErrorBoundary
export default function GlowUpTracker() {
  return (
    <ErrorBoundary>
      <GlowUpTrackerInner />
    </ErrorBoundary>
  );
}
