import React, { useEffect, useState } from "react";
import TarjetaCuestionario from "./TarjetaCuestionario";

const AvailableOffline = (props) => {
  const [cuestionarios, setCuestionarios] = useState(undefined);

  useEffect(() => {
    let tests = localStorage.getItem("tests");
    if (tests != null) {
      let cuestionariosList = [];
      let cuestionarios = JSON.parse(tests);
      for (const cuestionario of cuestionarios) {
        let test = JSON.parse(cuestionario);
        cuestionariosList.push(test);
      }
      setCuestionarios(cuestionariosList);
    }
  }, []);

  const rol = localStorage.getItem("rol");

  if (cuestionarios !== undefined) {
    return (
      <div className="index-body row">
        <div className="section-title">
          <h1>Cuestionarios Descargados</h1>
        </div>
        {cuestionarios.map(function (cuestionario, indx) {
          return (
            <div key={cuestionario.id} className="d-flex justify-content-center">
              <TarjetaCuestionario offline={true} cuestionario={cuestionario} idCuestionario={cuestionario.id} rol={rol}></TarjetaCuestionario>
            </div>
          );
        })}
      </div>
    );
  } else {
    return (
      <div className="section-title">
        <h1>Cuestionarios Descargados</h1>
        <div className="text-center">
          <h4>No tienes descargado ningun Test</h4>
        </div>
      </div>
    );
  }
};

export default AvailableOffline;
