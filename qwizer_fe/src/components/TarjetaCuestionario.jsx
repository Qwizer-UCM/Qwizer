import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './common/modals/Modal';
import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';
import { PATH_REVISION, PATH_REVISION_NOTAS_CUESTIONARIO, PATH_TEST } from '../constants';

// TODO refactorizar, demasiado dificil de leer
// TODO que un cuestionario este bloqueado deberia comprobarse en el lado servidor
const TarjetaCuestionario = ({ offline, cuestionario, idCuestionario, role }) => {
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [localStorageTest, setLocalStorageTest] = useState(() => JSON.parse(localStorage.getItem('tests'))?.[idCuestionario] ?? null);

  const { data, isLoading } = useFetch(Tests.getInfo, { skip: offline, params: { idCuestionario } });

  const source = offline ? localStorageTest : data;

  const { duracion, nota: calificacion } = source ?? {};
  const corregido = offline ? false : data?.corregido !== 0;
  const fechas = {
    fecha_apertura_formateada: source?.formatted_fecha_apertura || '',
    fecha_cierre_formateada: source?.formatted_fecha_cierre || '',
    fecha_apertura: source?.fecha_apertura || '',
    fecha_cierre: source?.fecha_cierre || '',
  };
  const bloqueado = role === 'student' &&  (new Date(fechas.fecha_apertura) > Date.now() || Date.now() > new Date(fechas.fecha_cierre));
  const downloaded = Boolean(localStorageTest);

  const addTestToLocalStorage = (jsonObject) => {
    const tests = localStorage.getItem('tests');
    const test = tests ? JSON.stringify({...JSON.parse(tests), [jsonObject.id]:jsonObject}) : JSON.stringify({[jsonObject.id]:jsonObject});
    localStorage.setItem('tests', test);
  };

  const getTest = (id) => {
    Tests.get({ idCuestionario: id }).then(({ data: res }) => {
      addTestToLocalStorage(res);
      setLocalStorageTest(res);
    });
  };

  const showModal = () => {
    setErrorModal({ show: true, message: `El test solo se puede resolver entre las siguientes fechas:\n${fechas.fecha_apertura_formateada}\n${fechas.fecha_cierre_formateada}` });
  };

  return (
    !isLoading && (
      <div className="card asignatura-section " name={!offline ? cuestionario : cuestionario.title} id={idCuestionario}>
        <div id={`cuestionario_${idCuestionario}`} style={{ backgroundColor: corregido && calificacion >= 5 ? '#59ac79' : corregido && '#9c2400' }} className="card-header header bg-blue-grey">
          <h2>{!offline ? cuestionario : cuestionario.titulo}</h2>
          {!offline && corregido && <h5>Calificación: {calificacion}</h5>}
        </div>
        <div className="card-body asignatura-inner-body row">
          <div className="col-md-9 col-sm-auto">
            <p>Duración: {duracion} minutos</p>
            <p>Fecha de apertura: {fechas.fecha_apertura_formateada}</p>
            <p>Fecha de cierre: {fechas.fecha_cierre_formateada}</p>
          </div>
          <div className="col-md-3 col-sm-auto d-flex justify-content-center align-items-center">
            {!offline && !downloaded && !corregido && (
              <button type="button" className="btn btn-success me-2" onClick={() => getTest(idCuestionario)}>
                Descargar test
              </button>
            )}

            {downloaded && !corregido && (
              <button type="button" className="btn btn-primary me-2" onClick={() => (bloqueado ? showModal() : navigate(PATH_TEST(idCuestionario)))}>
                Realizar
              </button>
            )}

            {!offline && (corregido || role === 'teacher') && (
              <button type="button" className="btn btn-primary me-2" onClick={() => (role === 'teacher' ? navigate(PATH_REVISION_NOTAS_CUESTIONARIO(idCuestionario)) : navigate(PATH_REVISION(idCuestionario)))}>
                Revisar
              </button>
            )}
          </div>
          <Modal options={errorModal} onHide={setErrorModal} type="danger" />
        </div>
      </div>
    )
  );
};

export default TarjetaCuestionario;
