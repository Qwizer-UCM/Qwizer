const QuestionNav = ({navigationHandler,listaPreguntas, selectedIdx}) => {
  const navigateQuestion = (e) => {
    navigationHandler(parseInt(e.target.value, 10));
  };

  return (
    <div className="container-fluid">
      {listaPreguntas.map((pregunta, indx) => (
          <button type="button" className={`btn ${selectedIdx===indx ? 'btn-dark':'btn-outline-dark'}`} key={pregunta.id} onClick={navigateQuestion} value={indx}>
            {'Pregunta '}
            {indx + 1}
          </button>
        ))}
    </div>
  );
};

export default QuestionNav;
