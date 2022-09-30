import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../constants/Constants";
import Subjects from "../services/Subjects";

const TarjetaAsignatura = (props) => {
  const [state, setState] = useState({
    nCuestionarios: 0,
    nPendientes: 0,
    nCorregidos: 0,
  });

  useEffect(() => {
    Subjects.get(props.idAsignatura)
      .then(({data}) => {
        setState({
          nCuestionarios: data.nCuestionarios,
          nPendientes: data.nPendientes,
          nCorregidos: data.nCorregidos,
        });
      })
      .catch((error) => console.log(error));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card asignatura-section " name={props.asignatura} id={props.idAsignatura}>
      <div className="header bg-blue-grey">
        <h2>{props.asignatura}</h2>
      </div>
      <div className="asignatura-inner-body row">
        <div className="col-9">
          <p>Numero de test: {state.nCuestionarios}</p>
          <p>Numero de tests corregidos: {state.nCorregidos}</p>
          <p>Numero de tests pendientes: {state.nPendientes}</p>
        </div>
        <div className="col-3 button-section">
          <Link className="btn btn-primary login-button" to={`/cuestionarios/${props.idAsignatura}`}>
            Ver más
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TarjetaAsignatura;
