import React, { useState } from "react";

export default function EditTestQuestion(props) {
  const [titulo, settitulo] = useState(props.pregunta.title);
  const [nombre, setnombre] = useState(props.pregunta.question);
  const [correct, setcorrect] = useState(props.pregunta.correct_op);
  const [options, setoptions] = useState([...props.pregunta.options]);

  const actualizarPregunta = () => {
    let question = props.pregunta;
    question["title"] = titulo;
    question["question"] = nombre;
    question["options"] = options;
    question["correct_op"] = correct;
    props.updateEditQuestion(question);
  };

  return (
    <div className="p-4 m-2 text-center">
      <label className="col-4">Título: &nbsp;</label>
      <input className="col-8 m-input" name="titulo" type="text" value={titulo} onChange={(e) => settitulo(e.target.value)} />

      <label className="col-4">Pregunta: &nbsp;</label>
      <input className="col-8 m-input" name="nombre" type="text" value={nombre} onChange={(e) => setnombre(e.target.value)} />

      {options.map((opcion, indx) => {
        return (
          <div key={opcion.id} className="row m-1">
            <label className="col-4">{indx + 1 + ".- Opción :"} &nbsp;</label>
            <input className="col-8 m-input" name={opcion.id} type="text" value={opcion.op} onChange={(e) => setoptions((options) => options.map((item) => (item.id === options.id ? { ...item, op: e.target.value } : item)))} />
          </div>
        );
      })}

      <div className="row m-1">
        <label className="col-4">Respueta Correcta: &nbsp;</label>
        <select className="col-8 m-input" onChange={(e) => setcorrect(Number(e.target.value))} defaultValue={correct}>
          {options.map((opcion, indx) => {
            return (
              <option key={indx} value={opcion.id}>
                {opcion.op}
              </option>
            );
          })}
        </select>
      </div>

      <button className="btn btn-success" onClick={actualizarPregunta}>
        Actualizar
      </button>
    </div>
  );
}
