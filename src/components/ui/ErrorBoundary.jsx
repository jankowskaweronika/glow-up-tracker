import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md text-center">
            <p className="text-4xl mb-4">😢</p>
            <h2 className="text-xl font-bold text-white mb-2">Ups! Coś poszło nie tak</h2>
            <p className="text-slate-400 mb-4">Aplikacja napotkała błąd. Spróbuj odświeżyć stronę.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-500 text-white px-6 py-2 rounded-xl hover:bg-purple-600"
            >
              Odśwież stronę
            </button>
            <button
              onClick={() => {
                if (confirm('Czy chcesz zresetować aplikację? To usunie wszystkie dane!')) {
                  window.storage?.delete('glow-up-tracker-v2');
                  window.location.reload();
                }
              }}
              className="block mx-auto mt-3 text-red-400 text-sm hover:text-red-300"
            >
              Resetuj aplikację (ostateczność)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
