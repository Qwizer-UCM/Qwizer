import { useState } from 'react';

const TextQuestion = ({ respuesta, mode, id, type, infoPreg=null, addAnswerd }) => {
  const [textValue, settextValue] = useState(() => (mode === 'test' ? respuesta : ''));
  // props.mode puede tomar los siguientes valores: test, revision, visualize

  const handleChange = (event) => {
    settextValue(event.target.value);
    addAnswerd({
      id,
      respuesta: { type, answer: event.target.value },
    });
  };

  const testMode = () => (
    <div className="p-4 m-2 text-center">
      <textarea className='form-control' rows="9" cols="70" name="textValue" onChange={handleChange} value={textValue} />
    </div>
  );

  const revisionMode = () => (
    <div className="p-4 m-2 text-center">
      <div className="bg-light rounded">
        <textarea className='form-control' style={{resize:"none"}} rows="9" cols="70" value={infoPreg.user_op ?? ''} readOnly/>
      </div>
      <div className="rounded p-2 mt-2" style={{backgroundColor:"#60d394"}}>Respuesta Correcta: {infoPreg.correct_op}</div>
    </div>
  );

  const visualizeMode = () => (
    <div className="d-flex flex-column justify-content-center visualize-container">
      <div className="row m-1 justify-content-center">
        <label className="col-md-2 col-sm-3">Título: &nbsp;</label>
        <input className="col-md-8 col-sm-7 m-input" type="text" value={infoPreg.title} disabled />
      </div>
      <div className="row m-1 justify-content-center">
        <label className="col-md-2 col-sm-3">Pregunta: &nbsp;</label>
        <input className="col-md-8 col-sm-7 m-input" type="text" value={infoPreg.question} disabled />
      </div>
      <div className="row m-1 justify-content-center">
        <label className="col-md-2 col-sm-3">Respuesta: &nbsp;</label>
        <input className="col-md-8 col-sm-7 m-input" type="text" value={infoPreg.correct_op} disabled />
      </div>
    </div>
  );

  if (mode === 'test') {
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

export default TextQuestion;
