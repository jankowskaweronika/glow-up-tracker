import { useState } from 'react';
import { categoryColors, categoryIcons, scheduleTemplates } from '../../constants';

export function ScheduleTab({
  todaySchedule,
  yesterdaySchedule,
  addScheduleTask,
  toggleScheduleTask,
  removeScheduleTask,
  copyYesterdaySchedule,
  state,
  saveState,
  todayKey
}) {
  const [newTask, setNewTask] = useState({
    name: '',
    startTime: '17:00',
    endTime: '18:00',
    category: 'frontend'
  });

  const handleAddTask = () => {
    const success = addScheduleTask(newTask);
    if (success) {
      setNewTask({ name: '', startTime: '17:00', endTime: '18:00', category: 'frontend' });
    }
  };

  const handleQuickAdd = (template) => {
    const newTaskData = { id: Date.now(), ...template, done: false };
    saveState({
      ...state,
      schedule: {
        ...state.schedule,
        [todayKey]: [...todaySchedule, newTaskData].sort((a, b) => a.startTime.localeCompare(b.startTime))
      }
    });
  };

  return (
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
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            className="w-full bg-slate-700 rounded-xl px-4 py-3 placeholder-slate-500"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Od</label>
              <input
                type="time"
                value={newTask.startTime}
                onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                className="w-full bg-slate-700 rounded-xl px-4 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Do</label>
              <input
                type="time"
                value={newTask.endTime}
                onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                className="w-full bg-slate-700 rounded-xl px-4 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Kategoria</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
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
            onClick={handleAddTask}
            disabled={!newTask.name}
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
              onClick={() => handleQuickAdd(template)}
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
            {todaySchedule.filter(t => t.done).length}/{todaySchedule.length} zrobione
          </span>
        </div>

        {todaySchedule.length === 0 ? (
          <p className="text-slate-500 text-center py-6">
            Brak zaplanowanych zadań - dodaj pierwsze!
          </p>
        ) : (
          <div className="space-y-2">
            {todaySchedule.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${
                  task.done ? 'bg-slate-700/20 opacity-60' : categoryColors[task.category] || categoryColors.other
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
                    {categoryIcons[task.category] || '📌'} {task.name}
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
            ))}
          </div>
        )}
      </div>

      {/* Copy from yesterday */}
      {yesterdaySchedule.length > 0 && todaySchedule.length === 0 && (
        <button
          onClick={copyYesterdaySchedule}
          className="w-full bg-slate-700/50 hover:bg-slate-700 py-3 rounded-xl text-sm transition-all"
        >
          📋 Skopiuj plan z wczoraj ({yesterdaySchedule.length} zadań)
        </button>
      )}
    </div>
  );
}
