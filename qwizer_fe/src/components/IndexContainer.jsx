import { useEffect, useState } from "react";
import TarjetaAsignatura from "./TarjetaAsignatura";
import Subjects from "../services/Subjects";

const IndexContainer = () => {
  const [asignaturas, setAsignaturas] = useState([]);  // Guarda id y nombre de las asignaturas

  useEffect(() => {
    getAsignaturas();
  }, []);

  const getAsignaturas = () => {
    Subjects.getFromStudentOrTeacher().then(({ data }) => {
      setAsignaturas(data.asignaturas);
    });
  };

  const conexion = navigator.onLine;

  if (!conexion) {
    return (
      <div className="index-body">
        <div className="pt-5 ml-1 mr-1">
          <div className="d-flex justify-content-center">
            <span align="center" className="material-icons xxl-icon justify-content-center">
              {" "}
              wifi_off{" "}
            </span>
          </div>
          <div className="d-flex justify-content-center text-center">
            <h4>Actualmente no dispones de conexión a internet</h4>
          </div>
          <div className="d-flex justify-content-center text-center">
            <p>Haz uso de la pestaña offline</p>
          </div>
        </div>
      </div>
    );
  } 
  if (asignaturas) {
    return (
      <div className="index-body">
        {asignaturas.map((asignatura) => (
            <div key={asignatura.id} className="d-flex justify-content-center">
              <TarjetaAsignatura asignatura={asignatura.nombre} idAsignatura={asignatura.id} cuestionarios={asignatura.cuestionarios} />
            </div>
          ))}
      </div>
    );
  } 
    return (
      <div className="d-flex justify-content align-items-center">
        <div className="spinner-grow" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>

    );
  
};

export default IndexContainer;
