import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Countdown from 'react-countdown';
import CryptoJS from 'crypto-js';
import TestQuestion from './TestQuestion';
import TextQuestion from './TextQuestion';
import QuestionNav from './QuestionNav';
import Modal from './common/modals/Modal';
import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';
import NotFound404 from './common/NotFound404';


const cifrarTest = (input) => {
  // TODO en el back no se desencripta correctamente
  const result = CryptoJS.AES.encrypt(input.message, input.password, { mode: CryptoJS.mode.CFB, padding: CryptoJS.pad.NoPadding});
  const message = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(result.ciphertext.toString()))
  const iv = result.iv.toString(CryptoJS.enc.Hex)
  const key = result.key.toString(CryptoJS.enc.Hex)
  return {message,iv,key}
};

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
    console.log(result.toString(CryptoJS.enc.Utf8))
    return JSON.parse(result.toString(CryptoJS.enc.Utf8));
  };

  const startTest = () => {
    if (contra !== '' && CryptoJS.SHA256(contra).toString() === localStorageTest.password) {
      const list = descifrarTest(localStorageTest);
      const listMap = {initTime:null,respuestas:{}};
      list.forEach((pregunta) => {
        listMap.respuestas[pregunta.id] = { id:pregunta.id, type: pregunta.type, answr: '' };
      });
      unlockTest(listMap, list, true);
    } else {
      setErrorModal({ show: true, message: 'Contraseña incorrecta' })
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

const CuentaAtras = ({ startTime, endTest, duration }) => {
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
    const porcentaje = 100 - Math.floor((leftSeconds / totalSeconds) * 100) + Math.floor(100/totalSeconds);
    const bg = porcentaje >= 80 && 'bg-danger'
    return (
      <div>
        <p className="text-center">
          {hours}h:{minutes}min:{seconds}s
        </p>
        <div className="progress">
          <div className={`progress-bar progress-bar-striped progress-bar-animated ${bg}`} role="progressbar" style={{ width: `${porcentaje}%` }} aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} />
        </div>
      </div>
    );
  };

  const updateTime = () => {
    const initTime = new Date(startTime);
    const actualTime = new Date()

    const passedMiliseconds = actualTime.getTime() - initTime.getTime();

    let leftMiliseconds = duration * 60 * 1000 - passedMiliseconds;

    if (leftMiliseconds <= 0) {
      leftMiliseconds = 0;
    }

    // comprobar si se ha pasado de fecha ???

    return leftMiliseconds;
  };

  return <Countdown date={Date.now() + updateTime()} renderer={renderer} />;
};

