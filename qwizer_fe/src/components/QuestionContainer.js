import React, { useEffect, useState } from "react";

import TestQuestion from "./TestQuestion.js";
import TextQuestion from "./TextQuestion.js";
import QuestionNav from "./QuestionNav.js";
import Countdown from "react-countdown";
import ErrorModal from "./common/modals/ErrorModal";
import Tests from "../services/Tests.js";
import { useNavigate, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";

const getTestFromLocalStorage = (testId) => {
  let tests = localStorage.getItem("tests");
  let cuestionariosList = JSON.parse(tests);
  for (const cuestionario of cuestionariosList) {
    let test = JSON.parse(cuestionario);
    if (test.id === Number(testId)) {
      //TODO revisar tipos en otras condiciones ===
      return test;
    }
  }
};

const descifrarTest = (currentTest) => {
  let input = getTestFromLocalStorage(currentTest);
  let cifradas = input.encrypted_message;
  let key = CryptoJS.enc.Hex.parse(input.password);
  let iv = CryptoJS.enc.Hex.parse(input.iv);
  let cipher = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(cifradas),
  });

  let result = CryptoJS.AES.decrypt(cipher, key, { iv: iv, mode: CryptoJS.mode.CFB });
  let text = result.toString(CryptoJS.enc.Utf8);
  text = JSON.parse(text);
  return text.questions;
};

const comprobarPassword = (contra, currentTest) => {
  if (contra !== "") {
    let text = getTestFromLocalStorage(currentTest);
    if (CryptoJS.SHA256(contra).toString() === text.password) return true;
  }
  window.$("#password_error").modal("show");
  return false;
};

