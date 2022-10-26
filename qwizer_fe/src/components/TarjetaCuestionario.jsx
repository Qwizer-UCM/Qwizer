import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './common/modals/Modal';
import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';

// TODO que un cuestionario este bloqueado deberia comprobarse en el lado servidor
// TODO separar en dos (offline, online), sera mas intuitivo el codigo
const TarjetaCuestionario = ({ offline, cuestionario, idCuestionario, role }) => {
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState({show:false,message:''});

  const [localStorageTest, setLocalStorageTest] = useState(() => JSON.parse(JSON.parse(localStorage.getItem('tests'))?.find((test) => JSON.parse(test).id === idCuestionario) ?? null) );
  const [downloaded, setdownloaded] = useState(() => localStorageTest);

  const { data, isLoading } = useFetch(Tests.getInfo, { skip: offline, params: { idCuestionario } });

  const source = offline ? localStorageTest : data;

  const { duracion, nota:calificacion } = source ?? {};
  const corregido = offline ? false : data?.corregido !== 0 
  const fechas = {
    fecha_apertura_formateada: source?.formattedFechaApertura || '',
    fecha_cierre_formateada: source?.formattedFechaCierre || '',
    fecha_apertura: source?.FechaApertura || '',
    fecha_cierre: source?.FechaCierre || '',
  };
  const bloqueado = new Date(fechas.fecha_apertura) > Date.now() || Date.now() > new Date(fechas.fecha_cierre);

  const addTestToLocalStorage = (jsonObject) => {
    const tests = localStorage.getItem('tests');
    const test = tests ? JSON.stringify([...JSON.parse(tests), jsonObject]) : JSON.stringify([jsonObject]);
    localStorage.setItem('tests', test);
  };

  const getTest = (id) => {
    Tests.get({ idCuestionario: id }).then(({ data:res }) => {
      addTestToLocalStorage(JSON.stringify(res));
      setLocalStorageTest(res)
      setdownloaded(true);
    });
  };

  const showModal = () => {
    setErrorModal({show:true,message:`El test solo se puede resolver entre las siguientes fechas:\n${fechas.fecha_apertura_formateada}\n${fechas.fecha_cierre_formateada}`})
  };

  return (
    !isLoading && (
      <div className="card asignatura-section " name={!offline ? cuestionario : cuestionario.title} id={idCuestionario}>
        <div id={`cuestionario_${idCuestionario}`} style={{ backgroundColor: corregido && calificacion >= 5 ? '#59ac79' : corregido && '#9c2400' }} className="card-header header bg-blue-grey">
          <h2>{!offline ? cuestionario : cuestionario.title}</h2>
          {!offline && corregido && <h5>Calificación: {calificacion}</h5>}
        </div>
        <div className="card-body asignatura-inner-body row">
          <div className="col-md-9 col-sm-auto">
            <p>Duración: {duracion} minutos</p>
            <p>Fecha de apertura: {fechas.fecha_apertura_formateada}</p>
            <p>Fecha de cierre: {fechas.fecha_cierre_formateada}</p>
          </div>
          <div className="col-md-3 col-sm-auto button-section">
            {downloaded && !corregido && !bloqueado && role === 'student' && (
              <button type="button" className="btn btn-primary login-button" onClick={() => navigate(`/test/${idCuestionario}`)}>
                Realizar
              </button>
            )}
            {!offline && !downloaded && !corregido && (
              <button type="button" className="btn btn-success login-button" onClick={() => getTest(idCuestionario)}>
                Descargar test
              </button>
            )}
            {downloaded && !corregido && bloqueado && role === 'student' && (
              <button type="button" className="btn btn-primary" data-bs-toggle="modal" onClick={showModal}>
                Realizar
              </button>
            )}
            {!offline && corregido && role === 'student' && (
              <button type="button" className="btn btn-primary login-button" onClick={() => navigate(`/revision/${idCuestionario}`)}>
                Revisar
              </button>
            )}
            {downloaded && !corregido && role === 'teacher' && (
              <button type="button" className="btn btn-primary login-button" onClick={() => navigate(`/test/${idCuestionario}`)}>
                Realizar
              </button>
            )}
            {!offline && role === 'teacher' && (
              <button type="button" className="btn btn-primary login-button" onClick={() => navigate(`/revisionNotas/${idCuestionario}`)}>
                Revisar
              </button>
            )}
          </div>
          <Modal options={errorModal} onHide={setErrorModal} type='danger'/>
        </div>
      </div>
    )
  );
};

export default TarjetaCuestionario;
