const TABS = [
  { id: 'today', label: '📅 Dziś' },
  { id: 'schedule', label: '⏰ Plan dnia' },
  { id: 'food', label: '🍽️ Posiłki' },
  { id: 'history', label: '📊 Historia' },
  { id: 'week', label: '📈 Tydzień' },
  { id: 'plan', label: '📝 Cele' }
];

export function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {TABS.map(tab => (
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
  );
}
