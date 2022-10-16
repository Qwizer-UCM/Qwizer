import { useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import Subjects from "../services/Subjects";
import TarjetaCuestionario from "./TarjetaCuestionario";

const CuestionariosContainer = ({role}) => {
  const params = useParams();

  const [cuestionarios, setCuestionarios] = useState([]); // Guarda los nombres de los cuestionarios
  const [idCuestionarios, setIdCuestionarios] = useState([]); // Guarda los IDs de los cuestionarios
  const [asignatura, setAsignatura] = useState("");

  useEffect(() => {
    Subjects.getTests(params.id).then(({data}) => {
      setIdCuestionarios(data.idCuestionarios);
      setCuestionarios(data.cuestionarios);
      setAsignatura(data.nombre)
    })
  }, [params.id]);

  return (
    <div className="index-body row">
      <div className="section-title">
        <h1>{asignatura}</h1>
      </div>
      {cuestionarios.map((cuestionario, indx) => (
          <div key={idCuestionarios[indx]} className="d-flex justify-content-center">
            <TarjetaCuestionario offline={false} cuestionario={cuestionario} idCuestionario={idCuestionarios[indx]} role={role} />
          </div>
        ))}
    </div>
  );
};

export default CuestionariosContainer;
