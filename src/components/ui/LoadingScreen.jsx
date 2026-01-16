export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">✨</div>
        <div className="text-white text-xl">Ładowanie...</div>
      </div>
    </div>
  );
}
