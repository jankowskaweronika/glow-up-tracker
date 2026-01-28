import { useState } from 'react';
import { motivationalQuotes } from '../../constants';

export function Footer({ onReset, onLogout }) {
  const [showMotivation, setShowMotivation] = useState(false);

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <>
      {/* Motivation Button */}
      <button
        onClick={() => setShowMotivation(!showMotivation)}
        className="w-full mt-4 py-2 text-slate-400 text-sm hover:text-white transition-colors"
      >
        {showMotivation ? '✨ Schowaj motywację' : '✨ Potrzebuję motywacji'}
      </button>

      {showMotivation && (
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-4 text-center mt-2">
          <p className="text-lg">{randomQuote}</p>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full mt-4 py-2 text-slate-500 text-xs hover:text-red-400 transition-colors bg-slate-800/30 rounded-xl"
      >
        🗑️ Resetuj wszystko
      </button>

      {/* Logout Button */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full mt-2 py-2 text-slate-500 text-xs hover:text-yellow-400 transition-colors bg-slate-800/30 rounded-xl"
        >
          🚪 Wyloguj się
        </button>
      )}
    </>
  );
}
