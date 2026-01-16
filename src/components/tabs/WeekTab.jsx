import { DAILY_TASKS } from '../../constants';
import { getWeekDates, safeParseInt } from '../../utils';

export function WeekTab({
  state,
  weekNumber,
  currentWeight,
  dailyCompleted,
  totalKcal,
  todaySchedule,
  updateWeight,
  saveState,
  todayKey
}) {
  // Weight calculations
  const start = state.weightGoal?.start || 72;
  const target = state.weightGoal?.target || 60;
  const toLoose = start - target;
  const perWeek = toLoose / 12;
  const currentTarget = start - (perWeek * weekNumber);
  const diff = currentWeight - currentTarget;
  const isOnTrack = currentWeight <= currentTarget;

  // Daily targets calculations
  const remaining = currentWeight - target;
  const weeksLeft = Math.max(12 - weekNumber + 1, 1);
  const daysLeft = weeksLeft * 7;
  const perDay = remaining / daysLeft;
  const kcalDeficit = Math.round(perDay * 7700);

  // Weekly stats
  const weekDates = getWeekDates();
  const exerciseDays = weekDates.filter(date => state.dailyHistory?.[date]?.exercise).length;
  const englishDays = weekDates.filter(date => state.dailyHistory?.[date]?.english).length;
  const codingDays = weekDates.filter(date =>
    state.dailyHistory?.[date]?.codingTheory || state.dailyHistory?.[date]?.codingPractice
  ).length;

  const avgCalories = (() => {
    const total = weekDates.reduce((sum, date) => {
      const meals = state.meals?.[date];
      if (!Array.isArray(meals)) return sum;
      return sum + meals.reduce((s, m) => s + safeParseInt(m?.kcal, 0), 0);
    }, 0);
    return Math.round(total / 7) || 0;
  })();

  const handleWeightChange = (newWeight) => {
    const weight = parseFloat(newWeight.toFixed(1));
    saveState({
      ...state,
      currentWeight: weight,
      weightHistory: {
        ...state.weightHistory,
        [todayKey]: weight
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Weight Tracking */}
      <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
        <h3 className="font-semibold mb-3">⚖️ Waga - Tydzień {weekNumber}</h3>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => handleWeightChange(Math.max(40, currentWeight - 0.1))}
            className="w-12 h-12 bg-slate-700 rounded-xl text-xl hover:bg-slate-600"
          >
            -
          </button>
          <div className="flex-1 text-center">
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 60)}
              className="w-full text-center text-3xl font-bold bg-slate-700 rounded-xl py-2"
              step="0.1"
            />
            <p className="text-xs text-slate-400 mt-1">kg</p>
          </div>
          <button
            onClick={() => handleWeightChange(Math.min(200, currentWeight + 0.1))}
            className="w-12 h-12 bg-slate-700 rounded-xl text-xl hover:bg-slate-600"
          >
            +
          </button>
        </div>

        {/* Weight stats */}
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
      </div>

      {/* Daily targets */}
      <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur">
        <h3 className="font-semibold mb-3">🎯 Co musisz robić codziennie</h3>

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
          {todaySchedule.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>Plan dnia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={todaySchedule.every(t => t.done) ? 'text-green-400' : 'text-slate-400'}>
                  {todaySchedule.filter(t => t.done).length}/{todaySchedule.length}
                </span>
                <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${(todaySchedule.filter(t => t.done).length / todaySchedule.length) * 100}%` }}
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
            <p className="text-2xl font-bold text-green-400">{exerciseDays}/7</p>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-xl text-center">
            <p className="text-xs text-slate-400">Dni z angielskim</p>
            <p className="text-2xl font-bold text-blue-400">{englishDays}/7</p>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-xl text-center">
            <p className="text-xs text-slate-400">Dni z kodowaniem</p>
            <p className="text-2xl font-bold text-purple-400">{codingDays}/7</p>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-xl text-center">
            <p className="text-xs text-slate-400">Średnie kalorie</p>
            <p className="text-2xl font-bold text-yellow-400">{avgCalories}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
