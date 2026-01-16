import { DAILY_TASKS } from '../../constants';
import { getLast30Days, getWeekDates, getTodayKey } from '../../utils';

export function HistoryTab({
  state,
  getDayCompletion,
  weightLost,
  weightProgress
}) {
  const todayKey = getTodayKey();

  // Stats calculations
  const perfectDays = Object.values(state.dailyHistory || {}).filter(day =>
    day && DAILY_TASKS.every(t => day[t.key])
  ).length;

  const trackingDays = Object.keys(state.dailyHistory || {}).length;

  return (
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

      {/* 30-day heatmap */}
      <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
        <h3 className="font-semibold mb-3">📊 Ostatnie 30 dni</h3>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
            <div key={day} className="text-center text-xs text-slate-500 pb-1">{day}</div>
          ))}

          {/* Calendar grid */}
          {(() => {
            const days = getLast30Days();
            const firstDay = new Date(days[0]);
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
        {Object.keys(state.weightHistory || {}).length === 0 ? (
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
            <p className="text-2xl font-bold text-green-400">{perfectDays}</p>
            <p className="text-xs text-slate-400">Perfekcyjnych dni</p>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-400">{trackingDays}</p>
            <p className="text-xs text-slate-400">Dni śledzenia</p>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-xl text-center">
            <p className="text-2xl font-bold text-pink-400">{weightLost.toFixed(1)} kg</p>
            <p className="text-xs text-slate-400">Stracone kg</p>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-400">{Math.round(weightProgress)}%</p>
            <p className="text-xs text-slate-400">Do celu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
