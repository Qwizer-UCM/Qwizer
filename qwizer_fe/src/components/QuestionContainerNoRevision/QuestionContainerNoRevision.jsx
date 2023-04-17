import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';

import localforage from 'localforage';
import TestQuestion from '../TestQuestion';
import TextQuestion from '../TextQuestion';
import QuestionNav from '../QuestionNav';
import { Tests } from '../../services/API';
import useFetch from '../../hooks/useFetch';
import NotFound404 from '../common/NotFound404';
import CuestionarioPassword from './CuestionarioPassword';
import CuentaAtras from './CuentaAtras';
import NavButtons from './NavButtons';
import { INICIO, PATH_QR } from '../../constants';
import Markdown from '../common/Markdown';

const QuestionContainerNoRevision = ({ role }) => {
  const navigate = useNavigate();
  const params = useParams();
  const paramsId = Number(params.id); // TODO error con ids invalidos(letras y cosas raras). TEST NOT FOUND o algo asi
  const [localStorageTest, setLocalStorageTest] = useState(); // TODO no convence lo de guardarlo en localstorage

  const { error } = useFetch(Tests.get, {
    onSuccess: (d) => {
      setLocalStorageTest(d);
    },
    params: { idCuestionario: paramsId },
  });

  const [indPregunta, setindPregunta] = useState(0);
  const [questionList, setQuestionList] = useState([]);
  const [answerList, setAnswerList] = useState({ initTime: null, respuestas: [] }); // TODO revisar metodos que los usan, se vuelven a usar mapas :(
  const [isAllowed, setIsAllowed] = useState(false); // Indica si se ha desbloqueado el test

  const descargado = Boolean(localStorageTest); // Si existe en localstorage true en caso contrario false
  const bloqueado = descargado && role === 'student' && (new Date(localStorageTest.fecha_apertura) > Date.now() || Date.now() > new Date(localStorageTest.fecha_cierre));

  useEffect(() => {
    localforage.getItem('tests').then(value => {
      if (value && value[paramsId]) {
        setLocalStorageTest(value[paramsId])
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (localStorageTest) {
      localforage.getItem('tests').then(value => {
        localforage.setItem('tests', { ...value, [paramsId]: localStorageTest })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorageTest])

  useEffect(() => {
    if (answerList.respuestas.length !== 0) {
      let respuestas = JSON.parse(localStorage.getItem('answers'));

      if (respuestas?.[paramsId]) {
        respuestas[paramsId] = { ...answerList, initTime: respuestas[paramsId].initTime };
      } else {
        // respuestas puede ser null
        respuestas = { ...respuestas, [paramsId]: { ...answerList, initTime: new Date().toISOString() } };
      }
      localStorage.setItem('answers', JSON.stringify(respuestas));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsId, answerList]);

  const endTest = () => {
    const { respuestas } = answerList;
    const initTime = answerList.initTime
    const endTime = new Date().toISOString();
    const hash = CryptoJS.SHA256(JSON.stringify(respuestas)).toString();

    // TODO por qué no se espera respuesta de esta peticion??
    Tests.sendTest({ respuestas, hash, initTime, endTime, idCuestionario: paramsId })
      .then(() => navigate(INICIO, { replace: true }))
      .catch((e) => console.error(e));

    if (!navigator.onLine) {
      const respBase64 = Buffer.from(JSON.stringify(respuestas)).toString('base64url');
      navigate(PATH_QR(paramsId, hash, respBase64), { replace: true });
    }
    localStorage.removeItem('answers');
  };

  const unlockTest = (questList) => {
    // Inicializar respuestas
    const answList = { initTime: null, respuestas: {} };
    questList.forEach((pregunta) => {
      answList.respuestas[pregunta.id] = { id: pregunta.id, type: pregunta.tipoPregunta, answr: '' };
    });
    // Introducir respuestas alumno
    const respuestas = JSON.parse(localStorage.getItem('answers'))?.[paramsId];
    if (respuestas?.respuestas) {
      for (const [id, pregunta] of Object.entries(respuestas.respuestas)) {
        answList.respuestas[id] = { id, type: pregunta.type, answr: pregunta.type === 'test' ? Number(pregunta.answr) : pregunta.answr };
      }
      answList.initTime = respuestas.initTime;
    } else {
      answList.initTime = new Date().toISOString();
    }

    setAnswerList(answList);
    setQuestionList(questList);
    setIsAllowed(true);
  };

  const addAnswer = (answer) => {
    const newlist = { ...answerList };
    newlist.respuestas[answer.id] = { id: answer.id, type: answer.respuesta.type, answr: answer.respuesta.answer };
    setAnswerList(newlist); // TODO rehacer; Como se actualiza la lista antigua hay que usar el callback del set, sino podria llegar una actualizacion con la lista antigua en vez de la actual.
  };

  if (error) return <NotFound404 />;

  if (!descargado) return null;

  if (bloqueado) return <div>Bloqueado</div>;

  if (!isAllowed) return <CuestionarioPassword localStorageTest={localStorageTest} unlockTest={unlockTest} />;

  if (questionList.length !== 0 && answerList.initTime) {
    const pregunta = questionList[indPregunta];
    return (
      <div className="index-body container-fluid" id="questions">
        <div className="p-4 row-1">
          <div className="col card">
            <h1 className="text-center">{localStorageTest?.titulo || ''}</h1>
            <CuentaAtras startTime={answerList.initTime} duration={localStorageTest.duracion} endTest={endTest} />
          </div>
        </div>

        <div className='p-4 info-question'>
          <h6>Pregunta {indPregunta + 1}</h6>
          <p>Puntuada sobre {pregunta.nota.replaceAll('"',"")}</p>
        </div>
        <div className="p-4 row">
          <div className="p-2 col-md-9 col-sm-12 order-last order-md-first" id="question">
            <div className="card">
              <div className="card-body">
                <div key={pregunta.id}>
                  <h2 className="p-2 m-2">
                    <Markdown>
                      {pregunta.pregunta}
                    </Markdown>
                  </h2>
                  {pregunta.tipoPregunta === 'test' ? (
                    <TestQuestion
                      addAnswerd={addAnswer}
                      respuesta={answerList?.respuestas?.[pregunta.id].answr}
                      key={pregunta.id}
                      mode="test"
                      id={pregunta.id}
                      type={pregunta.tipoPregunta}
                      options={pregunta.opciones_test}
                    />
                  ) : (
                    <TextQuestion addAnswerd={addAnswer} respuesta={answerList?.respuestas?.[pregunta.id].answr} key={pregunta.id} mode="test" id={pregunta.id} type={pregunta.tipoPregunta} />
                  )}
                </div>
              </div>
            </div>
          </div>


          {!localStorageTest.secuencial && <div className="p-2 col-md-3 col-sm-12 order-first order-md-last" id="question-nav">
            <QuestionNav index={indPregunta} listaPreguntas={questionList} setIndex={setindPregunta} />
          </div>}
        </div>

        <div className="p-4 row">
          <div className="col">
            <NavButtons index={indPregunta} size={questionList.length} setIndex={setindPregunta} end={endTest} secuencial={localStorageTest.secuencial} />
          </div>
        </div>
      </div >
    );
  }
  return <h1>Loading...</h1>;
};

export default QuestionContainerNoRevision;
