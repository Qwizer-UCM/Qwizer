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
      <div className="m-4 rounded">
        {options.map((option) => (
          <label key={option.id} className={`test-question-option ${opcionSelec === option.id && "selected"}`}  htmlFor={option.id}>
              <input className='form-check-input' type="radio" id={option.id} name={`opciones${preguntaId}`} value={option.id} onChange={handle} checked={opcionSelec === option.id} />
              {option.opcion}
          </label>
        ))}
      </div>
    );
  };

  const revisionMode = () => {
    const preguntaId = id;
    const questionData = infoPreg;

    return (
      <div className="m-4 rounded">
        {questionData.options.map((option) => (
          <label key={option.id} className={`test-question-option ${questionData.user_op === option.id && (questionData.correct_op === option.id ? "correct": "wrong")}`} htmlFor={option.id}>
            <input className='form-check-input' type="radio" id={option.id} name={`opciones${preguntaId}`} value={option.id} checked={questionData.user_op === option.id} readOnly />
            {option.op}
          </label>
        ))}
        <div className="rounded p-2" style={{backgroundColor:"#60d394"}}>Respuesta Correcta: {questionData.options.find((option) => questionData.correct_op === option.id).op}</div>
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
