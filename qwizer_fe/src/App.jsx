import { Suspense} from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import IndexContainer from './components/IndexContainer';
import LoginComponent from './components/LoginComponent';
import NavBar from './components/common/NavBar';

import BancoPreguntas from './components/BancoPreguntas';
import UploadFile from './components/UploadTest';
import UploadQuestions from './components/UploadQuestions';
import CuestionariosContainer from './components/CuestionariosContainer';
import RegisterContainer from './components/RegisterContainer';

import QrContainer from './components/QrContainer';
import InsercionManual from './components/InsercionManual';

import CrearCuestionario from './components/CrearCuestionario/CrearCuestionario';
import RevisionNotasContainer from './components/RevisionNotasContainer';

import AvailableOffline from './components/AvailableOffline';
import ProtectedRoutes from './hoc/ProtectedRoutes';
import NotFound404 from './components/common/NotFound404';
import useAuth from './hooks/useAuth';
import QuestionContainerNoRevision from './components/QuestionContainerNoRevision/QuestionContainerNoRevision';
import QuestionContainerRevision from './components/QuestionContainerRevision';
import useOnline from './hooks/useOnline';
import { routes } from './constants';
import Notas from './components/Notas';

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
            <ProtectedRoutes isAllowed={isLogged} redirectPath={routes.LOGIN}>
              <NavBar username={user.username} role={user.role} logout={logout} isOffline={!isOnline} />
            </ProtectedRoutes>
          }
        >
          <Route path={routes.INICIO} element={isOnline ? <IndexContainer /> : <AvailableOffline role={user.role} />} />
          <Route path={routes.CUESTIONARIO} element={<CuestionariosContainer role={user.role} />} />
          <Route path={routes.OFFLINE} element={isOnline ? <AvailableOffline role={user.role} /> : <Navigate to={routes.NOT_FOUND} />} />
          <Route path={routes.TEST} element={<QuestionContainerNoRevision role={user.role} />} />
          <Route path={routes.REVISION} element={<QuestionContainerRevision />} />
          {/* FIXME importante arreglar el back devuelve las notas sin comprobar el rol */}
          <Route element={<ProtectedRoutes isAllowed={isOnline && user.role.includes('teacher')} />}>
            <Route path={routes.BANCO_PREGUNTAS} element={<BancoPreguntas />} />
            <Route path={routes.SUBIR_CUESTIONARIO} element={<UploadFile />} />
            <Route path={routes.SUBIR_PREGUNTAS} element={<UploadQuestions />} />
            <Route path={routes.CREAR_CUESTIONARIO} element={<CrearCuestionario />} />
            <Route path={routes.REVISION_NOTAS_CUESTIONARIO} element={<RevisionNotasContainer />} />
            <Route path={routes.REVISION_NOTAS_ALUMNO} element={<QuestionContainerRevision />} />
            <Route path={routes.REGISTRO} element={<RegisterContainer />} />
            <Route path={routes.NOTAS} element={<Notas />} />

          </Route>
          <Route path={routes.QR} element={<QrContainer userId={user.userId} />} />
          <Route path={routes.QR_INSERT} element={<InsercionManual userId={user.userId} />} />
        </Route>
        <Route path={routes.LOGIN} element={isOnline && !isLogged ? <LoginComponent login={login} /> : <Navigate to={isOnline ? routes.INICIO : routes.NOT_FOUND} />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </Suspense>
  );
};

export default App;
