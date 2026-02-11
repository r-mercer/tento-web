import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ROUTES, GH_CLIENT_ID, GH_REDIRECT_URI } from './utils/constants';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleGithubCallback } from './api/auth';
import { GraphQLPlaygroundPage } from './pages/GraphQLPlaygroundPage';

// ============================================================================
// Placeholder Components
// ============================================================================

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Tento - Home</h1>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <p>Email: {user?.email}</p>
          <a href={ROUTES.DASHBOARD}>Go to Dashboard</a>
        </div>
      ) : (
        <div>
          <p>Please login to continue</p>
          <a href={ROUTES.LOGIN}>Login with GitHub</a>
        </div>
      )}
    </div>
  );
}

function LoginPage() {
  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GH_CLIENT_ID}&redirect_uri=${encodeURIComponent(GH_REDIRECT_URI || '')}&scope=read:user user:email`;
    window.location.href = githubAuthUrl;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with GitHub</button>
    </div>
  );
}

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const authenticate = async () => {
      try {
        const response = await handleGithubCallback(code);
        
        login(response.token, response.refresh_token, {
          username: response.username,
          email: response.email,
        });
        
        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        console.error('Authentication failed:', error);
        navigate(ROUTES.LOGIN);
      }
    };

    authenticate();
  }, [searchParams, navigate, login]);

  return (
    <div style={{ padding: '2rem' }}>
      <p>Authenticating...</p>
    </div>
  );
}

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function UsersPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Users</h1>
      <p>Users list coming soon...</p>
    </div>
  );
}

function QuizzesPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Quizzes</h1>
      <p>Quizzes list coming soon...</p>
    </div>
  );
}

// ============================================================================
// Protected Route Component
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// App Component
// ============================================================================

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallbackPage />} />
      
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path={ROUTES.USERS}
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path={ROUTES.QUIZZES}
        element={
          <ProtectedRoute>
            <QuizzesPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path={ROUTES.GRAPHQL_PLAYGROUND}
        element={
          <ProtectedRoute>
            <GraphQLPlaygroundPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
