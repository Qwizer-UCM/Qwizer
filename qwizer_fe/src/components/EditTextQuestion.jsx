import { useState } from 'react';

export default function EditTextQuestion({ pregunta, updateEditQuestion }) {
  const [titulo, settitulo] = useState(pregunta.title);
  const [nombre, setnombre] = useState(pregunta.question);
  const [textValue, settextValue] = useState(pregunta.correct_op);

  const actualizarPregunta = () => {
    const question = pregunta;
    question.title = titulo;
    question.question = nombre;
    question.correct_op = textValue;
    updateEditQuestion(question);
  };

  return (
    <div className="p-4 m-2 text-center">
      <label className="col-4">Título: &nbsp;</label>
      <input className="col-8 m-input" name="titulo" type="text" value={titulo} onChange={(e) => settitulo(e.target.value)} />

      <label className="col-4">Pregunta: &nbsp;</label>
      <input className="col-8 m-input" name="nombre" type="text" value={nombre} onChange={(e) => setnombre(e.target.value)} />

      <label className="col-4 align-top">Respuesta: &nbsp;</label>
      <textarea className="col-8 m-input" rows="5" cols="50" name="textValue" onChange={(e) => settextValue(e.target.value)} value={textValue} />

      <button type="button" className="btn btn-success" onClick={actualizarPregunta}>
        Actualizar
      </button>
    </div>
  );
}