const CuestionarioPassword = (props) => {
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
              <input type="text" className="center form-control" onChange={props.getPass}></input>
            </div>
          </div>
          <div className="p-4 row">
            <div className="col text-center">
              <button type="button" className="btn btn-success" onClick={props.unlockTest}>
                Empezar Test
              </button>
            </div>
          </div>
        </div>
      </div>
      <ErrorModal id={"password_error"} message={message}></ErrorModal>
    </div>
  );
};
//FIXME mover revisionTest y revisionTestProfesor de App.js a este componente
const QuestionContainer = (props) => {
  const navigate = useNavigate();
  const params = useParams();

  const [contra, setContra] = useState("");
  const [indPregunta, setindPregunta] = useState(0);
  const [numPreguntas, setNumPreguntas] = useState(0);
  const [questionList, setQuestionList] = useState([]);
  const [answerList, setAnswerList] = useState({}); //TODO revisar metodos que los usan, se vuelven a usar mapas :(
  const [isAllowed, setIsAllowed] = useState(false); //Indica si se ha desbloqueado el test
  const duration = getTestFromLocalStorage(params.id).duracion //TODO arreglo momentaneo
  const updateTime = () => {
    let initTime = Number(localStorage.getItem("initTime"));
    initTime = new Date(initTime);
    let actualTime = Date.now();
    actualTime = new Date(actualTime);

    let tiempoInicial = initTime.getHours() * 3600 + initTime.getMinutes() * 60 + initTime.getSeconds();
    let tiempoActual = actualTime.getHours() * 3600 + actualTime.getMinutes() * 60 + actualTime.getSeconds();
    let passedSeconds = tiempoActual - tiempoInicial;

    let leftSeconds = duration * 60 - passedSeconds;

    if (leftSeconds <= 0) {
      leftSeconds = 0;
    }

    //comprobar si se ha pasado de fecha ???

    return leftSeconds;
  };

  useEffect(() => {
    if (questionList) {
      //si esta definido, porque si hace revision no lo esta
      setNumPreguntas(questionList.length);
    }
  }, [questionList]);

  const questionType = (pregunta) => {
    if (pregunta != null) {
      if (pregunta.type === "test") {
        return <TestQuestion mode={props.revision ? "revision" : "test"} infoPreg={pregunta} key={pregunta.id} idCuestionario={params.id} question={pregunta.question} options={pregunta.options} id={pregunta.id} type={pregunta.type} addAnswerd={addAnswer} />;
      } // else type = 'text'
      return <TextQuestion mode={props.revision ? "revision" : "test"} infoPreg={pregunta} key={pregunta.id} idCuestionario={params.id} question={pregunta.question} id={pregunta.id} type={pregunta.type} addAnswerd={addAnswer} />;
    }
  };

  const updateIndNext = () => {
    if (indPregunta + 1 <= numPreguntas - 1) {
      setindPregunta((prev) => prev + 1);
    }
  };
  const updateIndBack = () => {
    if (indPregunta - 1 >= 0) {
      setindPregunta((prev) => prev - 1);
    }
  };

  const renderButtons = () => {
    if (indPregunta === 0 && numPreguntas === 0) {
      return (
        <div className="p-2 col text-center">
          <button type="button" className="btn btn-warning" onClick={endTest}>
            Terminar y Enviar
          </button>
        </div>
      );
    } else if (indPregunta === 0) {
      return (
        <div className="p-2 col text-center">
          <button type="button" className="btn btn-success" onClick={updateIndNext}>
            Siguiente
          </button>
        </div>
      );
    } else if (indPregunta > 0 && indPregunta < numPreguntas - 1) {
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
    } else {
      //indPregunta == numPreguntas-1
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
    }
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
    } else {
      // Render a countdown
      let totalSeconds = duration * 60; //segundos
      let leftSeconds = hours * 3600 + minutes * 60 + seconds;
      let porcentaje = 100 - parseInt((leftSeconds / totalSeconds) * 100);
      return (
        <div>
          <p className="text-center">
            {hours}h:{minutes}min:{seconds}s
          </p>
          <div className="progress">
            <div className="progress-bar progress-bar-striped" role="progressbar" style={{ width: porcentaje + "%" }} aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      );
    }
  };

  const endTest = () => {
    let respuestas = localStorage.getItem("answers");
    let hash = CryptoJS.SHA256(respuestas).toString();
    let sent = navigator.onLine;
    //TODO por qué no se espera respuesta de esta peticion??
    console.log(respuestas)
    Tests.sendTest(respuestas, hash)
      .then(() => console.log("END"))
      .catch((e) => console.error(e));

    if (sent) {
      navigate("/", { replace: true });
    } else {
      //TODO scanner?userId=${props.userId}&test=${params.id}&hash=${hash} más explicativo pero toca cambiar en back comprobaciones
      navigate(`/scanner/${params.id}/${hash}`, { replace: true });
    }
  };

  const initAnswerList = (questionList) => {
    let list = new Map();
    questionList.forEach((pregunta) => list.set(pregunta.id, { type: pregunta.type, answr: "NULL" }));
    setAnswerList(list);
  };

  const unlockTest = () => {
    if (comprobarPassword(contra, params.id)) {
      let list = descifrarTest(params.id);
      initAnswerList(list);
      setQuestionList(list);
      setIsAllowed(true);
      localStorage.setItem("initTime", Date.now()); //guardamos la hora a la que empieza el examen
    }
  };

  const getPass = (e) => {
    //Funcion para conseguir la contraseña del test introducida por el usuario
    setContra(e.target.value);
  };

  const addAnswer = (answer) => {
    let newlist = answerList;
    newlist.set(answer.id, { type: answer.respuesta.type, answr: answer.respuesta.answer });

    let listaRespuestas = [];
    for (let [key, value] of newlist.entries()) {
      let pregunta = {};
      pregunta.id = key;
      pregunta.type = value.type;
      if (pregunta.type === "test") {
        pregunta.answr = Number(value.answr);
      } else {
        pregunta.answr = value.answr;
      }

      listaRespuestas.push(pregunta);
    }

    let respuestas = { idCuestionario: params.id, respuestas: listaRespuestas };
    localStorage.setItem("answers", JSON.stringify(respuestas));

    setAnswerList(newlist);
  };

  const renderQtype = questionType;

  if (!props.revision && !isAllowed) return <CuestionarioPassword unlockTest={unlockTest} getPass={getPass} />;

  if (!props.revision && questionList.length !== 0) {
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
                  {".-" + pregunta.question}
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
  } else if (props.revision === true && props.correctedTest) {
    const correctedTestInfo = props.correctedTest;
    return (
      <div className="index-body container-fluid" id="questions">
        <div className="p-4 row-1">
          <div className="col card">
            <h1 className="text-center">{correctedTestInfo.titulo}</h1>
          </div>
          <div className="col card">
            <h1 className="text-center">Calificación: {correctedTestInfo.nota}</h1>
          </div>
        </div>

        <div className="p-4 row">
          <div className="p-2 col-9" id="question">
            <div className="card">
              <div key={correctedTestInfo.questions[indPregunta].id}>
                <h2 className="p-2 m-2 card">
                  {" "}
                  {indPregunta + 1}
                  {".-" + correctedTestInfo.questions[indPregunta].question}
                </h2>
                {renderQtype(correctedTestInfo.questions[indPregunta])}
              </div>
            </div>
          </div>

          <div className="p-2 col-3" id="question-nav">
            <QuestionNav navigationHandler={navHandler} listaPreguntas={correctedTestInfo.questions} />
          </div>
        </div>
      </div>
    );
  } else {
    return <h1>Loading...</h1>;
  }
};

export default QuestionContainer;
