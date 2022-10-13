import React, { useEffect, useState } from "react";

const TextQuestion = (props) => {
  const [textValue, settextValue] = useState("");
  // props.mode puede tomar los siguientes valores: test, revision, visualize

  useEffect(() => {
    if (props.mode === "test") {    //TODO Esto no tiene mucho sentido que estuviera en didMount, REVISAR
      let answers = localStorage.getItem("answers");
      if (answers !== null) {
        let json_answers = JSON.parse(answers);
        let rp = "NULL";
        let listaRespuestas = json_answers.respuestas;

        listaRespuestas.forEach((respuesta) => {
          if (respuesta.id === props.id) {
            rp = respuesta.answr;
          }
        });

        if (rp !== "NULL") {
          settextValue(rp);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    let answer = {
      id: props.id,
      respuesta: { type: props.type, answer: event.target.value },
    };
    settextValue(event.target.value);

    props.addAnswerd(answer);
  };

  const testMode = () => {
    return (
      <div className="p-4 m-2 text-center">
        <textarea rows="9" cols="70" name="textValue" onChange={handleChange} value={textValue} />
      </div>
    );
  };

  const revisionMode = () => {
    return (
      <div className="p-4 m-2 text-center">
        <div className="bg-light rounded">
          <p>{props.infoPreg.user_op}</p>
        </div>
        <div className="bg-warning rounded-pill">Respuesta Correcta: {props.infoPreg.correct_op}</div>
      </div>
    );
  };

  const visualizeMode = () => {
    return (
      <div className="d-flex flex-column justify-content-center visualize-container">
        <div className="row m-1 justify-content-center">
          <label className="col-2">Título: &nbsp;</label>
          <input className="col-8 m-input" type="text" value={props.infoPreg.title} disabled></input>
        </div>
        <div className="row m-1 justify-content-center">
          <label className="col-2">Pregunta: &nbsp;</label>
          <input className="col-8 m-input" type="text" value={props.infoPreg.question} disabled></input>
        </div>
        <div className="row m-1 justify-content-center">
          <label className="col-2">Respuesta: &nbsp;</label>
          <input className="col-8 m-input" type="text" value={props.infoPreg.correct_op} disabled></input>
        </div>
      </div>
    );
  };

  if (props.mode === "test") {
    return testMode();
  } else if (props.mode === "revision" && props.infoPreg) {
    return revisionMode();
  } else if (props.mode === "visualize" && props.infoPreg) {
    return visualizeMode();
  }
};

export default TextQuestion;
