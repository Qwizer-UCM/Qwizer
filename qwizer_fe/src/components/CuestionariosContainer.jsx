import { useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Subjects } from '../services/API';
import NotFound404 from './common/NotFound404';
import TarjetaCuestionario from './TarjetaCuestionario';

const CuestionariosContainer = ({ role }) => {
  const params = useParams();
  const { data, error, isLoading } = useFetch(Subjects.getTests, { params: { idAsignatura: params.id }, deps: [params.id] });
  const { cuestionarios, nombre } = data ?? {};

  if (isLoading) return null;

  if (!isLoading && !error)
    return (
      <div className="index-body">
        <div className="section-title">
          <h1>{nombre}</h1>
        </div>
        {cuestionarios.length > 0 ? (
          cuestionarios.map((cuestionario) => (
            <div key={cuestionario.id} className="d-flex justify-content-center">
              <TarjetaCuestionario offline={false} cuestionario={cuestionario.titulo} idCuestionario={cuestionario.id} role={role} />
            </div>
          ))
        ) : (
          <div className="section-title">
            <h2>No hay cuestionarios de la asignatura {nombre}</h2>
            <h4>Utilice la opción de añadir crear cuestionarios</h4>
          </div>
        )}
      </div>
    );

  return <NotFound404 />;
};

export default CuestionariosContainer;
