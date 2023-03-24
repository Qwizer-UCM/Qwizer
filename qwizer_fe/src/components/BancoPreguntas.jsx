import { useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import yaml from 'js-yaml';
import VisualizarPregunta from './VisualizarPregunta';
import { Questions, Subjects } from '../services/API';
import useFetch from '../hooks/useFetch';

const columns = [
  {
    name: 'Id',
    selector: (row) => row.id,
    sortable: true,
    omit: true,
  },
  {
    name: 'objeto',
    selector: (row) => row.objeto,
    omit: true,
  },
  {
    name: 'Título',
    selector: (row) => row.title,
    sortable: true,
  },
  {
    name: 'Pregunta',
    selector: (row) => row.question,
    sortable: true,
  }
];

const ExpandedComponent = ({ data, selectedAsignatura, createQuiz, getPregAsignaturas }) => {
  const deleteQuestion = (idPregunta) => {
    Questions.delete({ idPregunta })
      .then(() => getPregAsignaturas(selectedAsignatura.current.options[selectedAsignatura.current.selectedIndex].value))
      .catch((e) => console.log(e));
  };

  const updateEditedQuestion = (question) =>
    Questions.update({ question })
      .then(() => getPregAsignaturas(selectedAsignatura.current.options[selectedAsignatura.current.selectedIndex].value))
      .catch((e) => console.log(e));

  if (createQuiz) {
    // Componente cuando esta en CrearCuestionario.js
    return <VisualizarPregunta data={data.objeto} createQuiz />;
  } // Componente cuando esta en Banco de Preguntas solo
  return <VisualizarPregunta data={data.objeto} createQuiz={false} deleteQuestion={deleteQuestion} updateEditedQuestion={updateEditedQuestion} />;
};

const BancoPreguntas = ({ createQuiz = false, addMultipleQuestions }) => {
  const { data: listaAsignaturas } = useFetch(Subjects.getFromStudentOrTeacher, { transform: (res) => res.asignaturas }); // lista de asignaturas del banco de preguntas
  const [preguntas, setPreguntas] = useState([]);
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState([]);
  const title = 'Preguntas de la asignatura';
  const selectedAsignatura = useRef();



  const getPregAsignaturas = (idAsignatura) => {
    Subjects.getQuestions({ idAsignatura }).then(({ data }) => {
      setPreguntas(data.preguntas);
    });
  };

  const handleChange = ({ selectedRows }) => {
    setPreguntasSeleccionadas(selectedRows);
  };

  const handleSelectChange = () => {
    getPregAsignaturas(selectedAsignatura.current.options[selectedAsignatura.current.selectedIndex].value);
  };

  const downloadselectedList = () => {
    // Funcion para descargar las preguntas seleccionadas en formato yaml
    const listaSeleccionadas = preguntasSeleccionadas.map((seleccionada) => seleccionada.id);
    const preguntasDescarga = preguntas.filter((pregunta) => listaSeleccionadas.includes(pregunta.id));

    const listaPreguntas = preguntasDescarga.map((pregunta) => ({
      tipo: pregunta.type,
      pregunta: pregunta.question,
      opciones: pregunta.options,
      op_correcta: pregunta.correct_op,
    }));

    const data = new Blob([yaml.dump({ preguntas: listaPreguntas })], { type: 'text/yml' });
    const elemx = window.document.createElement('a');
    elemx.href = window.URL.createObjectURL(data);
    elemx.download = 'preguntas.yaml';
    elemx.style.display = 'none';
    document.body.appendChild(elemx);
    elemx.click();
    document.body.removeChild(elemx);
    window.URL.revokeObjectURL(elemx.href);
  };


  const addOrDownloadButton = () =>
    !createQuiz ? (
      <button type="button" className="btn btn-success" onClick={downloadselectedList}>
        Descargar
      </button>
    )
      :
      (<button type="button" className="btn btn-success" onClick={() => addMultipleQuestions(preguntasSeleccionadas)}>
        Añadir
      </button>
      )


  return (
    <div className="index-body">
      <div className="card tabla-notas">
        <div className="card-content">
          <h4 className="d-flex justify-content-center">Banco de preguntas</h4>
          <label htmlFor="subject-selector">
            Selecciona una asignatura para visualizar sus preguntas</label>
          <select ref={selectedAsignatura} className="form-select" id="subject-selector" onChange={handleSelectChange} aria-label="Default select example">
            <option hidden defaultValue>
              Selecciona una asignatura
            </option>
            {listaAsignaturas?.map((asignatura) => (
              <option key={asignatura.id} value={asignatura.id}>
                {asignatura.nombre}
              </option>
            ))}
          </select>
          <br />
          <DataTable
            pointerOnHover
            selectableRows
            pagination
            theme="default"
            title={title}
            columns={columns}
            data={preguntas?.map((pregunta) => ({
              id: pregunta.id,
              objeto: pregunta,
              title: pregunta.title,
              question: pregunta.question,
            }))}
            onSelectedRowsChange={handleChange}
            expandableRows
            expandableRowsComponent={ExpandedComponent}
            expandableRowsComponentProps={{ selectedAsignatura, createQuiz, getPregAsignaturas }}
            contextActions={addOrDownloadButton()}
          />
        </div>
      </div>
    </div>
  );
};

export default BancoPreguntas;
