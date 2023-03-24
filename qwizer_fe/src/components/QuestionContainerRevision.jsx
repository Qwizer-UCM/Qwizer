import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css'
import TestQuestion from './TestQuestion';
import TextQuestion from './TextQuestion';
import QuestionNav from './QuestionNav';

import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';
import NotFound404 from './common/NotFound404';

const QuestionContainerRevision = ({ id, role }) => {
  const params = useParams();
  const navigate = useNavigate();

  const { data: testCorregido, error, isLoading } = useFetch(Tests.getCorrectedTest, {
    params: { idAlumno: role === "teacher" ? Number(params.idAlumno) : id, idCuestionario: Number(params.id) ?? '' },
  });
  const [indPregunta, setindPregunta] = useState(0);

  if (isLoading) return null;

  const pregunta = testCorregido?.questions[indPregunta];
  if (testCorregido && !error && pregunta) {
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
              <div className="card-body">
                <div key={pregunta.id}>

                  <h2 className="p-2 m-2 card">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}>
                      {`${indPregunta + 1}.-${pregunta.question}`}
                    </ReactMarkdown>
                  </h2>
                  {pregunta.type === 'test' ? <TestQuestion key={pregunta.id} mode="revision" infoPreg={pregunta} id={pregunta.id} /> : <TextQuestion key={pregunta.id} mode="revision" infoPreg={pregunta} />}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 col-md-3 col-sm-12 order-first order-md-last" id="question-nav">
            <QuestionNav setIndex={setindPregunta} listaPreguntas={testCorregido.questions} selectedIdx={indPregunta} />
          </div>
        </div>
        <div className="p-4 row">
          <div className="col text-center">
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
              Finalizar Revisión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <NotFound404 />;
};

export default QuestionContainerRevision;
