// === INITIAL STATE ===
export const initialState = {
  startDate: new Date().toISOString().split('T')[0],
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

// === DAILY TASKS ===
export const DAILY_TASKS = [
  { key: 'exercise', icon: '🏃', label: 'Ćwiczenia (20 min)' },
  { key: 'english', icon: '🇬🇧', label: 'Angielski (1h)' },
  { key: 'codingTheory', icon: '📖', label: 'Coding: Teoria/Kurs (1h)' },
  { key: 'codingPractice', icon: '💻', label: 'Coding: Projekt/Portfolio (1.5h)' },
  { key: 'water', icon: '💧', label: 'Woda 2L' }
];

// === DEFAULT SKILLS ===
export const defaultSkills = [
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

// === DEFAULT PROJECTS ===
export const defaultProjects = [
  { name: 'Dashboard z API', description: 'Filtry, sortowanie, paginacja', tech: ['React', 'TypeScript', 'API'], status: 'todo' },
  { name: 'Fullstack App z Auth', description: 'Next.js + logowanie/rejestracja', tech: ['Next.js', 'Auth', 'DB'], status: 'todo' },
  { name: 'E-commerce / Sklep', description: 'Koszyk, produkty, checkout', tech: ['React', 'Zustand', 'Stripe'], status: 'todo' },
  { name: 'Portfolio Website', description: 'Strona osobista z projektami', tech: ['Next.js', 'Tailwind'], status: 'todo' },
];

// === DEFAULT ENGLISH TOPICS ===
export const defaultEnglishTopics = [
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

// === MOTIVATIONAL QUOTES ===
export const motivationalQuotes = [
  "Każdy dzień to nowa szansa! 🌟",
  "Małe kroki prowadzą do wielkich zmian. 👣",
  "Nie porównuj się z innymi - porównuj się z sobą z wczoraj. 💪",
  "Sukces to suma małych wysiłków powtarzanych każdego dnia. 🎯",
  "Trudne drogi często prowadzą do pięknych miejsc. 🏔️",
  "Twoja jedyna granica to ta, którą sam sobie stawiasz. 🚀",
  "Każdy ekspert był kiedyś początkującym. 💪",
];

// === SCHEDULE TEMPLATES ===
export const scheduleTemplates = [
  { name: 'Ćwiczenia', startTime: '17:00', endTime: '17:20', category: 'exercise' },
  { name: 'Angielski', startTime: '17:30', endTime: '18:30', category: 'english' },
  { name: 'Coding: Teoria', startTime: '18:30', endTime: '19:30', category: 'frontend' },
  { name: 'Coding: Projekt', startTime: '19:30', endTime: '21:00', category: 'frontend' },
  { name: 'Przerwa/Kolacja', startTime: '21:00', endTime: '21:30', category: 'other' },
  { name: 'Nauka dodatkowa', startTime: '21:30', endTime: '22:30', category: 'frontend' },
];

// === CATEGORY CONFIG ===
export const categoryColors = {
  frontend: 'border-purple-500 bg-purple-500/10',
  english: 'border-blue-500 bg-blue-500/10',
  exercise: 'border-green-500 bg-green-500/10',
  other: 'border-slate-500 bg-slate-500/10'
};

export const categoryIcons = {
  frontend: '💻',
  english: '🇬🇧',
  exercise: '🏃',
  other: '📌'
};
