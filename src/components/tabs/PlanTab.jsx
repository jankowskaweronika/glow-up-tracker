import { useState } from 'react';
import { defaultSkills, defaultProjects, defaultEnglishTopics } from '../../constants';
import { getTodayKey } from '../../utils';

export function PlanTab({
  state,
  weekNumber,
  saveState,
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
  removeEnglishTopic
}) {
  const [newSkill, setNewSkill] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newEnglishTopic, setNewEnglishTopic] = useState('');
  const todayKey = getTodayKey();

  const skills = state.skills || defaultSkills;
  const projects = state.projects || defaultProjects;
  const englishTopics = state.englishTopics || defaultEnglishTopics;

  // Weight calculations
  const start = state.weightGoal?.start || 72;
  const target = state.weightGoal?.target || 60;
  const toLoose = start - target;
  const weeksLeft = Math.max(12 - weekNumber + 1, 1);
  const perWeek = toLoose / 12;
  const currentTarget = start - (perWeek * weekNumber);
  const remaining = state.currentWeight - target;
  const perWeekRemaining = remaining / weeksLeft;

  return (
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
          placeholder="Wpisz swoje cele na te 3 miesiące...

Np:
• Znaleźć pracę jako Frontend Developer
• Schudnąć do 60kg
• Zdać egzamin B2"
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
          placeholder={`Co chcesz osiągnąć w tym tygodniu?

Np:
• Skończyć moduł React Hooks
• Nauczyć się 100 nowych słówek
• Ćwiczyć codziennie`}
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
          placeholder="Zapisuj pomysły na projekty do portfolio...

Np:
• Dashboard do śledzenia finansów
• Aplikacja do nauki słówek
• Clone Twittera"
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
            <span className="font-bold">
              {state.currentWeight} kg {state.currentWeight <= currentTarget ? '✔' : `(+${(state.currentWeight - currentTarget).toFixed(1)})`}
            </span>
          </div>
          <div className="flex justify-between p-2 bg-purple-500/20 rounded-lg">
            <span className="text-slate-400">Zostało do celu:</span>
            <span className="font-bold">{remaining.toFixed(1)} kg ({perWeekRemaining.toFixed(2)} kg/tydz przez {weeksLeft} tyg)</span>
          </div>
        </div>
      </div>

      {/* Skills to learn */}
      <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
        <h3 className="font-semibold mb-3">💻 Tematy do nauki (Mid Developer)</h3>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Dodaj temat..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newSkill) {
                addSkill(newSkill);
                setNewSkill('');
              }
            }}
            className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (newSkill) {
                addSkill(newSkill);
                setNewSkill('');
              }
            }}
            disabled={!newSkill}
            className="px-4 py-2 bg-purple-500 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            +
          </button>
        </div>

        <div className="space-y-2">
          {skills.map((skill, index) => (
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
          {skills.filter(s => s.done).length} / {skills.length} ukończone
        </div>
      </div>

      {/* Projects to build */}
      <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
        <h3 className="font-semibold mb-3">🚀 Projekty do portfolio</h3>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Dodaj projekt..."
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newProject) {
                addProject(newProject);
                setNewProject('');
              }
            }}
            className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (newProject) {
                addProject(newProject);
                setNewProject('');
              }
            }}
            disabled={!newProject}
            className="px-4 py-2 bg-pink-500 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            +
          </button>
        </div>

        <div className="space-y-2">
          {projects.map((project, index) => (
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
              {project.tech && project.tech.length > 0 && (
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
          <span>📋 {projects.filter(p => p.status === 'todo').length} do zrobienia</span>
          <span>🔨 {projects.filter(p => p.status === 'inprogress').length} w trakcie</span>
          <span>✅ {projects.filter(p => p.status === 'done').length} gotowe</span>
        </div>
      </div>

      {/* English B2 Topics */}
      <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
        <h3 className="font-semibold mb-3">🇬🇧 Tematy B2 do opanowania</h3>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Dodaj temat angielskiego..."
            value={newEnglishTopic}
            onChange={(e) => setNewEnglishTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newEnglishTopic) {
                addEnglishTopic(newEnglishTopic);
                setNewEnglishTopic('');
              }
            }}
            className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (newEnglishTopic) {
                addEnglishTopic(newEnglishTopic);
                setNewEnglishTopic('');
              }
            }}
            disabled={!newEnglishTopic}
            className="px-4 py-2 bg-blue-500 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            +
          </button>
        </div>

        <div className="space-y-2">
          {englishTopics.map((topic, index) => (
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
          {englishTopics.filter(t => t.done).length} / {englishTopics.length} ukończone
        </div>
      </div>
    </div>
  );
}
