import { Link } from "react-router-dom";

const TarjetaAsignatura = ({asignatura,idAsignatura,cuestionarios}) => (
    <div className="card asignatura-section " name={asignatura} id={idAsignatura}>
      <div className="header bg-blue-grey">
        <h2>{asignatura}</h2>
      </div>
      <div className="asignatura-inner-body row">
        <div className="col-9">
          <p>Numero de test: {cuestionarios.nCuestionarios}</p>
          <p>Numero de tests corregidos: {cuestionarios.nCorregidos}</p>
          <p>Numero de tests pendientes: {cuestionarios.nPendientes}</p>
        </div>
        <div className="col-3 button-section">
          <Link className="btn btn-primary login-button" to={`/cuestionarios/${idAsignatura}`}>
            Ver más
          </Link>
        </div>
      </div>
    </div>
  );

export default TarjetaAsignatura;