const QuestionContainerNoRevision = ({role}) => {
  const navigate = useNavigate();
  const params = useParams();
  const paramsId = Number(params.id); // TODO error con ids invalidos(letras y cosas raras). TEST NOT FOUND o algo asi
  const [localStorageTest, setLocalStorageTest] = useState(() => JSON.parse(localStorage.getItem('tests'))?.[paramsId] ?? null); // TODO no convence lo de guardarlo en localstorage

  const addTestToLocalStorage = (jsonObject) => {
    const tests = localStorage.getItem('tests');
    const test = tests ? JSON.stringify({...JSON.parse(tests), [jsonObject.id]:jsonObject}) : JSON.stringify({[jsonObject.id]:jsonObject});
    localStorage.setItem('tests', test);
  };
  const {error} = useFetch(Tests.get, {
    skip: localStorageTest,
    onSuccess: (d) => {
      addTestToLocalStorage(d);
      setLocalStorageTest(d);
    },
    params: { idCuestionario: paramsId },
  });

  const [indPregunta, setindPregunta] = useState(0);
  const [questionList, setQuestionList] = useState([]);
  const [answerList, setAnswerList] = useState({initTime:null,respuestas:[]}); // TODO revisar metodos que los usan, se vuelven a usar mapas :(
  const [isAllowed, setIsAllowed] = useState(false); // Indica si se ha desbloqueado el test

  const descargado = Boolean(localStorageTest); // Si existe en localstorage true en caso contrario false
  const duration = localStorageTest?.duracion;
  const bloqueado = descargado && role === 'student' && (new Date(localStorageTest.fecha_apertura) > Date.now() || Date.now() > new Date(localStorageTest.fecha_cierre));
  

  useEffect(() => {
    if (answerList.respuestas.length !== 0) {
      let respuestas = JSON.parse(localStorage.getItem('answers'));
    
      if (respuestas?.[paramsId]) {
        respuestas[paramsId] = { ...answerList, initTime: respuestas[paramsId].initTime };
      } else {
        // respuestas puede ser null
        respuestas = { ...respuestas, [paramsId]: { ...answerList, initTime: new Date().toISOString()} };
      }
      localStorage.setItem('answers', JSON.stringify(respuestas));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsId, answerList]);

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
    const {respuestas} = answerList; // TODO falla si no se responde a nada, capturar excepciones en back
    const hash = CryptoJS.SHA256(JSON.stringify(respuestas)).toString();
    const sent = navigator.onLine;
    // TODO por qué no se espera respuesta de esta peticion??
    Tests.sendTest({ respuestas, hash, idCuestionario:paramsId })
      .then(() => console.log('END'))
      .catch((e) => console.error(e));

    if (sent) {
      navigate('/', { replace: true });
    } else {
      const respBase64 = Buffer.from(JSON.stringify(respuestas)).toString('base64url')
      navigate(`/scanner/${paramsId}/${hash}/${respBase64}`, { replace: true });
    }
    localStorage.removeItem('answers'); // TODO funciona solo con un cuestionario simultaneo
  };

  const unlockTest = (answList, questList, allowed) => {
    const respuestas = JSON.parse(localStorage.getItem('answers'))?.[paramsId]
    for(const [id,pregunta] of Object.entries(respuestas?.respuestas || {})) {
      answList.respuestas[id] = { id, type: pregunta.type, answr: pregunta.type === 'test' ? Number(pregunta.answr) : pregunta.answr};
    }
    answList.initTime = respuestas ? respuestas.initTime : new Date().toISOString();
    setAnswerList(answList);
    setQuestionList(questList);
    setIsAllowed(allowed);
  };

  const addAnswer = (answer) => {
    const newlist = { ...answerList };
    newlist.respuestas[answer.id] = { id:answer.id, type: answer.respuesta.type, answr: answer.respuesta.answer };
    setAnswerList(newlist);
  };

  if(error) return <NotFound404/>

  if (!descargado) return null;

  if (bloqueado) return <div>Bloqueado</div>

  if (!isAllowed) return <CuestionarioPassword localStorageTest={localStorageTest} unlockTest={unlockTest} />;

  if (questionList.length !== 0 && answerList.initTime) {
    const pregunta = questionList[indPregunta];
    return (
      <div className="index-body container-fluid" id="questions">
        <div className="p-4 row-1">
          <div className="col card">
            <h1 className="text-center">{localStorageTest?.titulo || ''}</h1>
            <CuentaAtras startTime={answerList.initTime} duration={duration} endTest={endTest} />
          </div>
        </div>

        <div className="p-4 row">
          <div className="p-2 col-md-9 col-sm-12 order-last order-md-first" id="question">
            <div className="card">
              <div className="card-body">
                <div key={pregunta.id}>
                  <h2 className="p-2 m-2">
                    {' '}
                    {indPregunta + 1}
                    {`.-${pregunta.pregunta}`}
                  </h2>
                  {pregunta.tipoPregunta === 'test' ? (
                    <TestQuestion
                      respuesta={answerList?.respuestas?.[pregunta.id].answr}
                      key={pregunta.id}
                      mode="test"
                      id={pregunta.id}
                      type={pregunta.tipoPregunta}
                      options={pregunta.opciones_test}
                      addAnswerd={addAnswer}
                    />
                  ) : (
                    <TextQuestion
                      respuesta={answerList?.respuestas?.[pregunta.id].answr}
                      key={pregunta.id}
                      mode="test"
                      id={pregunta.id}
                      type={pregunta.tipoPregunta}
                      addAnswerd={addAnswer}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 col-md-3 col-sm-12 order-first order-md-last" id="question-nav">
            <QuestionNav navigationHandler={setindPregunta} listaPreguntas={questionList} selectedIdx={indPregunta}/>
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
