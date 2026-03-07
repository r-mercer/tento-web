import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { FluentProvider } from "@fluentui/react-components";
import { ToastProvider } from "./components/ui/ToastProvider";
import { Navbar } from "./components/ui/Navbar";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { RouteFallback } from "./components/ui/RouteFallback";
import { lightTheme, darkTheme } from "./styles/fluentTheme";
import { useTheme } from "./contexts/ThemeContext";
import { ROUTES } from "./utils/constants";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { QuizzesPage } from "./pages/QuizzesPage";

const CreateQuizPage = lazy(() =>
  import("./pages/CreateQuizPage").then((module) => ({
    default: module.CreateQuizPage,
  })),
);

const EditQuizPage = lazy(() =>
  import("./pages/EditQuizPage").then((module) => ({
    default: module.EditQuizPage,
  })),
);

const GraphQLPlaygroundPage = lazy(() =>
  import("./pages/GraphQLPlaygroundPage").then((module) => ({
    default: module.GraphQLPlaygroundPage,
  })),
);

const QuizPage = lazy(() =>
  import("./components/quiz").then((module) => ({
    default: module.QuizPage,
  })),
);

const QuizHistoryPage = lazy(() =>
  import("./components/quiz").then((module) => ({
    default: module.QuizHistoryPage,
  })),
);

const QuizErrorBoundary = lazy(() =>
  import("./components/quiz").then((module) => ({
    default: module.QuizErrorBoundary,
  })),
);

function App() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? darkTheme : lightTheme;

  return (
    <FluentProvider theme={theme}>
      <ToastProvider>
        <Navbar />
        <Suspense fallback={<RouteFallback />}>
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
              path={ROUTES.QUIZ_CREATE}
              element={
                <ProtectedRoute>
                  <CreateQuizPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quizzes/:id/take"
              element={
                <ProtectedRoute>
                  <QuizErrorBoundary>
                    <QuizPage />
                  </QuizErrorBoundary>
                </ProtectedRoute>
              }
            />

            <Route
              path="/quizzes/:id/edit"
              element={
                <ProtectedRoute>
                  <EditQuizPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quizzes/:id/history"
              element={
                <ProtectedRoute>
                  <QuizErrorBoundary>
                    <QuizHistoryPage />
                  </QuizErrorBoundary>
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
        </Suspense>
      </ToastProvider>
    </FluentProvider>
  );
}

export default App;
