import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import { useEffect } from "react";
import { useState } from "react";
import Otro from "../services/NoSeDondeMeterloTodavia";

export default function VisualizarNota(props) {
  const [corregido, setcorregido] = useState();
  const [hashSubida, sethashSubida] = useState();
  const [qrSent, setqrSent] = useState();
  const [hashQr, sethashQr] = useState();

  useEffect(() => {
    getHashes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getHashes = () => {
    Otro.getHashes(props.data.idCuestionario, props.data.id)
      .then(({ data }) => {
        setcorregido(data.corrected);
        sethashSubida(data.hashSubida);
        setqrSent(data.qrSent);
        sethashQr(data.hashQr);
        //this.generar_tabla(); //TODO Y ESTO???
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="pl-3 pt-3">
      {corregido === true && (
        <div className="form-group">
          <label for="name" className="col-lg-4">
            Hash generado tras la corrección:
          </label>
          <div className="col-lg-8">
            <input type="text" className="form-control" value={hashSubida} disabled />
          </div>
        </div>
      )}

      {corregido === false && <p className="pl-3">Este exámen aun no ha sido corregido.</p>}

      {qrSent === true && (
        <div className="form-group">
          <label for="name" className="col-lg-4">
            Hash generado mediante el codigo QR:
          </label>
          <div className="col-lg-8">
            <input type="text" className="form-control" value={hashQr} disabled />
          </div>
        </div>
      )}

      {qrSent === false && <p className="pl-3">El alumno no hizo uso del código QR.</p>}

      {qrSent === true && corregido === true && hashSubida === hashQr && (
        <p className="pl-3">
          <CheckIcon color="primary" /> Los códigos coinciden
        </p>
      )}

      {qrSent === true && corregido === true && hashSubida !== hashQr && (
        <p className="pl-3">
          <ErrorIcon color="primary" /> Los códigos no coinciden
        </p>
      )}
    </div>
  );
}
