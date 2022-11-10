import { useState } from 'react';

const TestQuestion = ({ respuesta, mode, id, type, options, infoPreg=null, addAnswerd }) => {
  const [selectedOp, setSelectedOp] = useState(() => (mode === 'test' ? respuesta : null));
  // props.mode puede tomar los siguientes valores: test, revision, visualize

  const handleOnClick = (event) => {
    setSelectedOp(Number(event.target.value));
    addAnswerd({
      id,
      respuesta: { type, answer: Number(event.target.value) },
    });
  };

  const testMode = () => {
    const preguntaId = id;
    const opcionSelec = selectedOp;
    const handle = handleOnClick;
    return (
      <table className="m-4">
        <tbody>
          {options.map((option, indx) => (
            <tr key={option.id}>
              <td>
                <input type="radio" id={option.id} name={`opciones${preguntaId}`} value={option.id} onChange={handle} checked={opcionSelec === option.id} />
                <label htmlFor={option.id}>
                  {indx + 1}.- {option.op}
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const revisionMode = () => {
    const preguntaId = id;
    const questionData = infoPreg;

    return (
      <div className="m-4 bg-light rounded">
        {questionData.options.map((option, indx) => (
          <div key={option.id}>
            <input type="radio" id={option.id} name={`opciones${preguntaId}`} value={option.id} checked={questionData.user_op === option.id} readOnly />
            <label htmlFor={option.id}>
              {indx + 1}.- {option.op}
            </label>

          </div>
        ))}
        <div className="bg-success text-white rounded-pill">Respuesta Correcta: {questionData.options.find((option) => questionData.correct_op === option.id).op}</div>
      </div>
    );
  };

  const visualizeMode = () => {
    const preguntaId = id;
    const questionData = infoPreg;

    return (
      <div className="d-flex flex-column justify-content-center visualize-container">
        <div className="row m-1 justify-content-center">
          <label className="col-md-2 col-sm-3">Título: &nbsp;</label>
          <input className="col-md-8 col-sm-7 m-input" type="text" value={questionData.title} disabled />
        </div>

        <div className="row m-1 justify-content-center">
          <label className="col-md-2 col-sm-3">Pregunta: &nbsp;</label>
          <input className="col-md-8 col-sm-7 m-input" type="text" value={questionData.question} disabled />
        </div>

        {questionData.options.map((option) => (
          <div key={option.id}>
            <div className="row m-1 justify-content-center">
              <div className="col-md-2 col-sm-3">
                <input type="radio" id={option.id} name={`opciones${preguntaId}`} value={option.id} checked={questionData.correct_op === option.id} disabled />
                <label htmlFor={option.id}> Opción: &nbsp;</label>
              </div>

              <input className="col-md-8 col-sm-7 m-input" type="text" value={questionData.correct_op === option.id ? `${option.op} (Correcta)` : option.op} disabled />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (mode === 'test' && options) {
    return testMode();
  }
  if (mode === 'revision' && infoPreg) {
    return revisionMode();
  }
  if (mode === 'visualize' && infoPreg) {
    return visualizeMode();
  }
  return null;
};

export default TestQuestion;
