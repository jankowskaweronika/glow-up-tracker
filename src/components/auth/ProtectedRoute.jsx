import { useAuth } from '../../context/AuthContext';
import { AuthForm } from './AuthForm';
import { LoadingScreen } from '../ui/LoadingScreen';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isConfigured } = useAuth();

  // Jeśli Supabase nie jest skonfigurowany, pozwól używać aplikacji bez logowania
  // (tryb offline z localStorage)
  if (!isConfigured) {
    return children;
  }

  // Ładowanie
  if (loading) {
    return <LoadingScreen />;
  }

  // Nie zalogowany - pokaż formularz logowania
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // Zalogowany - pokaż aplikację
  return children;
}

export default ProtectedRoute;
