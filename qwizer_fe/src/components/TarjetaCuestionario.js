import React, { useState } from "react";
import $ from "jquery";
import ErrorModal from "./common/modals/ErrorModal";
import { API_URL } from "../constants/Constants";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tests from "../services/Tests";

const TarjetaCuestionario = (props) => {
  const navigate = useNavigate();
  const [duracion, setduracion] = useState(0);
  const [downloaded, setdownloaded] = useState(false);
  const [calificacion, setcalificacion] = useState(0);
  const [corregido, setcorregido] = useState(false);
  const [bloqueado, setbloqueado] = useState(false);

  const [fechas, setfechas] = useState({
    fecha_apertura_formateada: "",
    fecha_cierre_formateada: "",
    fecha_apertura: "",
    fecha_cierre: "",
  }); //fecha_apertura,fecha_cierre,fecha_apertura_formateada,fecha_cierre_formateada
  const [, setcuestionario] = useState();

  useEffect(() => {
    if (!props.offline) {
      get_info();
    }
    testIsDownloaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //////////////////////////////////////////////////////
  const testIsDownloaded = () => {
    let tests = localStorage.getItem("tests");
    if (tests != null) {
      let cuestionariosList = JSON.parse(tests);
      for (const cuestionario of cuestionariosList) {
        let test = JSON.parse(cuestionario);
        if (test.id === props.idCuestionario) {
          if (props.offline) {
            setcuestionario(test);
            setdownloaded(true);
            setduracion(test.duracion);
            setcorregido(false);
            setfechas({
              fecha_apertura_formateada: test.formatted_fecha_apertura,
              fecha_cierre_formateada: test.formatted_fecha_cierre,
              fecha_apertura: test.fecha_apertura,
              fecha_cierre: test.fecha_cierre,
            });
          } else {
            setcuestionario(test);
            setdownloaded(true);
          }
          break; //TODO Por qué hay un break?: esta buscando un cuestionario (mejorar esto)
        }
      }
    }
  };

  const addTestToLocalStorage = (jsonObject) => {
    let tests = localStorage.getItem("tests");
    if (tests == null) {
      let testList = [jsonObject];
      localStorage.setItem("tests", JSON.stringify(testList));
    } else {
      let cuestionariosList = JSON.parse(tests);
      cuestionariosList.push(jsonObject);
      localStorage.setItem("tests", JSON.stringify(cuestionariosList));
    }
  };
  /////////////////////////////////////////////////////////////

  const getTest = (idCuestionario) => {
    Tests.get(idCuestionario).then(({ data }) => {
      setdownloaded(true);
      const jsonObject = JSON.stringify(data);
      addTestToLocalStorage(jsonObject);
    });
  };

  const get_info = () => {
    Tests.getInfo(props.idCuestionario)
      .then(({ data }) => {
        let corregido = data.corregido === 0 ? false : true;
        setduracion(data.duracion);
        setcalificacion(data.nota);
        setcorregido(corregido);
        setfechas({
          fecha_apertura_formateada: data.formattedFechaApertura,
          fecha_cierre_formateada: data.formattedFechaCierre,
          fecha_apertura: data.FechaApertura,
          fecha_cierre: data.FechaCierre,
        });
        comprobar_fecha();

        if (calificacion >= 5 && corregido) {
          let idCuestionario = "#cuestionario_" + props.idCuestionario;
          $(idCuestionario).css("background-color", "#59ac79");
        } else if (calificacion < 5 && corregido) {
          let idCuestionario = "#cuestionario_" + props.idCuestionario;
          $(idCuestionario).css("background-color", "#9c2400");
        }
      })
      .catch((error) => {});
  };

  const comprobar_fecha = () => {
    const fechaApertura = new Date(fechas.fecha_apertura);
    const fechaCierre = new Date(fechas.fecha_cierre);
    let today = Date.now();

    today = new Date(today);

    if (fechaApertura > today || today > fechaCierre) {
      setbloqueado(true);
    }
  };

  const show_modal = () => {
    const id = "#fecha_" + props.idCuestionario;
    window.$(id).modal("show");
  };

  const mostrar_offline = () => {
    return (
      <div className="card asignatura-section " name={props.cuestionario.title} id={props.idCuestionario}>
        <div id={"cuestionario_" + props.idCuestionario} className="header bg-blue-grey">
          <h2>{props.cuestionario.title}</h2>
        </div>
        <div className="asignatura-inner-body row">
          <div className="col-9">
            <p>Duración: {duracion} minutos</p>
            <p>Fecha de apertura: {fechas.fecha_apertura_formateada}</p>
            <p>Fecha de cierre: {fechas.fecha_cierre_formateada}</p>
          </div>
          <div className="col-3 button-section">
            {downloaded && !corregido && !bloqueado && localStorage.getItem("rol") === "student" && (
              <button className="btn btn-primary login-button" onClick={() => navigate(`/test/${props.idCuestionario}`)}>
                Realizar
              </button>
            )}
            {downloaded && !corregido && bloqueado && localStorage.getItem("rol") === "student" && (
              <button type="button" className="btn btn-primary" data-bs-toggle="modal" onClick={show_modal}>
                Realizar
              </button>
            )}
            {downloaded && localStorage.getItem("rol") === "teacher" && (
              <button className="btn btn-primary login-button" onClick={() => navigate(`/test/${props.idCuestionario}`)}>
                Realizar
              </button>
            )}
          </div>
          <ErrorModal id={"fecha_" + props.idCuestionario} message={`El test solo se puede resolver entre las siguientes fechas:\n${fechas.fecha_apertura_formateada}\n${fechas.fecha_cierre_formateada}`}></ErrorModal>
        </div>
      </div>
    );
  };

  const mostrar_online = () => {
    return (
      <div className="card asignatura-section " name={props.cuestionario} id={props.idCuestionario}>
        <div id={"cuestionario_" + props.idCuestionario} className="header bg-blue-grey">
          <h2>{props.cuestionario}</h2>
          {corregido && <h5>Calificación: {calificacion}</h5>}
        </div>
        <div className="asignatura-inner-body row">
          <div className="col-9">
            <p>Duración: {duracion} minutos</p>
            <p>Fecha de apertura: {fechas.fecha_apertura_formateada}</p>
            <p>Fecha de cierre: {fechas.fecha_cierre_formateada}</p>
          </div>
          <div className="col-3 button-section">
            {downloaded && !corregido && !bloqueado && localStorage.getItem("rol") === "student" && (
              <button className="btn btn-primary login-button" onClick={() => navigate(`/test/${props.idCuestionario}`)}>
                Realizar
              </button>
            )}
            {!downloaded && !corregido && (
              <button className="btn btn-success login-button" onClick={() => getTest(props.idCuestionario)}>
                Descargar test
              </button>
            )}
            {downloaded && !corregido && bloqueado && localStorage.getItem("rol") === "student" && (
              <button type="button" className="btn btn-primary" data-bs-toggle="modal" onClick={show_modal}>
                Realizar
              </button>
            )}
            {corregido && localStorage.getItem("rol") === "student" && (
              <button className="btn btn-primary login-button" onClick={() => navigate(`/revision/${props.idCuestionario}`)}>
                Revisar
              </button>
            )}
            {downloaded && localStorage.getItem("rol") === "teacher" && (
              <button className="btn btn-primary login-button" onClick={() => navigate(`/test/${props.idCuestionario}`)}>
                Realizar
              </button>
            )}
            {localStorage.getItem("rol") === "teacher" && (
              <button className="btn btn-primary login-button" onClick={() => navigate(`/revisionNotas/${props.idCuestionario}`)}>
                Revisar
              </button>
            )}
          </div>
          <ErrorModal id={"fecha_" + props.idCuestionario} message={`El test solo se puede resolver entre las siguientes fechas:\n${fechas.fecha_apertura_formateada}\n${fechas.fecha_cierre_formateada}`}></ErrorModal>
        </div>
      </div>
    );
  };

  //TODO distincion OFFLINE ONLINE?
  return props.offline ? mostrar_offline() : mostrar_online();
};

export default TarjetaCuestionario;
