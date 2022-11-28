import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { Subjects } from '../services/API'
import TarjetaCuestionario from "./TarjetaCuestionario";

const CuestionariosContainer = ({ role }) => {
  const params = useParams();
  const { data, error, isLoading } = useFetch(Subjects.getTests, { params: { idAsignatura: params.id }, deps: [params.id] })
  const { idCuestionarios, cuestionarios, nombre } = data ?? {}

  return (!isLoading && !error &&
    <div className="index-body row">
      <div className="section-title">
        <h1>{nombre}</h1>
      </div>
      {cuestionarios.length > 0 ? cuestionarios.map((cuestionario, indx) => (
        <div key={idCuestionarios[indx]} className="d-flex justify-content-center">
          <TarjetaCuestionario offline={false} cuestionario={cuestionario} idCuestionario={idCuestionarios[indx]} role={role} />
        </div>
      )) : (<div className="section-title">
              <h2>No hay cuestionarios de la asignatura {nombre}</h2>
              <h4>Utilice la opción de añadir crear cuestionarios</h4>
            </div>)}
    </div>
  );
};

export default CuestionariosContainer;
