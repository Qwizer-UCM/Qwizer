import { useState } from 'react';
import TestQuestion from './TestQuestion';
import TextQuestion from './TextQuestion';
import EditTextQuestion from './EditTextQuestion';
import EditTestQuestion from './EditTestQuestion';

export default function VisualizarPregunta({ data, createQuiz, deleteQuestion, updateEditedQuestion }) {
  const [editQuestion, seteditQuestion] = useState(false);

  const visualizeQuestion = () => (
    // Visualizar la pregunta seleccionada y posibilidad de elimarla/editarla
    <div>
      {data.type === 'test' && <TestQuestion mode="visualize" infoPreg={data} id={data.id} />}
      {data.type === 'text' && <TextQuestion mode="visualize" infoPreg={data} />}
      <div className="d-flex justify-content-center">
        {createQuiz ? (
          <div/>
        ) : (
          <>
            <button type="button" className="btn btn-danger m-1" onClick={() => deleteQuestion(data.id)}>
              {' '}
              Eliminar Pregunta{' '}
            </button>
            <button type="button" className="btn btn-warning m-1" onClick={() => seteditQuestion(true)}>
              {' '}
              Editar Pregunta{' '}
            </button>
          </>
        )}
      </div>
    </div>
  );
  const modifyQuestion = (question) => {
    // TODO Revisar esto es un poco raro. Resuelve la promesa en el padre y luego la vuelve a usar aqui
    updateEditedQuestion(question).then(seteditQuestion(false));
  };

  const editQuizz = () => {
    if (data.type === 'test') {
      return (
        <div>
          <EditTestQuestion pregunta={data} updateEditQuestion={modifyQuestion} />
        </div>
      );
    }

    if (data.type === 'text') {
      return (
        <div>
          <EditTextQuestion pregunta={data} updateEditQuestion={modifyQuestion} />
        </div>
      );
    }
    return null;
  };

  if (!editQuestion) {
    return visualizeQuestion();
  }
  return editQuizz();
}
