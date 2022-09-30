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
    } else {
      setIsLogged(false);
    }

  }, []);

  //// Funciones Login, Logout y manejo de la sesion del usuario >>>>>>>>>>>>>>>>>>>

  const login = (username, password) => {
    Users.login(username,password).then(({data})=> {
      if(data.respuesta === "invalid login"){
        window.alert("¡Contraseña incorrecta!");
      }else{
        localStorage.setItem('token',data.token);
        localStorage.setItem('username',username);
        localStorage.setItem('rol', data.rol);
        localStorage.setItem('userId', data.id);

        setUsername(username);
        setRol(data.rol);
        setUserId(data.id);
        setIsLogged(true);
        navigate("/");
    }
    });
  };

  const logout = () => {
    Users.logout().then(({data}) => {
      //TODO Mejor devolver otra cosa desde la api
      if(data === "Logged out"){
        setIsLogged(false);
        localStorage.clear();
        navigate("/login");
      }
    });
  };

  //  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //// Funciones para desbloquear, empezar, enviarTest, revision el test >>>>>>>>>>>>>>>>>>>

  const revisionTest = (idCuestionario) => {
    Tests.getCorrectedTest(idCuestionario, "")
      .then(({data}) => {
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
      .then(({data}) => {
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

  const protectedRoutes = () => {
    return isLogged ? (
      <>
        <NavBar username={username} rol={rol} logout={logout} />
        <Outlet />
      </>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  if (isLogged === undefined) return null;    

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
        <Route path="/register" element={<RegisterContainer />} />
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
