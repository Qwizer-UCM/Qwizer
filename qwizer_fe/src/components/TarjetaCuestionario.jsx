import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import Modal from './common/modals/Modal';
import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';
import { PATH_REVISION, PATH_REVISION_NOTAS_CUESTIONARIO, PATH_TEST } from '../constants';

// TODO refactorizar, demasiado dificil de leer
// TODO que un cuestionario este bloqueado deberia comprobarse en el lado servidor
const TarjetaCuestionario = ({ offline, cuestionario, idCuestionario, role }) => {
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [localStorageTest, setLocalStorageTest] = useState();

  const { data, isLoading } = useFetch(Tests.getInfo, { skip: offline, params: { idCuestionario } });

  useEffect(() => {
    localforage.getItem('tests').then(value => {
      if (value && value[idCuestionario]) {
        setLocalStorageTest(value[idCuestionario]);
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  useEffect(() => {
    localforage.getItem('tests').then(value => {
      if (localStorageTest) {
        localforage.setItem('tests',{...value,[idCuestionario]:localStorageTest})
      } else if(value) {
          delete value[idCuestionario]
          if (Object.keys(value).length === 0) {
            localforage.removeItem('tests')
          } else {
            localforage.setItem('tests',{...value})
          }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorageTest])
  
  const source = offline ? localStorageTest : data;

  const { duracion, nota: calificacion, notaMax: calificacionMax } = source ?? {};
  const corregido = offline ? false : data?.corregido !== 0;
  const fechas = {
    fecha_apertura_formateada: source?.formatted_fecha_apertura || '',
    fecha_cierre_formateada: source?.formatted_fecha_cierre || '',
    fecha_visible_formateada: source?.formatted_visible_cierre || '',
    fecha_apertura: source?.fecha_apertura || '',
    fecha_cierre: source?.fecha_cierre || '',
    fecha_visible: source?.fecha_visible || '',
  };
  const bloqueado = role === 'student' &&  (new Date(fechas.fecha_apertura) > Date.now() || Date.now() > new Date(fechas.fecha_cierre));
  const downloaded = Boolean(localStorageTest);
  const visible = (Date.now() > new Date(fechas.fecha_visible));

  const getTest = (id) => {
    Tests.get({ idCuestionario: id }).then(({ data: res }) => {
      setLocalStorageTest(res);
    });
  };

  const deleteTest = () => {
    setLocalStorageTest()
  }

  const showModal = () => {
    setErrorModal({ show: true, message: `El test solo se puede resolver entre las siguientes fechas:\n${fechas.fecha_apertura_formateada}\n${fechas.fecha_cierre_formateada}` });
  };

  return (
    !isLoading && ((offline && downloaded) || !offline) && visible && (
      <div className="card asignatura-section " name={!offline ? cuestionario : cuestionario.title} id={idCuestionario}>
        <div id={`cuestionario_${idCuestionario}`} style={{ backgroundColor: corregido && calificacion >= calificacionMax/2 ? '#59ac79' : corregido && '#9c2400' }} className="card-header header bg-blue-grey">
          <h2>{!offline ? cuestionario : cuestionario.titulo}</h2>
          {!offline && corregido && <h5>Calificación: {calificacion} / {calificacionMax}</h5>}
        </div>
        <div className="card-body row">
          <div className="col-md-7 col-sm-auto">
            <p>Duración: {duracion} minutos</p>
            <p>Fecha de apertura: {fechas.fecha_apertura_formateada}</p>
            <p>Fecha de cierre: {fechas.fecha_cierre_formateada}</p>
          </div>
          <div className="col-md-5 col-sm-auto d-flex justify-content-start justify-content-sm-end align-items-center">
            {!offline && !downloaded && !corregido &&(
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
             {downloaded && (
              <button type="button" className="btn btn-danger me-2" onClick={deleteTest}>
                <span className="material-icons align-middle">delete</span>
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
