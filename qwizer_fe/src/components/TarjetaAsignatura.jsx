import { Link } from "react-router-dom";
import { PATH_CUESTIONARIO } from "../constants";

const TarjetaAsignatura = ({asignatura,idAsignatura,cuestionarios}) => (
    <div className="card mt-3 w-75 " name={asignatura} id={idAsignatura}>
      <div className="card-body bg-blue-grey">

        <h2>
          {asignatura}
        </h2>

        <div className="progress">
          {(cuestionarios.nCorregidos*100)/cuestionarios.nCuestionarios === 0 ? 
            <div className="progress-bar bg-white text-black" role="progressbar" style={{width: "100%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
               {`${cuestionarios.nCorregidos}/${cuestionarios.nCuestionarios}`}
            </div>
          :
            <div className="progress-bar bg-success text-bg-info" role="progressbar" style={{width: `${(cuestionarios.nCorregidos*100)/cuestionarios.nCuestionarios}%`}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
              {`${cuestionarios.nCorregidos}/${cuestionarios.nCuestionarios}`}
            </div>
          }

        </div>

        
      </div>
      <div className="card-footer bg-white">
          <Link className="btn btn-info w-100" to={PATH_CUESTIONARIO(idAsignatura)}>
            Ver más
          </Link>
      </div>
    </div>
  );

export default TarjetaAsignatura;
