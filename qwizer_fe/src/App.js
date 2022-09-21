import React, { useEffect, useState } from "react";

import { Route, Routes, useNavigate } from "react-router-dom";

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

import { comprobarPassword, descifrarTest, sendTest, getCorrectedTest } from "./utils/manage_test.js";
import { logIn, logOut, getStudents } from "./utils/manage_user.js";
import { getSubjects, getSubjectTests } from "./utils/manage_subjects";
import CuestionarioPassword from "./components/CuestionarioPassword";
import CrearCuestionario from "./components/CrearCuestionario";
import RevisionNotasContainer from "./components/RevisionNotasContainer";

import AvailableOffline from "./components/AvailableOffline";

const App = () => {
  const navigate = useNavigate();
  const [contra, setContra] = useState("");
  const [questionList, setQuestionList] = useState([]);
  const [isAllowed, setIsAllowed] = useState(false); //Indica si se ha desbloqueado el test
  const [isLogged, setIsLogged] = useState(false); //Guarda si se ha hecho login
  const [currentPage, setCurrentPage] = useState("login"); //Página actual que está mostrando el login
  const [username, setUsername] = useState("");
  const [asignaturas, setAsignaturas] = useState([]); //Guarda id y nombre de las asignaturas
  const [cuestionarios, setCuestionarios] = useState([]); //Guarda los nombres de los cuestionarios
  const [idCuestionarios, setIdCuestionarios] = useState([]); //Guarda los IDs de los cuestionarios
  const [rol, setRol] = useState("");
  const [currentTest, setCurrentTest] = useState();
  const [currentAsignatura, setCurrentAsignatura] = useState(); //Guarda el nombre de la asignatura para la que estamos viendo los cuestionarios
  const [cuestionarioViendoNotas, setCuestionarioViendoNotas] = useState(); //Guarda el id del cuestionario cuando un profesor revisa las notas de ese cuestionario

  const [userId, setUserId] = useState();

  const [scanned, setScanned] = useState({});
  const [answerList, setAnswerList] = useState({}); //TODO revisar metodos que los usan, se vuelven a usar mapas :(
  const [testDuration, setTestDuration] = useState();
  const [generatedHash, setGeneratedHash] = useState();
  const [testCorregido, setTestCorregido] = useState();

  useEffect(() => {
    const path = window.location.pathname.split("/");
    checkLogged();
    var actual_page = localStorage.getItem("page");

    if (actual_page == null) {
      localStorage.setItem("page", "login");
    } else {
      getAsignaturas();
      setCurrentPage("index");
      setRol(localStorage.getItem("rol"));
      setUserId(localStorage.getItem("userId"));

      if (window.location.pathname === "/") localStorage.setItem("page", "index");
      else if (path[1] === "scanner") {
        setScanned({
          scannedUserId: path[2],
          scannedCuestionario: path[3],
          scannedHash: path[4],
        });
        changeCurrentPage("insercion-manual");
      }
    }
  }, []);

  //// Funciones Login, Logout y manejo de la sesion del usuario >>>>>>>>>>>>>>>>>>>

  const login = (username, password) => {
    logIn(username, password).then((response) => {
      if (response[0] === " ") {
        window.alert("¡Contraseña incorrecta!");
      } else {
        getAsignaturas();
        setUsername(username);
        setIsLogged(true);
        setCurrentPage("index");
        setRol(response[0]);
        setUserId(response[1]);
        changeCurrentPage("index");
        navigate("/");
      }
    });
  };

  const logout = () => {
    logOut();
    setCurrentPage("login");
    setIsLogged(false);
    localStorage.clear();
    navigate("/login");
  };

  const checkLogged = () => {
    var token = localStorage.getItem("token");
    var usern = localStorage.getItem("username");

    if (token !== null && usern !== null) {
      let pagina = localStorage.getItem("page");
      if (pagina === null) {
        pagina = "index";
        localStorage.setItem("page", pagina);
      }
      setIsLogged(true);
      setUsername(usern);
      setCurrentPage(pagina);
    }
  };

  //  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //// Funciones para guardar las repuestas del Test >>>>>>>>>>>>>>>>>>>

  const initAnswerList = (questionList) => {
    let list = new Map();
    questionList.forEach((pregunta) => list.set(pregunta.id, { type: pregunta.type, answr: "NULL" }));
    setAnswerList(list);
  };

  const addAnswer = (answer) => {
    var newlist = answerList;
    newlist.set(answer.id, { type: answer.respuesta.type, answr: answer.respuesta.answer });

    var listaRespuestas = [];
    for (var [key, value] of newlist.entries()) {
      var pregunta = {};
      pregunta.id = key;
      pregunta.type = value.type;
      if (pregunta.type === "test") {
        pregunta.answr = Number(value.answr);
      } else {
        pregunta.answr = value.answr;
      }

      listaRespuestas.push(pregunta);
    }

    var respuestas = { idCuestionario: currentTest, respuestas: listaRespuestas };
    localStorage.setItem("answers", JSON.stringify(respuestas));

    setAnswerList(newlist);
  };

  //  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //// Funciones para desbloquear, empezar, enviarTest, revision el test >>>>>>>>>>>>>>>>>>>
  const unlockTest = () => {
    if (comprobarPassword(contra, currentTest)) {
      var list = descifrarTest(currentTest);
      initAnswerList(list);
      setQuestionList(list);
      setIsAllowed(true);
      localStorage.setItem("initTime", Date.now()); //guardamos la hora a la que empieza el examen
    }
  };

  const startTest = (id, duracion) => {
    setCurrentTest(id);
    setTestDuration(duracion);
    changeCurrentPage("test");
    navigate("/test");
  };

  const enviarTest = () => {
    var response = sendTest();
    setGeneratedHash(response[1]);
    if (response[0]) {
      changeCurrentPage("index");
    } else {
      changeCurrentPage("QrCode");
    }
  };

  const revisionTest = (idCuestionario) => {
    getCorrectedTest(idCuestionario, "")
      .then((data) => {
        var jsonData = JSON.parse(data.corrected_test);
        setTestCorregido(jsonData);
        changeCurrentPage("revision");
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
        changeCurrentPage("revision");
        navigate("/revision")
      })
      .catch(function (error) {
        console.log("Error", error);
      });
  };

  const revisarNotasTest = (idCuestionario) => {
    setCuestionarioViendoNotas(idCuestionario);
    changeCurrentPage("revisionNotas");
    navigate("/revisionNotas")
  };
  //  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //// Funciones para obtener asignaturas y cuestionarios >>>>>>>>>>>>>>>>>>>
  const getAsignaturas = () => {
    getSubjects().then((data) => {
      setAsignaturas(data.asignaturas);
    });
  };

  const getCuestionarios = (idAsignatura, nombreAsignatura) => {
    getSubjectTests(idAsignatura).then((data) => {
      setCuestionarios(data.cuestionarios);
      setIdCuestionarios(data.idCuestionarios);
      setCurrentAsignatura(nombreAsignatura);
      changeCurrentPage("cuestionarios");
      navigate("/cuestionarios");
    });
  };
  //  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //// Funciones auxiliares >>>>>>>>>>>>>>>>>>>

  const getPass = (e) => {
    //Funcion para conseguir la contraseña del test introducida por el usuario
    setContra(e.target.value);
  };

  //TODO RestorePassword no se usa
  const restorePassword = () => {
    alert("¡Contacta con tu profesor o el administrador!");
  };

  const changeCurrentPage = (page) => {
    //Funcion usada para cambiar de página
    if (page === "logout") {
      logout();
    } else {
      localStorage.setItem("page", page);
    }
    setCurrentPage(page);
    setIsAllowed(false);
  };

  //  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //  -----------------------------------------------------------------------------------------

  /* TODO Proteger rutas porque esto no impide que se vuelva a acceder despues de cerrar sesion*/
  if (!isLogged) {
    //Pagina de login (usuario no logeado)
    document.title = "Login";
    return (
        <LoginComponent login={login} />
    );
  } else {
    //Usuario logeado
    return (
      <>
        <NavBar changeCurrentPage={changeCurrentPage} username={username} rol={rol} logout={logout} />
        <Routes>
          <Route path="/" element={<IndexContainer getAsignaturas={getAsignaturas} empezarTest={startTest} asignaturas={asignaturas} getCuestionarios={getCuestionarios} />} />
          <Route path="/cuestionarios" element={<CuestionariosContainer cuestionarios={cuestionarios} idCuestionarios={idCuestionarios} empezarTest={startTest} asignatura={currentAsignatura} revisionTest={revisionTest} revisionTestProfesor={revisionTestProfesor} rol={rol} revisarNotasTest={revisarNotasTest} />} />
          <Route path="/offline" element={<AvailableOffline empezarTest={startTest} />} />
          <Route path="/test" element={isAllowed ? <QuestionContainer revision={false} testName={cuestionarios[idCuestionarios.indexOf(currentTest)]} duration={testDuration} idCuestionario={currentTest} questionList={questionList} sendTest={enviarTest} addAnswerMethod={addAnswer} /> : <CuestionarioPassword unlockTest={unlockTest} getPass={getPass} />} />
          <Route path="/revision" element={<QuestionContainer revision={true} correctedTest={testCorregido} />} />
          <Route path="/crear-cuestionario" element={<CrearCuestionario changeCurrentPage={changeCurrentPage} />} />
          <Route path="/upload-questionary" element={<UploadFile />} />
          <Route path="/upload-questions" element={<UploadQuestions />} />
          <Route path="/banco-preguntas" element={<BancoPreguntas />} />
          <Route path="/revisionNotas" element={<RevisionNotasContainer currentCuestionario={cuestionarioViendoNotas} revisionTestProfesor={revisionTestProfesor} />} />
          <Route path="/register" element={<RegisterContainer getSubjects={getSubjects} getStudents={getStudents} />} />
          <Route path="/QrCode" element={<QrContainer userId={userId} generatedHash={generatedHash} currentTest={currentTest} />} />
          <Route path="/insercion-manual" element={<InsercionManual userId={scanned.scannedUserId} generatedHash={scanned.scannedHash} cuestionario={scanned.scannedCuestionario} />} />
          <Route path="*" element={<h1>404</h1>} />
        </Routes>
      </>
    );
  }
};

export default App;
