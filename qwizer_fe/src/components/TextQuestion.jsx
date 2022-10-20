import { useEffect, useState } from 'react';

const TextQuestion = ({ mode, id, type, infoPreg, addAnswerd }) => {
  const [textValue, settextValue] = useState('');
  // props.mode puede tomar los siguientes valores: test, revision, visualize

  useEffect(() => {
    if (mode === 'test') {
      // TODO Esto no tiene mucho sentido que estuviera en didMount, REVISAR
      const found = JSON.parse(localStorage.getItem('answers'))?.respuestas.find((r) => r.id === id);
      if (found) settextValue(found.answr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    settextValue(event.target.value);
    addAnswerd({
      id,
      respuesta: { type, answer: event.target.value },
    });
  };

  const testMode = () => (
    <div className="p-4 m-2 text-center">
      <textarea rows="9" cols="70" name="textValue" onChange={handleChange} value={textValue} />
    </div>
  );

  const revisionMode = () => (
    <div className="p-4 m-2 text-center">
      <div className="bg-light rounded">
        <p>{infoPreg.user_op}</p>
      </div>
      <div className="bg-warning rounded-pill">Respuesta Correcta: {infoPreg.correct_op}</div>
    </div>
  );

  const visualizeMode = () => (
    <div className="d-flex flex-column justify-content-center visualize-container">
      <div className="row m-1 justify-content-center">
        <label className="col-2">Título: &nbsp;</label>
        <input className="col-8 m-input" type="text" value={infoPreg.title} disabled />
      </div>
      <div className="row m-1 justify-content-center">
        <label className="col-2">Pregunta: &nbsp;</label>
        <input className="col-8 m-input" type="text" value={infoPreg.question} disabled />
      </div>
      <div className="row m-1 justify-content-center">
        <label className="col-2">Respuesta: &nbsp;</label>
        <input className="col-8 m-input" type="text" value={infoPreg.correct_op} disabled />
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
