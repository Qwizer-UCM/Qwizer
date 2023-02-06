import { Link } from "react-router-dom";
import { routes } from "../constants";

const TarjetaAsignatura = ({asignatura,idAsignatura,cuestionarios}) => (
    <div className="card asignatura-section " name={asignatura} id={idAsignatura}>
      <div className=" card-header header bg-blue-grey">
        <h2>{asignatura}</h2>
      </div>
      <div className="card-body asignatura-inner-body row">
        <div className="col-9">
          <p>Número de test: {cuestionarios.nCuestionarios}</p>
          <p>Número de tests corregidos: {cuestionarios.nCorregidos}</p>
          <p>Número de tests pendientes: {cuestionarios.nPendientes}</p>
        </div>
        <div className="col-3 d-flex justify-content-center button-section">
          <Link className="btn btn-primary login-button" to={routes.PATH_CUESTIONARIO(idAsignatura)}>
            Ver más
          </Link>
        </div>
      </div>
    </div>
  );

export default TarjetaAsignatura;
