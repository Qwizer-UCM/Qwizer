import { useParams } from "react-router-dom";
import Subjects from "../services/Subjects";
import TarjetaCuestionario from "./TarjetaCuestionario";
import { useState, useEffect} from "react";

const CuestionariosContainer = (props) => {
  const params = useParams();

  const [cuestionarios, setCuestionarios] = useState([]); //Guarda los nombres de los cuestionarios
  const [idCuestionarios, setIdCuestionarios] = useState([]); //Guarda los IDs de los cuestionarios

  const asignatura = props.asignatura;
  const revisarTest = props.revisionTest;
  const rol = props.rol;
  const revisarNotasTest = props.revisarNotasTest;
  const revisionTestProfesor = props.revisionTestProfesor;

  useEffect(() => {
    //TODO Pensar como conseguir el nombre de la asignatura
    Subjects.getTests(params.id).then(({data}) => {
      setIdCuestionarios(data.idCuestionarios);
      setCuestionarios(data.cuestionarios);
    });
  }, [params.id]);

  return (
    <div className="index-body row">
      <div className="section-title">
        <h1>{asignatura}</h1>
      </div>
      {cuestionarios.map((cuestionario, indx) => {
        return (
          <div key={idCuestionarios[indx]} className="d-flex justify-content-center">
            <TarjetaCuestionario offline={false} cuestionario={cuestionario} idCuestionario={idCuestionarios[indx]} revisionTest={revisarTest} rol={rol} revisarNotasTest={revisarNotasTest} revisionTestProfesor={revisionTestProfesor} />
          </div>
        );
      })}
    </div>
  );
};

export default CuestionariosContainer;
