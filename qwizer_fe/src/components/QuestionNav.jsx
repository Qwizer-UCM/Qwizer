const QuestionNav = ({ index, setIndex, listaPreguntas  }) => (
  <div className="container-fluid">
    {listaPreguntas.map((pregunta, indx) => (
      <button type="button" className={`btn ${index === indx ? 'btn-dark' : 'btn-outline-dark'}`} key={pregunta.id} onClick={() => setIndex(indx)} value={indx}>
        {'Pregunta '}
        {indx + 1}
      </button>
    ))}
  </div>
);

export default QuestionNav;
