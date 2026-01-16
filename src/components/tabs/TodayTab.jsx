import { DAILY_TASKS, categoryIcons } from '../../constants';

export function TodayTab({
  todayTasks,
  todaySchedule,
  totalKcal,
  totalProtein,
  dailyCompleted,
  toggleDailyTask,
  toggleScheduleTask
}) {
  const isPerfectDay = dailyCompleted === DAILY_TASKS.length &&
    todaySchedule.every(t => t.done) &&
    totalKcal >= 1400 && totalKcal <= 1500;

  return (
    <div className="space-y-3">
      {/* Daily Habits */}
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
      {todaySchedule.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">📅 Plan na dziś</h3>
            <span className="text-sm bg-slate-700 px-2 py-1 rounded-full">
              {todaySchedule.filter(t => t.done).length}/{todaySchedule.length}
            </span>
          </div>

          {todaySchedule.map(task => (
            <button
              key={task.id}
              onClick={() => toggleScheduleTask(task.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all ${
                task.done
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-slate-700/30 hover:bg-slate-700/50'
              }`}
            >
              <span className="text-2xl">{categoryIcons[task.category] || '📌'}</span>
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
          ))}
        </div>
      )}

      {/* Calories summary */}
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

      {/* Perfect Day Badge */}
      {isPerfectDay && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-semibold text-green-400">Perfekcyjny dzień!</p>
          <p className="text-sm text-slate-400">Wszystko zrobione + kalorie w normie!</p>
        </div>
      )}
    </div>
  );
}
