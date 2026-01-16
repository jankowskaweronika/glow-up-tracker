export function Header({ saveStatus, weekNumber, phase, currentWeight, weightLost, weightProgress }) {
  return (
    <>
      {/* Title Header */}
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
            <p className="text-2xl font-bold">{currentWeight} kg</p>
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
    </>
  );
}
