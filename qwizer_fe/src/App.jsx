import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import IndexContainer from './components/IndexContainer';
import LoginComponent from './components/LoginComponent';
import NavBar from './components/common/NavBar';

import BancoPreguntas from './components/BancoPreguntas';
import UploadFile from './components/UploadFile';
import UploadQuestions from './components/UploadQuestions';
import CuestionariosContainer from './components/CuestionariosContainer';
import RegisterContainer from './components/RegisterContainer';

import QrContainer from './components/QrContainer';
import InsercionManual from './components/InsercionManual';

import CrearCuestionario from './components/CrearCuestionario';
import RevisionNotasContainer from './components/RevisionNotasContainer';

import AvailableOffline from './components/AvailableOffline';
import ProtectedRoutes from './hoc/ProtectedRoutes';
import NotFound404 from './components/common/NotFound404';
import useAuth from './hooks/useAuth';
import QuestionContainerNoRevision from './components/QuestionContainerNoRevision';
import QuestionContainerRevision from './components/QuestionContainerRevision';
import useOnline from './hooks/useOnline';

const App = () => {
  const { user, isLogged, isLoading, login, logout } = useAuth();
  const { isOnline } = useOnline();

  if (isLoading) return null;

  // TODO en el navbar se podrian marcar como desactivados los links asi se evita el posible flicker del navbar si se pierde la conexión varias veces
  return (
    <Suspense fallback={<span>Loading...</span>}>
      <Routes>
        <Route
          element={
            <ProtectedRoutes isAllowed={isLogged} redirectPath="/login">
              <NavBar username={user.username} role={user.role} logout={logout} isOffline={!isOnline} />
            </ProtectedRoutes>
          }
        >
          <Route path="/" element={isOnline ? <IndexContainer /> : <AvailableOffline role={user.role} />} />
          <Route path="/cuestionarios/:id" element={<CuestionariosContainer role={user.role} />} />
          <Route path="/offline" element={isOnline ? <AvailableOffline role={user.role} /> : <Navigate to="/404" />} />
          <Route path="/test/:id" element={<QuestionContainerNoRevision role={user.role}/>} />
          <Route path="/revision/:id" element={<QuestionContainerRevision />} />
          {/* FIXME importante arreglar el back devuelve las notas sin comprobar el rol */}
          <Route element={<ProtectedRoutes isAllowed={isOnline && user.role.includes('teacher')} />}>
            <Route path="/banco-preguntas" element={<BancoPreguntas />} />
            <Route path="/upload-questionary" element={<UploadFile />} />
            <Route path="/upload-questions" element={<UploadQuestions />} />
            <Route path="/crear-cuestionario" element={<CrearCuestionario />} />
            <Route path="/revisionNotas/:id" element={<RevisionNotasContainer />} />
            <Route path="/revisionNotas/:id/:idAlumno" element={<QuestionContainerRevision />} />
            <Route path="/register" element={<RegisterContainer />} />
          </Route>
          <Route path="/scanner/:test/:hash" element={<QrContainer userId={user.userId} />} />
          {/* No se usa */}
          <Route path="/insercion-manual/:test/:hash" element={<InsercionManual userId={user.userId} />} />
        </Route>
        <Route path="/login" element={isOnline && !isLogged ? <LoginComponent login={login} /> : <Navigate to={isOnline ? "/" : "/404"} />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </Suspense>
  );
};

export default App;
