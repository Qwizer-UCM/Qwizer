const NavButtons = ({ index, size, setIndex, end, secuencial }) => {
  const updateIndNext = () => {
    if (index + 1 <= size - 1) setIndex((prev) => prev + 1);
  };
  const updateIndPrev = () => {
    if (index - 1 >= 0) setIndex((prev) => prev - 1);
  };

  return (
    <div className="p-2 text-center">
      {index > 0 && index <= size - 1 && !secuencial && (
        <button type="button" className="btn btn-success" onClick={updateIndPrev}>
          Atrás
        </button>
      )}
      {index >= 0 && index < size - 1 && (
        <button type="button" className="btn btn-success" onClick={updateIndNext}>
          Siguiente
        </button>
      )}
      {index === size - 1 && (
        <button type="button" className="btn btn-warning" onClick={end}>
          Terminar y Enviar
        </button>
      )}
    </div>
  );
};

export default NavButtons;
