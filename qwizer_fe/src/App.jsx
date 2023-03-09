import { Suspense} from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import IndexContainer from './components/IndexContainer';
import LoginComponent from './components/LoginComponent';
import NavBar from './components/common/NavBar';

import BancoPreguntas from './components/BancoPreguntas';
import UploadTest from './components/UploadTest';
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
import UploadNotas from './components/UploadNotas';
import { BANCO_PREGUNTAS, CREAR_CUESTIONARIO, CUESTIONARIO, INICIO, LOGIN, NOTAS, NOT_FOUND, OFFLINE, QR, QR_INSERT, REGISTRO, REVISION, REVISION_NOTAS_ALUMNO, REVISION_NOTAS_CUESTIONARIO, SUBIR_CUESTIONARIO, SUBIR_PREGUNTAS, TEST } from './constants';

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
            <ProtectedRoutes isAllowed={isLogged} redirectPath={LOGIN}>
              <NavBar username={user.username} role={user.role} logout={logout} isOffline={!isOnline} />
            </ProtectedRoutes>
          }
        >
          <Route path={INICIO} element={isOnline ? <IndexContainer /> : <AvailableOffline role={user.role} />} />
          <Route path={CUESTIONARIO} element={<CuestionariosContainer role={user.role} />} />
          <Route path={OFFLINE} element={isOnline ? <AvailableOffline role={user.role} /> : <Navigate to={NOT_FOUND} />} />
          <Route path={TEST} element={<QuestionContainerNoRevision role={user.role} />} />
          <Route path={REVISION} element={<QuestionContainerRevision id={user.id} role={user.role}/>} />
          {/* FIXME importante arreglar el back devuelve las notas sin comprobar el rol */}
          <Route element={<ProtectedRoutes isAllowed={isOnline && user.role.includes('teacher')} />}>
            <Route path={BANCO_PREGUNTAS} element={<BancoPreguntas />} />
            <Route path={SUBIR_CUESTIONARIO} element={<UploadTest />} />
            <Route path={SUBIR_PREGUNTAS} element={<UploadQuestions />} />
            <Route path={CREAR_CUESTIONARIO} element={<CrearCuestionario />} />
            <Route path={REVISION_NOTAS_CUESTIONARIO} element={<RevisionNotasContainer />} />
            <Route path={REVISION_NOTAS_ALUMNO} element={<QuestionContainerRevision role={user.role}/>} />
            <Route path={REGISTRO} element={<RegisterContainer />} />
            <Route path={NOTAS} element={<UploadNotas />} />

          </Route>
          <Route path={QR} element={<QrContainer userId={user.userId} />} />
          <Route path={QR_INSERT} element={<InsercionManual userId={user.userId} />} />
        </Route>
        <Route path={LOGIN} element={isOnline && !isLogged ? <LoginComponent login={login} /> : <Navigate to={isOnline ? INICIO : NOT_FOUND} />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </Suspense>
  );
};

export default App;
