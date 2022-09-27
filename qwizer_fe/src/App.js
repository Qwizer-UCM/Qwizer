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

import { getCorrectedTest } from "./utils/manage_test.js";
import { logIn, logOut, getStudents } from "./utils/manage_user.js";
import { getSubjects } from "./utils/manage_subjects";
import CrearCuestionario from "./components/CrearCuestionario";
import RevisionNotasContainer from "./components/RevisionNotasContainer";

import AvailableOffline from "./components/AvailableOffline";

const App = () => {
  const navigate = useNavigate();

  const [isLogged, setIsLogged] = useState(); //Guarda si se ha hecho login
  const [username, setUsername] = useState("");
  const [rol, setRol] = useState("");
  const [cuestionarioViendoNotas, setCuestionarioViendoNotas] = useState(); //Guarda el id del cuestionario cuando un profesor revisa las notas de ese cuestionario

  const [userId, setUserId] = useState();

  const [testCorregido, setTestCorregido] = useState();

  useEffect(() => {
    let token = localStorage.getItem("token");
    let usern = localStorage.getItem("username");

    // TODO no se comprueba que el token sea válido 😐 y tampoco se refresca.
    if (token !== null && usern !== null) {
      setIsLogged(true);
      setUsername(usern);
    }
  }, []);

  //// Funciones Login, Logout y manejo de la sesion del usuario >>>>>>>>>>>>>>>>>>>

  const login = (username, password) => {
    logIn(username, password).then((response) => {
      if (response[0] === " ") {
        window.alert("¡Contraseña incorrecta!");
      } else {
        setUsername(username);
        setIsLogged(true);
        setRol(response[0]);
        setUserId(response[1]);
        navigate("/");
      }
    });
  };

  const logout = () => {
    logOut();
    setIsLogged(false);
    localStorage.clear();
    navigate("/login");
  };

  //  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //// Funciones para desbloquear, empezar, enviarTest, revision el test >>>>>>>>>>>>>>>>>>>

  const revisionTest = (idCuestionario) => {
    getCorrectedTest(idCuestionario, "")
      .then((data) => {
        var jsonData = JSON.parse(data.corrected_test);
        setTestCorregido(jsonData);
        navigate("/revision");
      })
      .catch(function (error) {
        console.log("Error", error);
      });
  };

  const revisionTestProfesor = (idCuestionario, idAlumno) => {
    getCorrectedTest(idCuestionario, idAlumno)
      .then((data) => {
        var jsonData = JSON.parse(data.corrected_test);
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

  const protectedRoutes = () => {
    if (isLogged === undefined) return null;
    return isLogged ? (
      <>
        <NavBar username={username} rol={rol} logout={logout} />
        <Outlet />
      </>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <Routes>
      <Route element={protectedRoutes()}>
        <Route path="/" element={<IndexContainer />} />
        <Route path="/cuestionarios/:id" element={<CuestionariosContainer revisionTest={revisionTest} revisionTestProfesor={revisionTestProfesor} rol={rol} revisarNotasTest={revisarNotasTest} />} />
        <Route path="/offline" element={<AvailableOffline />} />
        <Route path="/test/:id" element={<QuestionContainer revision={false} />} />
        <Route path="/revision/:id" element={<QuestionContainer revision={true} correctedTest={testCorregido} />} />
        <Route path="/crear-cuestionario" element={<CrearCuestionario />} />
        <Route path="/upload-questionary" element={<UploadFile />} />
        <Route path="/upload-questions" element={<UploadQuestions />} />
        <Route path="/banco-preguntas" element={<BancoPreguntas />} />
        <Route path="/revisionNotas/:id" element={<RevisionNotasContainer currentCuestionario={cuestionarioViendoNotas} revisionTestProfesor={revisionTestProfesor} />} />
        <Route path="/register" element={<RegisterContainer getSubjects={getSubjects} getStudents={getStudents} />} />
        <Route path="/scanner/:test/:hash" element={<QrContainer userId={userId} />} />
        {/*No se usa */}
        <Route path="/insercion-manual/:test/:hash" element={<InsercionManual userId={userId} />} />
      </Route>
      <Route path="/login" element={!isLogged ? <LoginComponent login={login} /> : <Navigate to={"/"} />} />
      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  );
};

export default App;
