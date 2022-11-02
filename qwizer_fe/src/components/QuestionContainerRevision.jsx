import { useState } from 'react';
import { useParams } from 'react-router-dom';
import TestQuestion from './TestQuestion';
import TextQuestion from './TextQuestion';
import QuestionNav from './QuestionNav';

import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';

const QuestionContainerRevision = () => {
  const params = useParams();

  const { data: testCorregido } = useFetch(Tests.getCorrectedTest, {
    transform: (d) => JSON.parse(d.corrected_test),
    params: { idAlumno: Number(params.idAlumno), idCuestionario: Number(params.id) ?? '' },
  });
  const [indPregunta, setindPregunta] = useState(0);

  const pregunta = testCorregido?.questions[indPregunta];

  if (testCorregido && pregunta) {
    return (
      <div className="index-body container-fluid" id="questions">
        <div className="p-4">
          <div className="card">
            <h1 className="text-center">{testCorregido.titulo}</h1>
          </div>
          <div className="card">
            <h1 className="text-center">Calificación: {testCorregido.nota}</h1>
          </div>
        </div>

        <div className="p-4 row">
          <div className="col-md-9 col-sm-12 order-last order-md-first" id="question">
            <div className="card">
              <div className='card-body'>
                <div key={pregunta.id}>
                  <h2 className="p-2 m-2 card">
                    {' '}
                    {indPregunta + 1}
                    {`.-${pregunta.question}`}
                  </h2>
                  {pregunta.type === 'test' ? <TestQuestion key={pregunta.id} mode="revision" infoPreg={pregunta} id={pregunta.id} /> : <TextQuestion key={pregunta.id} mode="revision" infoPreg={pregunta} />}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 col-md-3 col-sm-12 order-first order-md-last" id="question-nav">
            <QuestionNav navigationHandler={setindPregunta} listaPreguntas={testCorregido.questions} />
          </div>
        </div>
      </div>
    );
  }

  return <h1>Loading...</h1>;
};

export default QuestionContainerRevision;
