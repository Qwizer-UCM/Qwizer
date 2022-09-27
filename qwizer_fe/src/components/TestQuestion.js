import React, { useEffect, useState } from "react";

const TestQuestion = (props) => {
  const [selectedOp, setSelectedOp] = useState(null);
  // props.mode puede tomar los siguientes valores: test, revision, visualize

  useEffect(() => {
    if (props.mode === "test") {
      // TODO revisar por estar en didMount cuando no deberia estar ahi
      let answers = localStorage.getItem("answers");
      console.log(answers);
      if (answers !== null) {
        let json_answers = JSON.parse(answers);
        let opcion = "NULL";
        let listaRespuestas = json_answers.respuestas;

        listaRespuestas.forEach((respuesta) => {
          if (Number(respuesta.id) === props.id) {
            opcion = respuesta.answr;
          }
        });

        if (opcion !== "NULL") {
          setSelectedOp(Number(opcion));
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnClick = (event) => {
    let answer = {
      id: props.id,
      respuesta: { type: props.type, answer: event.target.value },
    };
    setSelectedOp(Number(event.target.value));
    props.addAnswerd(answer);
  };

  const testMode = () => {
    const preguntaId = props.id;
    const opcionSelec = selectedOp;
    const handle = handleOnClick;
    return (
      <table className="m-4">
        <tbody>
          {props.options.map(function (option, indx) {
            return (
              <tr key={option.id}>
                <td>
                  <input type="radio" id={option.id} name={"opciones" + preguntaId} value={option.id} onChange={handle} checked={opcionSelec === option.id}></input>
                  <label htmlFor={option.id}>
                    {indx + 1}.- {option.op}
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const revisionMode = () => {
    const preguntaId = props.id;
    const questionData = props.infoPreg;

    return (
      <div className="m-4 bg-light rounded">
        <table>
          <tbody>
            {questionData.options.map(function (option, indx) {
              return (
                <tr key={option.id}>
                  <td>
                    <input type="radio" id={option.id} name={"opciones" + preguntaId} value={option.id} checked={questionData.user_op === option.id}></input>
                    <label htmlFor={option.id}>
                      {indx + 1}.- {option.op}
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="bg-warning rounded-pill">
          Respuesta Correcta:{" "}
          {questionData.options.map(function (option, indx) {
            return questionData.correct_op === option.id && questionData.options[indx].op;
          })}
        </div>
      </div>
    );
  };

  const visualizeMode = () => {
    const preguntaId = props.id;
    const questionData = props.infoPreg;

    return (
      <div className="d-flex flex-column justify-content-center visualize-container">
        <div className="row m-1">
          <label className="col-4">Título: &nbsp;</label>
          <input className="col-8 m-input" type="text" value={questionData.title} disabled></input>
        </div>

        <div className="row m-1">
          <label className="col-4">Pregunta: &nbsp;</label>
          <input className="col-8 m-input" type="text" value={questionData.question} disabled></input>
        </div>

        {questionData.options.map(function (option, indx) {
          return (
            <div key={option.id}>
              <div className="row m-1">
                <div className="col-4">
                  <input type="radio" id={option.id} name={"opciones" + preguntaId} value={option.id} checked={questionData.correct_op === option.id} disabled></input>
                  <label htmlFor={option.id}>{indx + 1}.- Opción: &nbsp;</label>
                </div>

                <input className="col-8 m-input" type="text" value={questionData.correct_op === option.id ? option.op + " (Correcta)" : option.op} disabled></input>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (props.mode === "test" && props.options) {
    return testMode();
  } else if (props.mode === "revision" && props.infoPreg) {
    return revisionMode();
  } else if (props.mode === "visualize" && props.infoPreg) {
    return visualizeMode();
  }
};

export default TestQuestion;
