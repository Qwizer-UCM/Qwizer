import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import IndexContainer from "./components/IndexContainer";
import QuestionContainer from "./components/QuestionContainer";

import LoginComponent from "./components/LoginComponent";
import NavBar from "./components/common/NavBar";

import BancoPreguntas from "./components/BancoPreguntas";
import UploadFile from "./components/UploadFile";
import UploadQuestions from "./components/UploadQuestions";
import CuestionariosContainer from "./components/CuestionariosContainer";
import RegisterContainer from "./components/RegisterContainer";

import QrContainer from "./components/QrContainer";
import InsercionManual from "./components/InsercionManual";

import CrearCuestionario from "./components/CrearCuestionario";
import RevisionNotasContainer from "./components/RevisionNotasContainer";

import AvailableOffline from "./components/AvailableOffline";
import ProtectedRoutes from "./hoc/ProtectedRoutes";
import NotFound404 from "./components/common/NotFound404";
import useDocumentTitle from "./hooks/useDocumentTitle";
import useAuth from "./hooks/useAuth";

const App = () => {
  const {  user, isLogged, login, logout} = useAuth();
  useDocumentTitle() // TODO se puede usar en cada componente pasandole un titulo para cada pagina

  if (isLogged === undefined) return null;

  return (
    <Suspense fallback={<span>Loading...</span>}>
      <Routes>
        <Route
          element={
            <ProtectedRoutes isAllowed={isLogged}>
              <NavBar username={user.username} role={user.role} logout={logout} />
            </ProtectedRoutes>
          }
        >
          <Route path="/" element={<IndexContainer />} />
          <Route path="/cuestionarios/:id" element={<CuestionariosContainer role={user.role} />} />
          <Route path="/offline" element={<AvailableOffline role={user.role}/>} />
          <Route path="/test/:id" element={<QuestionContainer revision={false} />} />
          <Route path="/revision/:id" element={<QuestionContainer revision />} />
          {/* FIXME importante arreglar el back devuelve las notas sin comprobar el rol */}
          <Route element={<ProtectedRoutes isAllowed={user.role.includes("teacher")} redirectPath="/404" />}>
            <Route path="/banco-preguntas" element={<BancoPreguntas />} />
            <Route path="/upload-questionary" element={<UploadFile />} />
            <Route path="/upload-questions" element={<UploadQuestions />} />
            <Route path="/crear-cuestionario" element={<CrearCuestionario />} />
            <Route path="/revisionNotas/:id" element={<RevisionNotasContainer />} />
            <Route path="/revisionNotas/:id/:idAlumno" element={<QuestionContainer revision />} />
            <Route path="/register" element={<RegisterContainer />} />
          </Route>
          <Route path="/scanner/:test/:hash" element={<QrContainer userId={user.userId} />} />
          {/* No se usa */}
          <Route path="/insercion-manual/:test/:hash" element={<InsercionManual userId={user.userId} />} />
        </Route>
        <Route path="/login" element={!isLogged ? <LoginComponent login={login} /> : <Navigate to="/" />} />
        <Route path="/404" element={<NotFound404 />} />
        <Route path="*" element={<Navigate to="/404"/>} />
      </Routes>
    </Suspense>
  );
};

export default App;
