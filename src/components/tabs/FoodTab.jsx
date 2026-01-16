import { useState } from 'react';

export function FoodTab({
  todayMeals,
  totalKcal,
  totalProtein,
  addMeal,
  removeMeal
}) {
  const [newMeal, setNewMeal] = useState({ name: '', kcal: '', protein: '' });

  const handleAddMeal = () => {
    const success = addMeal(newMeal);
    if (success) {
      setNewMeal({ name: '', kcal: '', protein: '' });
    }
  };

  const getCalorieStatusColor = () => {
    if (totalKcal >= 1400 && totalKcal <= 1500) return 'text-green-400';
    if (totalKcal > 1600) return 'text-red-400';
    if (totalKcal > 1500) return 'text-yellow-400';
    return 'text-slate-400';
  };

  const remaining = 1450 - totalKcal;

  return (
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
            onClick={handleAddMeal}
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
            ? 'bg-green-500/20'
            : totalKcal > 1500
              ? 'bg-red-500/20'
              : 'bg-slate-700/30'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">Suma</p>
              <p className={`text-2xl font-bold ${getCalorieStatusColor()}`}>{totalKcal} kcal</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Pozostało</p>
              <p className={`text-lg font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`} kcal
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                totalKcal > 1500 ? 'bg-red-500' : totalKcal >= 1400 ? 'bg-green-500' : 'bg-purple-500'
              }`}
              style={{ width: `${Math.min((totalKcal / 1500) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Cel: 1400-1500 kcal • Białko: {totalProtein}g
          </p>
        </div>
      </div>
    </div>
  );
}
