import React from 'react'

const QuestionNav = (props) => {


  const navigateQuestion = (e) => {
    props.navigationHandler(parseInt(e.target.value));
  }

  return (
    <div className="container">
      {props.listaPreguntas.map(function (pregunta, indx) {
        return (
          <button type="button" className="btn btn-outline-dark" key={indx} onClick={navigateQuestion} value={indx}>{"Pregunta "}{indx + 1}</button>
        );
      })

      }

    </div>
  );



}

export default QuestionNav;