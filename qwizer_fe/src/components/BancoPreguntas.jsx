import { useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import yaml from 'js-yaml'
// import ErrorModal from './common/modals/ErrorModal'
// import SuccessModal from './common/modals/SuccessModal'
import VisualizarPregunta from './VisualizarPregunta'
import Questions from '../services/Questions'
import Subjects from '../services/Subjects';


const columns = [
  {
    name: 'Id',
    selector: row => row.id,
    sortable: true,
    omit: true,
  },
  {
    name: 'objeto',
    selector: row => row.objeto,
    omit: true,
  },
  {
    name: 'Título',
    selector: row => row.title,
    sortable: true,
  },
  {
    name: 'Pregunta',
    selector: row => row.question,
    sortable: true
  }
];


const ExpandedComponent = ({ data , selectedAsignatura, createQuiz, addQuestion ,getPregAsignaturas}) => {
  const deleteQuestion = (idPregunta) => {
    Questions.delete(idPregunta)
    .then(() => getPregAsignaturas(selectedAsignatura.current.options[selectedAsignatura.current.selectedIndex].value))
    .catch(e => console.log(e))
  }

  const updateEditedQuestion = (question) => Questions.update(question)
    .then(() => getPregAsignaturas(selectedAsignatura.current.options[selectedAsignatura.current.selectedIndex].value))
    .catch(e => console.log(e))

  if (createQuiz) { // Componente cuando esta en CrearCuestionario.js
    return <VisualizarPregunta data={data.objeto}
      createQuiz
      addQuestion={addQuestion} />;
  }   // Componente cuando esta en Banco de Preguntas solo
    return <VisualizarPregunta data={data.objeto}
      createQuiz={false}
      deleteQuestion={deleteQuestion} 
      updateEditedQuestion={updateEditedQuestion} />;
}

const BancoPreguntas = ({createQuiz, addQuestion}) => {
  const [listaAsignaturas, setListaAsignaturas] = useState([]) // lista de asignaturas del banco de preguntas
  const [tableData, setData] = useState(undefined)
  const [preguntas, setPreguntas] = useState([])
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState(undefined)
 // const [message, setMessage] = useState("Todo fue bien")
  const title = "Preguntas de la asignatura"
  const selectedAsignatura = useRef();

  useEffect(() => {
    Subjects.getAll().then(({data}) => {
      setListaAsignaturas(data.asignaturas)
    })
  }, [])

  const getPregAsignaturas = (idAsignatura) => {
    Subjects.getQuestions(idAsignatura).then(({ data }) => {
      setPreguntas(data.preguntas);
      setData(
        data.preguntas.map((pregunta) => ({
          id: pregunta.id,
          objeto: pregunta,
          title: pregunta.title,
          question: pregunta.question,
        }))
      );
    });
  }

  const handleChange = ({ selectedRows }) => {
    setPreguntasSeleccionadas(selectedRows)
  }

  const handleSelectChange = () => {
    getPregAsignaturas(selectedAsignatura.current.options[selectedAsignatura.current.selectedIndex].value);
  }

  const downloadselectedList = () => { // Funcion para descargar las preguntas seleccionadas en formato yaml
    const listaSeleccionadas = preguntasSeleccionadas.map(seleccionada => seleccionada.id);
    const preguntasDescarga = preguntas.filter(pregunta => listaSeleccionadas.includes(pregunta.id));

    const listaPreguntas = preguntasDescarga.map(pregunta => ({
      tipo: pregunta.type,
      pregunta: pregunta.question,
      opciones: pregunta.options,
      op_correcta: pregunta.correct_op
    }))
   
    const data = new Blob([yaml.dump({ "preguntas": listaPreguntas })], { type: 'text/yml' })
    const elemx = window.document.createElement('a');
    elemx.href = window.URL.createObjectURL(data);
    elemx.download = "preguntas.yaml";
    elemx.style.display = "none";
    document.body.appendChild(elemx);
    elemx.click();
    document.body.removeChild(elemx);
    window.URL.revokeObjectURL(elemx.href);
  }

  const downloadButton = () => <button type='button' className="btn btn-success" onClick={downloadselectedList}>Descargar</button>

  return <div className="index-body">
    <div className="card tabla-notas">
      <div className='card-content'>
        <h4 className='d-flex justify-content-center'>Banco de preguntas</h4>
        <label htmlFor='subject-selector'>Selecciona una asignatura para visualizar sus preguntas</label>
          <select ref={selectedAsignatura} className="form-select" id="subject-selector" onChange={handleSelectChange} aria-label="Default select example" >
            <option hidden defaultValue>Selecciona una asignatura</option>
            <option hidden defaultValue>
                Selecciona una asignatura
              </option>
              {listaAsignaturas.map((asignatura) => (
                <option key={asignatura.id} value={asignatura.id}>{asignatura.asignatura}</option>
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
          data={tableData}
          onSelectedRowsChange={handleChange}
          expandableRows
          expandableRowsComponent={ExpandedComponent}
          expandableRowsComponentProps={{ selectedAsignatura, createQuiz, addQuestion, getPregAsignaturas}}
          contextActions={downloadButton()} />
      </div>
    </div>
    {/* <ErrorModal id={"inserted_error"} message={message}></ErrorModal> */}
    {/* <SuccessModal id={"inserted_success"} message={message}></SuccessModal> */}
  </div>
  // TODO mensaje de error no entiendo como lo hacían huele a copy paste



}

export default BancoPreguntas;