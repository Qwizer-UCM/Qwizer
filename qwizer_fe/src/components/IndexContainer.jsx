import TarjetaAsignatura from './TarjetaAsignatura';
import useFetch from '../hooks/useFetch';
import { Subjects } from '../services/API';

const IndexContainer = () => {
  const { data, error, isLoading } = useFetch(Subjects.getFromStudentOrTeacher); // Guarda id y nombre de las asignaturas
  const { asignaturas } = data ?? {};

  if (error) {
    return <div>VISTA ERROR casi tan bonita como este div</div>;
  }

  if (!isLoading) {
    return (
      <div className="index-body">
        {asignaturas?.map((asignatura) => (
          <div key={asignatura.id} className="d-flex justify-content-center mt-1">
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
