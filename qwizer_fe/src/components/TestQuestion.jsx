import { useEffect, useState } from 'react';

const TestQuestion = ({ mode, id, type, options, infoPreg, addAnswerd }) => {
  const [selectedOp, setSelectedOp] = useState(null);
  // props.mode puede tomar los siguientes valores: test, revision, visualize

  useEffect(() => {
    if (mode === 'test') {
      // TODO revisar por estar en didMount cuando no deberia estar ahi
      const found = JSON.parse(localStorage.getItem('answers'))?.respuestas.find((r) => r.id === id);
      if (found) setSelectedOp(found.answr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnClick = (event) => {
    setSelectedOp(Number(event.target.value));
    addAnswerd({
      id,
      respuesta: { type, answer: event.target.value },
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
        <table>
          <tbody>
            {questionData.options.map((option, indx) => (
              <tr key={option.id}>
                <td>
                  <input type="radio" id={option.id} name={`opciones${preguntaId}`} value={option.id} checked={questionData.user_op === option.id} />
                  <label htmlFor={option.id}>
                    {indx + 1}.- {option.op}
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-warning rounded-pill">Respuesta Correcta: {questionData.options.map((option, indx) => questionData.correct_op === option.id && questionData.options[indx].op)}</div>
      </div>
    );
  };

  const visualizeMode = () => {
    const preguntaId = id;
    const questionData = infoPreg;

    return (
      <div className="d-flex flex-column justify-content-center visualize-container">
        <div className="row m-1 justify-content-center">
          <label className="col-2">Título: &nbsp;</label>
          <input className="col-8 m-input" type="text" value={questionData.title} disabled />
        </div>

        <div className="row m-1 justify-content-center">
          <label className="col-2">Pregunta: &nbsp;</label>
          <input className="col-8 m-input" type="text" value={questionData.question} disabled />
        </div>

        {questionData.options.map((option, indx) => (
          <div key={option.id}>
            <div className="row m-1 justify-content-center">
              <div className="col-2">
                <input type="radio" id={option.id} name={`opciones${preguntaId}`} value={option.id} checked={questionData.correct_op === option.id} disabled />
                <label htmlFor={option.id}>{indx + 1}.- Opción: &nbsp;</label>
              </div>

              <input className="col-8 m-input" type="text" value={questionData.correct_op === option.id ? `${option.op} (Correcta)` : option.op} disabled />
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
