import React, { useEffect, useState } from "react";

import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";

import IndexContainer from "./components/IndexContainer";
import QuestionContainer from "./components/QuestionContainer.js";

import LoginComponent from "./components/LoginComponent";
import NavBar from "./components/common/NavBar";

import BancoPreguntas from "./components/BancoPreguntas";
import UploadFile from "./components/UploadFile";
import UploadQuestions from "./components/UploadQuestions";
import CuestionariosContainer from "./components/CuestionariosContainer";
import RegisterContainer from "./components/RegisterContainer";

import QrContainer from "./components/QrContainer";
import InsercionManual from "./components/InsercionManual";

import Tests from "./services/Tests.js";
import Users from "./services/Users.js";
import CrearCuestionario from "./components/CrearCuestionario";
import RevisionNotasContainer from "./components/RevisionNotasContainer";

import AvailableOffline from "./components/AvailableOffline";
import ProtectedRoutes from "./hoc/ProtectedRoutes";
import NotFound404 from "./components/common/NotFound404";
import useDocumentTitle from "./hooks/useDocumentTitle";

const App = () => {
  useDocumentTitle() //TODO se puede usar en cada componente pasandole un titulo para cada pagina
  const navigate = useNavigate();

  const [isLogged, setIsLogged] = useState(); //Guarda si se ha hecho login
  const [user, setUser] = useState({username: "", role:"", id: ""});
  const [cuestionarioViendoNotas, setCuestionarioViendoNotas] = useState(); //Guarda el id del cuestionario cuando un profesor revisa las notas de ese cuestionario
  const [testCorregido, setTestCorregido] = useState();

  useEffect(() => {
    Users.me().then(({data}) => {
      setIsLogged(true);
      setUser({username: data.email, role: data.role, id:data.id})
    }).catch(({response}) => {
      console.error(response.data.detail)
      localStorage.clear() //TODO Seria correcto borrar localstorage?
      setIsLogged(false);
    })
  }, []);

  //// Funciones Login, Logout y manejo de la sesion del usuario >>>>>>>>>>>>>>>>>>>

  const login = (username, password) => {
    Users.login(username, password).then(({ data }) => {
      localStorage.setItem("token",`Token ${data.auth_token}`)
      setIsLogged(true);     
    }).catch(({response}) => {
      console.error(response.data.non_field_errors[0])
    });
  };

  const logout = () => {
    Users.logout().then(() => {
      localStorage.clear();
      setIsLogged(false);
    }).catch(({response}) => {
      console.error(response.data.detail)
    });
  };

  //  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //// Funciones para desbloquear, empezar, enviarTest, revision el test >>>>>>>>>>>>>>>>>>>
  //FIXME estas funciones tienen que ser movidas para que funcione /revision
  const revisionTest = (idCuestionario) => {
    Tests.getCorrectedTest(idCuestionario, "")
      .then(({ data }) => {
        let jsonData = JSON.parse(data.corrected_test);
        setTestCorregido(jsonData);
        navigate("/revision");
      })
      .catch(function (error) {
        console.log("Error", error);
      });
  };

  const revisionTestProfesor = (idCuestionario, idAlumno) => {
    Tests.getCorrectedTest(idCuestionario, idAlumno)
      .then(({ data }) => {
        let jsonData = JSON.parse(data.corrected_test);
        setTestCorregido(jsonData);
        navigate("/revision");
      })
      .catch(function (error) {
        console.log("Error", error);
      });
  };

  const revisarNotasTest = (idCuestionario) => {
    setCuestionarioViendoNotas(idCuestionario);
    navigate("/revisionNotas");
  };

  if (isLogged === undefined) return null;

  return (
    <Routes>
      <Route
        element={
          <ProtectedRoutes isAllowed={isLogged}>
            <NavBar username={user.username} rol={user.role} logout={logout} />
          </ProtectedRoutes>
        }
      >
        <Route path="/" element={<IndexContainer />} />
        <Route path="/cuestionarios/:id" element={<CuestionariosContainer rol={user.role} revisionTest={revisionTest} revisionTestProfesor={revisionTestProfesor} revisarNotasTest={revisarNotasTest} />} />
        <Route path="/offline" element={<AvailableOffline />} />
        <Route path="/test/:id" element={<QuestionContainer revision={false} />} />
        <Route path="/revision/:id" element={<QuestionContainer revision={true} correctedTest={testCorregido} />} />
        {/* FIXME importante arreglar el back devuelve las notas sin comprobar el rol */}
        <Route element={<ProtectedRoutes isAllowed={user.role.includes("teacher")} redirectPath={"/404"} />}>
          <Route path="/banco-preguntas" element={<BancoPreguntas />} />
          <Route path="/upload-questionary" element={<UploadFile />} />
          <Route path="/upload-questions" element={<UploadQuestions />} />
          <Route path="/crear-cuestionario" element={<CrearCuestionario />} />
          <Route path="/revisionNotas/:id" element={<RevisionNotasContainer currentCuestionario={cuestionarioViendoNotas} revisionTestProfesor={revisionTestProfesor} />} />
          <Route path="/register" element={<RegisterContainer />} />
        </Route>
        <Route path="/scanner/:test/:hash" element={<QrContainer userId={user.userId} />} />
        {/*No se usa */}
        <Route path="/insercion-manual/:test/:hash" element={<InsercionManual userId={user.userId} />} />
      </Route>
      <Route path="/login" element={!isLogged ? <LoginComponent login={login} /> : <Navigate to={"/"} />} />
      <Route path="/404" element={<NotFound404 />} />
      <Route path="*" element={<Navigate to={"/404"} />} />
    </Routes>
  );
};

export default App;
