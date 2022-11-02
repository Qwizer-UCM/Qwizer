const QuestionNav = ({navigationHandler,listaPreguntas}) => {
  const navigateQuestion = (e) => {
    navigationHandler(parseInt(e.target.value, 10));
  };

  return (
    <div className="container-fluid">
      {listaPreguntas.map((pregunta, indx) => (
          <button type="button" className="btn btn-outline-dark" key={pregunta.id} onClick={navigateQuestion} value={indx}>
            {'Pregunta '}
            {indx + 1}
          </button>
        ))}
    </div>
  );
};

export default QuestionNav;
