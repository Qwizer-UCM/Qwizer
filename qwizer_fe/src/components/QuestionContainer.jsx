import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Countdown from "react-countdown";
import CryptoJS from "crypto-js";
import TestQuestion from "./TestQuestion";
import TextQuestion from "./TextQuestion";
import QuestionNav from "./QuestionNav";
import ErrorModal from "./common/modals/ErrorModal";
import Tests from "../services/Tests";

const getTestFromLocalStorage = (testId) => {
  const tests = localStorage.getItem("tests");  // TODO pensar en usar indexDB en vez de localstorage
  const found = tests ? JSON.parse(tests).find(test => JSON.parse(test).id === testId) : false;
  return found ? JSON.parse(found) : null;
};

const descifrarTest = (currentTest) => {
  const input = getTestFromLocalStorage(currentTest);
  const cipher = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(input.encrypted_message),
  });
  const key = CryptoJS.enc.Hex.parse(input.password);
  const iv = CryptoJS.enc.Hex.parse(input.iv);

  const result = CryptoJS.AES.decrypt(cipher, key, { iv, mode: CryptoJS.mode.CFB });
  
  return JSON.parse(result.toString(CryptoJS.enc.Utf8)).questions;
};

const comprobarPassword = (contra, currentTest) => contra !== "" && CryptoJS.SHA256(contra).toString() === getTestFromLocalStorage(currentTest).password;

const CuestionarioPassword = ({getPass,unlockTest}) => {
  const message = "Contraseña incorrecta";

  return (
    <div className="index-body">
      <div className="card tabla-notas">
        <div className="card-content">
          <div className="col text-center">
            <h3>Introduce la contraseña para empezar el examen!</h3>
          </div>

          <div className="p-4 row">
            <div className="col text-center">
              <input type="text" className="center form-control" onChange={getPass} />
            </div>
          </div>
          <div className="p-4 row">
            <div className="col text-center">
              <button type="button" className="btn btn-success" onClick={unlockTest}>
                Empezar Test
              </button>
            </div>
          </div>
        </div>
      </div>
      <ErrorModal id="password_error" message={message} />
    </div>
  );
};

const addTestToLocalStorage = (jsonObject) => {
  const tests = localStorage.getItem("tests");
  const test = tests ? JSON.stringify([...JSON.parse(tests),jsonObject]) : JSON.stringify([jsonObject]);
  localStorage.setItem("tests", test);
};

