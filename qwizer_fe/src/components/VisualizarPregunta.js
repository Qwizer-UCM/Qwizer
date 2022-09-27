import React, { useState } from "react";
import TestQuestion from "./TestQuestion";
import TextQuestion from "./TextQuestion";
import EditTextQuestion from "./EditTextQuestion";
import EditTestQuestion from "./EditTestQuestion";

export default function VisualizarPregunta(props) {
  const [editQuestion, seteditQuestion] = useState(false);

  const visualizeQuestion = () => {
    //Visualizar la pregunta seleccionada y posibilidad de elimarla/editarla

    if (props.createQuiz) {
      if (props.data.type === "test") {
        return (
          <div>
            <TestQuestion mode="visualize" infoPreg={props.data} id={props.data.id} />
            <div className="d-flex justify-content-center">
              <button className="btn btn-success m-1" onClick={() => props.addQuestion(props.data)}>
                {" "}
                Añadir Pregunta{" "}
              </button>
            </div>
          </div>
        );
      } else if (props.data.type === "text") {
        return (
          <div>
            <TextQuestion mode="visualize" infoPreg={props.data} />
            <div className="d-flex justify-content-center">
              <button className="btn btn-success m-1" onClick={() => props.addQuestion(props.data)}>
                {" "}
                Añadir Pregunta{" "}
              </button>
            </div>
          </div>
        );
      }
    } else {
      if (props.data.type === "test") {
        return (
          <div>
            <TestQuestion mode="visualize" infoPreg={props.data} id={props.data.id} />
            <div className="d-flex justify-content-center">
              <button className="btn btn-danger m-1" onClick={() => props.deleteQuestion(props.data.id)}>
                {" "}
                Eliminar Pregunta{" "}
              </button>
              <button className="btn btn-warning m-1" onClick={() => seteditQuestion(true)}>
                {" "}
                Editar Pregunta{" "}
              </button>
            </div>
          </div>
        );
      } else if (props.data.type === "text") {
        return (
          <div>
            <TextQuestion mode="visualize" infoPreg={props.data} />
            <div className="d-flex justify-content-center">
              <button className="btn btn-danger m-1" onClick={() => props.deleteQuestion(props.data.id)}>
                {" "}
                Eliminar Pregunta{" "}
              </button>
              <button className="btn btn-warning m-1" onClick={() => seteditQuestion(true)}>
                {" "}
                Editar Pregunta{" "}
              </button>
            </div>
          </div>
        );
      }
    }
  };

  const modifyQuestion = (question) => {
    props.updateEditedQuestion(question).then(seteditQuestion(false));
  };

  const editQuizz = () => {
    if (props.data.type === "test") {
      return (
        <div>
          <EditTestQuestion pregunta={props.data} updateEditQuestion={modifyQuestion} />
        </div>
      );
    }

    if (props.data.type === "text") {
      return (
        <div>
          <EditTextQuestion pregunta={props.data} updateEditQuestion={modifyQuestion} />
        </div>
      );
    }
  };

  if (!editQuestion) {
    return visualizeQuestion();
  } else {
    return editQuizz();
  }
}
