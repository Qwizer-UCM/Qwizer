import React from 'react'

const QuestionNav = (props) => {


  const navigateQuestion = (e) => {
    props.navigationHandler(parseInt(e.target.value));
  }

  return (
    <div class="container">
      {props.listaPreguntas.map(function (pregunta, indx) {
        return (
          <button type="button" class="btn btn-outline-dark" key={indx} onClick={navigateQuestion} value={indx}>{"Pregunta "}{indx + 1}</button>
        );
      })

      }

    </div>
  );



}

export default QuestionNav;