// FIXME mover revisionTest y revisionTestProfesor de App.js a este componente
const QuestionContainer = ({revision}) => {
  const navigate = useNavigate();
  const params = useParams();

  const [contra, setContra] = useState("");
  const [indPregunta, setindPregunta] = useState(0);
  const [questionList, setQuestionList] = useState([]);
  const [answerList, setAnswerList] = useState({}); // TODO revisar metodos que los usan, se vuelven a usar mapas :(
  const [isAllowed, setIsAllowed] = useState(false); // Indica si se ha desbloqueado el test
  const [descargado, setDescargado] = useState(false);
  const [testCorregido, setTestCorregido] = useState();
  const duration = getTestFromLocalStorage(params.id)?.duracion // TODO arreglo momentaneo

  useEffect(() => {
    if(revision){
      Tests.getCorrectedTest(params.id, params.idAlumno ?? "")
      .then(({ data }) => {
        const jsonData = JSON.parse(data.corrected_test);
        setTestCorregido(jsonData);
      })
      .catch((error) => {
        console.log("Error", error);
      });
    } else if(!getTestFromLocalStorage(params.id)){
        Tests.get(params.id).then(({ data }) => {
          addTestToLocalStorage(JSON.stringify(data));
          setDescargado(true);
        });
      }else{
        setDescargado(true);
      }
  }, [params.id, params.idAlumno, revision]);

  const updateTime = () => {
    let initTime = Number(localStorage.getItem("initTime"));
    initTime = new Date(initTime);
    let actualTime = Date.now();
    actualTime = new Date(actualTime);

    const tiempoInicial = initTime.getHours() * 3600 + initTime.getMinutes() * 60 + initTime.getSeconds();
    const tiempoActual = actualTime.getHours() * 3600 + actualTime.getMinutes() * 60 + actualTime.getSeconds();
    const passedSeconds = tiempoActual - tiempoInicial;

    let leftSeconds = duration * 60 - passedSeconds;

    if (leftSeconds <= 0) {
      leftSeconds = 0;
    }

    // comprobar si se ha pasado de fecha ???

    return leftSeconds;
  };

  const questionType = (pregunta) => {
    if (pregunta != null) {
      if (pregunta.type === "test") {
        return <TestQuestion mode={revision ? "revision" : "test"} infoPreg={pregunta} key={pregunta.id} idCuestionario={params.id} question={pregunta.question} options={pregunta.options} id={pregunta.id} type={pregunta.type} addAnswerd={addAnswer} />;
      } // else type = 'text'
      return <TextQuestion mode={revision ? "revision" : "test"} infoPreg={pregunta} key={pregunta.id} idCuestionario={params.id} question={pregunta.question} id={pregunta.id} type={pregunta.type} addAnswerd={addAnswer} />;
    }
    return null;
  };

  const updateIndNext = () => {
    if (indPregunta + 1 <= questionList.length - 1) {
      setindPregunta((prev) => prev + 1);
    }
  };
  const updateIndBack = () => {
    if (indPregunta - 1 >= 0) {
      setindPregunta((prev) => prev - 1);
    }
  };

  const renderButtons = () => {
    if (indPregunta === 0 && questionList.length === 0) {
      return (
        <div className="p-2 col text-center">
          <button type="button" className="btn btn-warning" onClick={endTest}>
            Terminar y Enviar
          </button>
        </div>
      );
    } 
    if (indPregunta === 0) {
      return (
        <div className="p-2 col text-center">
          <button type="button" className="btn btn-success" onClick={updateIndNext}>
            Siguiente
          </button>
        </div>
      );
    } 
    if (indPregunta > 0 && indPregunta < questionList.length - 1) {
      return (
        <div className="p-2 col text-center">
          <button type="button" className="btn btn-success" onClick={updateIndBack}>
            Atras
          </button>
          <button type="button" className="btn btn-success" onClick={updateIndNext}>
            Siguiente
          </button>
        </div>
      );
    } 

    // indPregunta == numPreguntas-1
    return (
      <div className="p-2 col text-center">
        <button type="button" className="btn btn-success" onClick={updateIndBack}>
          Atras
        </button>
        <button type="button" className="btn btn-warning" onClick={endTest}>
          Terminar y Enviar
        </button>
      </div>
    );
    
  };

  const navHandler = (val) => {
    setindPregunta(val);
  };

  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      endTest();
      localStorage.removeItem("initTime");
      localStorage.removeItem("answers");
      return <h1>Test Enviado</h1>;
    } 
    // Render a countdown
    const totalSeconds = duration * 60; // segundos
    const leftSeconds = hours * 3600 + minutes * 60 + seconds;
    const porcentaje = 100 - parseInt((leftSeconds / totalSeconds) * 100, 10);
    return (
      <div>
        <p className="text-center">
          {hours}h:{minutes}min:{seconds}s
        </p>
        <div className="progress">
          <div className="progress-bar progress-bar-striped" role="progressbar" style={{ width: `${porcentaje}%` }} aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100" />
        </div>
      </div>
    );
    
  };

  const endTest = () => {
    const respuestas = localStorage.getItem("answers");
    const hash = CryptoJS.SHA256(respuestas).toString();
    const sent = navigator.onLine;
    // TODO por qué no se espera respuesta de esta peticion??
    console.log(respuestas)
    Tests.sendTest(respuestas, hash)
      .then(() => console.log("END"))
      .catch((e) => console.error(e));

    if (sent) {
      navigate("/", { replace: true });
    } else {
      navigate(`/scanner/${params.id}/${hash}`, { replace: true });
    }
  };

  const initAnswerList = (questions) => {
    const list = new Map();
    questions.forEach((pregunta) => list.set(pregunta.id, { type: pregunta.type, answr: "NULL" }));
    setAnswerList(list);
  };

  const unlockTest = () => {
    if (comprobarPassword(contra, params.id)) {
      const list = descifrarTest(params.id);
      initAnswerList(list);
      setQuestionList(list);
      setIsAllowed(true);
      localStorage.setItem("initTime", Date.now()); // guardamos la hora a la que empieza el examen
    } else {
      window.$("#password_error").modal("show");
    }
  };

  const getPass = (e) => {
    // Funcion para conseguir la contraseña del test introducida por el usuario
    setContra(e.target.value);
  };

  const addAnswer = (answer) => {
    const newlist = answerList;
    newlist.set(answer.id, { type: answer.respuesta.type, answr: answer.respuesta.answer });

    const listaRespuestas = [];
    for (const [key, value] of newlist.entries()) {
      listaRespuestas.push({
        id: key,
        type: value.type,
        answr: value.type === "test" ? Number(value.answr) : value.answr
      });
    }

    const respuestas = { idCuestionario: params.id, respuestas: listaRespuestas };
    localStorage.setItem("answers", JSON.stringify(respuestas));

    setAnswerList(newlist);
  };

  const renderQtype = questionType;

  if(!revision && !descargado) return null;

  if (!revision && !isAllowed) return <CuestionarioPassword unlockTest={unlockTest} getPass={getPass} />;

  if (!revision && questionList.length !== 0) {
    const pregunta = questionList[indPregunta];
    return (
      <div className="index-body container-fluid" id="questions">
        <div className="p-4 row-1">
          <div className="col card">
            <h1 className="text-center">FALTA FUNCION QUE DEVUELVA CUESTIONARIO{}</h1>
            <Countdown date={Date.now() + updateTime() * 1000} renderer={renderer} />
          </div>
        </div>

        <div className="p-4 row">
          <div className="p-2 col-9" id="question">
            <div className="card">
              <div key={pregunta.id}>
                <h2 className="p-2 m-2 card">
                  {" "}
                  {indPregunta + 1}
                  {`.-${pregunta.question}`}
                </h2>
                {renderQtype(pregunta)}
              </div>
            </div>
          </div>

          <div className="p-2 col-3" id="question-nav">
            <QuestionNav navigationHandler={navHandler} listaPreguntas={questionList} />
          </div>
        </div>

        <div className="p-4 row">
          <div className="col">{renderButtons()}</div>
        </div>
      </div>
    );
  } 
  if (revision === true && testCorregido) {
    return (
      <div className="index-body container-fluid" id="questions">
        <div className="p-4 row-1">
          <div className="col card">
            <h1 className="text-center">{testCorregido.titulo}</h1>
          </div>
          <div className="col card">
            <h1 className="text-center">Calificación: {testCorregido.nota}</h1>
          </div>
        </div>

        <div className="p-4 row">
          <div className="p-2 col-9" id="question">
            <div className="card">
              <div key={testCorregido.questions[indPregunta].id}>
                <h2 className="p-2 m-2 card">
                  {" "}
                  {indPregunta + 1}
                  {`.-${testCorregido.questions[indPregunta].question}`}
                </h2>
                {renderQtype(testCorregido.questions[indPregunta])}
              </div>
            </div>
          </div>

          <div className="p-2 col-3" id="question-nav">
            <QuestionNav navigationHandler={navHandler} listaPreguntas={testCorregido.questions} />
          </div>
        </div>
      </div>
    );
  } 
  
  return <h1>Loading...</h1>;
  
};

export default QuestionContainer;
