import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function AuthForm() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        setMessage({ type: 'success', text: 'Zalogowano pomyslnie!' });
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'Hasla nie sa identyczne' });
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setMessage({ type: 'error', text: 'Haslo musi miec minimum 6 znakow' });
          setIsLoading(false);
          return;
        }
        await signUp(email, password, displayName);
        setMessage({
          type: 'success',
          text: 'Konto utworzone! Sprawdz email, aby potwierdzic rejestracje.',
        });
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMessage({
          type: 'success',
          text: 'Link do resetowania hasla zostal wyslany na email.',
        });
      }
    } catch (err) {
      const errorMessages = {
        'Invalid login credentials': 'Nieprawidlowy email lub haslo',
        'Email not confirmed': 'Email nie zostal potwierdzony. Sprawdz skrzynke.',
        'User already registered': 'Uzytkownik z tym emailem juz istnieje',
        'Password should be at least 6 characters': 'Haslo musi miec minimum 6 znakow',
      };
      setMessage({
        type: 'error',
        text: errorMessages[err.message] || err.message || 'Wystapil blad',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Glow Up Tracker
          </h1>
          <p className="text-slate-400">
            Twoj osobisty tracker postepow
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Logowanie
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setMessage(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                mode === 'register'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Rejestracja
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nazwa wyswietlana
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Twoja nazwa"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Haslo
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Powtorz haslo
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Przetwarzanie...
                </span>
              ) : mode === 'login' ? (
                'Zaloguj sie'
              ) : mode === 'register' ? (
                'Zaloz konto'
              ) : (
                'Wyslij link resetujacy'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setMessage(null);
              }}
              className="w-full mt-4 text-sm text-slate-400 hover:text-purple-400 transition-colors"
            >
              Nie pamietasz hasla?
            </button>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className="w-full mt-4 text-sm text-slate-400 hover:text-purple-400 transition-colors"
            >
              Wróc do logowania
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Twoje dane sa bezpieczne i zaszyfrowane
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
