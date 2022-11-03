import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Countdown from 'react-countdown';
import CryptoJS from 'crypto-js';
import TestQuestion from './TestQuestion';
import TextQuestion from './TextQuestion';
import QuestionNav from './QuestionNav';
import Modal from './common/modals/Modal';
import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';
import { useEffect } from 'react';

const CuestionarioPassword = ({ unlockTest, localStorageTest }) => {
  const [contra, setContra] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  const descifrarTest = (input) => {
    const cipher = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(input.encrypted_message),
    });
    const key = CryptoJS.enc.Hex.parse(input.password);
    const iv = CryptoJS.enc.Hex.parse(input.iv);

    const result = CryptoJS.AES.decrypt(cipher, key, { iv, mode: CryptoJS.mode.CFB });

    return JSON.parse(result.toString(CryptoJS.enc.Utf8)).questions;
  };

  const startTest = () => {
    if (contra !== '' && CryptoJS.SHA256(contra).toString() === localStorageTest.password) {
      const list = descifrarTest(localStorageTest);
      const listMap = {}
      list.forEach((pregunta) => { listMap[pregunta.id] = { type: pregunta.type, answr: 'NULL' } })

      // const listMap = {...list.map((pregunta) => ({[pregunta.id]: { type: pregunta.type, answr: 'NULL' }}))}
      // console.log(...list.map((pregunta) => ({[pregunta.id]: { type: pregunta.type, answr: 'NULL' }})))
      unlockTest(listMap, list, true);
    } else {
      setErrorModal({ show: true, message: 'Contraseña incorrecta' });
    }
  };

  return (
    <div className="index-body">
      <div className="card tabla-notas">
        <div className="card-content">
          <div className="col text-center">
            <h3>Introduce la contraseña para empezar el examen!</h3>
          </div>

          <div className="p-4 row">
            <div className="col text-center">
              <input type="text" className="center form-control" onChange={(e) => setContra(e.target.value)} />
            </div>
          </div>
          <div className="p-4 row">
            <div className="col text-center">
              <button type="button" className="btn btn-success" onClick={startTest}>
                Empezar Test
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal options={errorModal} onHide={setErrorModal} type="danger" />
    </div>
  );
};

