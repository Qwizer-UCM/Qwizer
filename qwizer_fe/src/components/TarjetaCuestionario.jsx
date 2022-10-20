import { useState,useEffect } from "react";
import $ from "jquery";
import { useNavigate } from "react-router-dom";
import ErrorModal from "./common/modals/ErrorModal";
import Tests from "../services/Tests";

const TarjetaCuestionario = ({offline,cuestionario,idCuestionario,role}) => {
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offline)
      getInfo();
    testIsDownloaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const testIsDownloaded = () => {
    const tests = localStorage.getItem("tests");  // TODO pensar en usar indexDB en vez de localstorage
    const found = tests && JSON.parse(tests).find(test => JSON.parse(test).id === idCuestionario);
    if(found){
      const test = JSON.parse(found);
      setdownloaded(true);
      if (offline) {
        setduracion(test.duracion);
        setcorregido(false);
        setfechas({
          fecha_apertura_formateada: test.formatted_fecha_apertura,
          fecha_cierre_formateada: test.formatted_fecha_cierre,
          fecha_apertura: test.fecha_apertura,
          fecha_cierre: test.fecha_cierre,
        });
      }
      setLoading(false)
    }
    
  };

  const addTestToLocalStorage = (jsonObject) => {
    const tests = localStorage.getItem("tests");
    const test = tests ? JSON.stringify([...JSON.parse(tests),jsonObject]) : JSON.stringify([jsonObject]);
    localStorage.setItem("tests", test);
  };

  const getTest = (id) => {
    Tests.get(id).then(({ data }) => {
      addTestToLocalStorage(JSON.stringify(data));
      setdownloaded(true);
    });
  };

  const getInfo = () => {
    Tests.getInfo(idCuestionario)
      .then(({ data }) => {
        setduracion(data.duracion);
        setcalificacion(data.nota);
        setcorregido(data.corregido !== 0);
        setfechas({
          fecha_apertura_formateada: data.formattedFechaApertura,
          fecha_cierre_formateada: data.formattedFechaCierre,
          fecha_apertura: data.FechaApertura,
          fecha_cierre: data.FechaCierre,
        });
        setbloqueado(comprobarFecha(data.FechaApertura,data.FechaCierre));

        if (data.corregido !== 0){
          $(`#cuestionario_${idCuestionario}`).css("background-color", data.nota >= 5  ? "#59ac79" : "#9c2400");  // TODO cambiar
        }
      })
      .catch(() => {}).finally(()=> setLoading(false));
  };

  const comprobarFecha = (fechaApertura,fechaCierre) => {
    const apertura = new Date(fechaApertura);
    const cierre = new Date(fechaCierre);
    const today = new Date(Date.now());

    return apertura > today || today > cierre;
  };

  const showModal = () => {
    window.$(`#fecha_${idCuestionario}`).modal("show");
  };

  return ( !loading &&
      <div className="card asignatura-section " name={!offline ? cuestionario : cuestionario.title} id={idCuestionario}>
        <div id={`cuestionario_${idCuestionario}`} className="header bg-blue-grey">
          <h2>{!offline ? cuestionario : cuestionario.title}</h2>
          {!offline && corregido && <h5>Calificación: {calificacion}</h5>}
        </div>
        <div className="asignatura-inner-body row">
          <div className="col-9">
            <p>Duración: {duracion} minutos</p>
            <p>Fecha de apertura: {fechas.fecha_apertura_formateada}</p>
            <p>Fecha de cierre: {fechas.fecha_cierre_formateada}</p>
          </div>
          <div className="col-3 button-section">
            {downloaded && !corregido && !bloqueado && role === "student" && (
              <button type="button" className="btn btn-primary login-button" onClick={() => navigate(`/test/${idCuestionario}`)}>
                Realizar
              </button>
            )}
            {!offline && !downloaded && !corregido && (
              <button type="button" className="btn btn-success login-button" onClick={() => getTest(idCuestionario)}>
                Descargar test
              </button>
            )}
            {downloaded && !corregido && bloqueado && role === "student" && (
              <button type="button" className="btn btn-primary" data-bs-toggle="modal" onClick={showModal}>
                Realizar
              </button>
            )}
            {!offline && corregido && role === "student" && (
              <button type="button" className="btn btn-primary login-button" onClick={() => navigate(`/revision/${idCuestionario}`)}>
                Revisar
              </button>
            )}
            {downloaded && !corregido && role === "teacher" && (
              <button type="button" className="btn btn-primary login-button" onClick={() => navigate(`/test/${idCuestionario}`)}>
                Realizar
              </button>
            )}
            {!offline && role === "teacher" && (
              <button type="button" className="btn btn-primary login-button" onClick={() => navigate(`/revisionNotas/${idCuestionario}`)}>
                Revisar
              </button>
            )}
          </div>
          <ErrorModal id={`fecha_${idCuestionario}`} message={`El test solo se puede resolver entre las siguientes fechas:\n${fechas.fecha_apertura_formateada}\n${fechas.fecha_cierre_formateada}`} />
        </div>
      </div>
    );
};

export default TarjetaCuestionario;