const CuentaAtras = ({ endTest, duration }) => {
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      endTest();
      localStorage.removeItem('initTime');
      localStorage.removeItem('answers');
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

  const updateTime = () => {
    let initTime = Number(localStorage.getItem('initTime'));
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

  return <Countdown date={Date.now() + updateTime() * 1000} renderer={renderer} />;
};

const QuestionContainerNoRevision = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [localStorageTest, setLocalStorageTest] = useState(() => JSON.parse(JSON.parse(localStorage.getItem('tests'))?.find((test) => Number(JSON.parse(test).id) === Number(params.id)) ?? null)); // TODO no convence lo de guardarlo en localstorage

  const addTestToLocalStorage = (jsonObject) => {
    const tests = localStorage.getItem('tests');
    const test = tests ? JSON.stringify([...JSON.parse(tests), jsonObject]) : JSON.stringify([jsonObject]);
    localStorage.setItem('tests', test);
  };
  useFetch(Tests.get, {
    skip: localStorageTest,
    onSuccess: (d) => {
      addTestToLocalStorage(JSON.stringify(d));
      setLocalStorageTest(d);
    },
    params: { idCuestionario: Number(params.id) },
  });

  const [indPregunta, setindPregunta] = useState(0);
  const [questionList, setQuestionList] = useState([]);
  const [answerList, setAnswerList] = useState({}); // TODO revisar metodos que los usan, se vuelven a usar mapas :(
  const [isAllowed, setIsAllowed] = useState(false); // Indica si se ha desbloqueado el test

  const descargado = Boolean(localStorageTest); // Si existe en localstorage true en caso contrario false
  const duration = localStorageTest?.duracion;

  useEffect(() => () => localStorage.removeItem('answers'), []) // TODO mirar que podemos hacer para hacer varios cuestionarios a la vez

  const renderButtons = () => {
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
    return (
      <div className="p-2 text-center">
        {indPregunta > 0 && indPregunta <= questionList.length - 1 && (
          <button type="button" className="btn btn-success" onClick={updateIndBack}>
            Atrás
          </button>
        )}
        {indPregunta >= 0 && indPregunta < questionList.length - 1 && (
          <button type="button" className="btn btn-success" onClick={updateIndNext}>
            Siguiente
          </button>
        )}
        {indPregunta === questionList.length - 1 && (
          <button type="button" className="btn btn-warning" onClick={endTest}>
            Terminar y Enviar
          </button>
        )}
      </div>
    );
  };

  const endTest = () => {
    const respuestas = localStorage.getItem('answers'); // TODO falla si no se responde a nada, capturar excepciones en back
    const hash = CryptoJS.SHA256(respuestas).toString();
    const sent = navigator.onLine;
    // TODO por qué no se espera respuesta de esta peticion??
    Tests.sendTest({ respuestas, hash })
      .then(() => console.log('END'))
      .catch((e) => console.error(e));

    if (sent) {
      navigate('/', { replace: true });
    } else {
      navigate(`/scanner/${params.id}/${hash}`, { replace: true });
    }
    localStorage.removeItem("answers") // TODO funciona solo con un cuestionario simultaneo
  };

  const unlockTest = (answList, questList, allowed) => {
    setAnswerList(answList);
    setQuestionList(questList);
    setIsAllowed(allowed);
    localStorage.setItem('initTime', Date.now()); // guardamos la hora a la que empieza el examen
  };

  const addAnswer = (answer) => {
    const newlist = { ...answerList };
    newlist[answer.id] = { type: answer.respuesta.type, answr: answer.respuesta.answer };
    const listaRespuestas = [];
    for (const [key, value] of Object.entries(newlist)) {
      listaRespuestas.push({
        id: key,
        type: value.type,
        answr: value.type === 'test' ? Number(value.answr) : value.answr,
      });
    }

    const respuestas = { idCuestionario: params.id, respuestas: listaRespuestas };
    localStorage.setItem('answers', JSON.stringify(respuestas));

    setAnswerList(newlist);
  };

  if (!descargado) return null;

  if (!isAllowed) return <CuestionarioPassword localStorageTest={localStorageTest} unlockTest={unlockTest} />;

  if (questionList.length !== 0) {
    const pregunta = questionList[indPregunta];
    return (
      <div className="index-body container-fluid" id="questions">
        <div className="p-4 row-1">
          <div className="col card">
            <h1 className="text-center">{localStorageTest?.title || ''}</h1>
            <CuentaAtras duration={duration} endTest={endTest} />
          </div>
        </div>

        <div className="p-4 row">
          <div className="p-2 col-md-9 col-sm-12 order-last order-md-first" id="question">
            <div className="card">
              <div className='card-body'>
                <div key={pregunta.id}>
                  <h2 className="p-2 m-2">
                    {' '}
                    {indPregunta + 1}
                    {`.-${pregunta.question}`}
                  </h2>
                  {pregunta.type === 'test' ? (
                    <TestQuestion key={pregunta.id} mode="test" id={pregunta.id} type={pregunta.type} options={pregunta.options} addAnswerd={addAnswer} />
                  ) : (
                    <TextQuestion key={pregunta.id} mode="test" id={pregunta.id} type={pregunta.type} addAnswerd={addAnswer} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 col-md-3 col-sm-12 order-first order-md-last" id="question-nav">
            <QuestionNav navigationHandler={setindPregunta} listaPreguntas={questionList} />
          </div>
        </div>

        <div className="p-4 row">
          <div className="col">{renderButtons()}</div>
        </div>
      </div>
    );
  }
  return <h1>Loading...</h1>;
};

export default QuestionContainerNoRevision;
