import React, { useEffect, useState } from 'react'
import ErrorModal from './common/modals/ErrorModal.js'
import SuccessModal from './common/modals/SuccessModal.js'
import DataTable from 'react-data-table-component'
import yaml from 'js-yaml'
import VisualizarPregunta from './VisualizarPregunta.js'
import Questions from '../services/Questions.js'
import Subjects from '../services/Subjects';

const BancoPreguntas = (props) => {
  const [selectedAsignatura, setSelectedAsignatura] = useState(undefined)
  const [listaAsignaturas, setListaAsignaturas] = useState([]) //lista de asignaturas del banco de preguntas
  const [columns, setColumns] = useState(undefined)
  const [data, setData] = useState(undefined)
  const [title, setTitle] = useState(undefined)
  const [preguntas, setPreguntas] = useState([])
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState(undefined)
  const [createQuiz, setCreateQuiz] = useState(false) //variable que le indica al banco de preguntas si se esta creando un cuestionario
 // const [message, setMessage] = useState("Todo fue bien")

  useEffect(() => {
    getAsignaturas();
    if (props.createQuiz !== undefined) {
      setCreateQuiz(props.createQuiz);
      //implica que  el metodo props.addQuestion tambien esta
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    generar_tabla()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsignatura, preguntas])

  useEffect(() =>{
    listaAsignaturas.forEach((asignatura, indx) => { //TODO adaptarlo a react
      window.$("#subject-selector").append(new Option(asignatura.asignatura, asignatura.id));
    });
  }, [listaAsignaturas])



  const getAsignaturas = () => {
    Subjects.getAll().then(({data}) => {
      setListaAsignaturas(data.asignaturas)
    })
  }

  const getPregAsignaturas = (idAsignatura) => {
    Subjects.getQuestions(idAsignatura).then(({data}) => {
      setSelectedAsignatura(idAsignatura)
      setPreguntas(data.preguntas)
    });


  }

  const generar_tabla = () => {
    let columns = [
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

    let data = [];
    preguntas.forEach((pregunta, indx) => {
      let row = {
        id: pregunta.id,
        objeto: pregunta,
        title: pregunta.title,
        question: pregunta.question
      }
      data.push(row);
    });

    setColumns(columns)
    setData(data)
    setTitle("Preguntas de la asignatura")
  }


  const handleChange = ({ selectedRows }) => {
    setPreguntasSeleccionadas(selectedRows)

  }

  const handleSelectChange = () => {
    getPregAsignaturas(window.$("#subject-selector").val());

  }

  const deleteQuestion = (idPregunta) => {
    Questions.delete(idPregunta)
    .then(() => getPregAsignaturas(selectedAsignatura))
    .catch(e => console.log(e))
  }

  const updateEditedQuestion = (question) => {
    return Questions.update(question)
    .then(() => getPregAsignaturas(selectedAsignatura))
    .catch(e => console.log(e))
  }

  const downloadselectedList = () => { //Funcion para descargar las preguntas seleccionadas en formato yaml

    let listaSeleccionadas = preguntasSeleccionadas.map(seleccionada => {
      return seleccionada.id;
    });

    let preguntasDescarga = preguntas.filter(pregunta => listaSeleccionadas.includes(pregunta.id));

    let listaPreguntas = []
    preguntasDescarga.forEach(pregunta => {

      let question = {}
      question["tipo"] = pregunta.type
      question["pregunta"] = pregunta.question
      question["opciones"] = pregunta.options

      if (pregunta.type === "test") {
        question["opciones"] = pregunta.options
      }

      question["op_correcta"] = pregunta.correct_op

      listaPreguntas.push(question)
    })

    let jsonObj = { "preguntas": listaPreguntas }

    //Convert JSON to Yaml

    let yamlObj = yaml.dump(jsonObj)

    //Crear enlace

    let data = new Blob([yamlObj], { type: 'text/yml' })
    let elemx = window.document.createElement('a');
    elemx.href = window.URL.createObjectURL(data);
    elemx.download = "preguntas.yaml";
    elemx.style.display = "none";
    document.body.appendChild(elemx);
    elemx.click();
    document.body.removeChild(elemx);
  }

  const downloadButton = () => {
    return <><button type='button' className="btn btn-success" onClick={downloadselectedList}>Descargar</button></>
  }

  const ExpandedComponent = ({ data }) => {
    if (createQuiz) {
      return <VisualizarPregunta data={data.objeto}
        createQuiz={true}
        addQuestion={props.addQuestion}>  {/*TODO Como es posible que esto funcionara antes si nunca ha existido esa función */}
      </VisualizarPregunta>;

    } else {
      return <VisualizarPregunta data={data.objeto}
        createQuiz={false}
        deleteQuestion={deleteQuestion} 
        updateEditedQuestion={updateEditedQuestion}>
      </VisualizarPregunta>;
    }
  }



  return <div className="index-body">
    <div className="card tabla-notas">
      <div className='card-content'>
        <h4 className='d-flex justify-content-center'>Banco de preguntas</h4>
        <label>Selecciona una asignatura para visualizar sus preguntas</label>
        <select className="form-select" id="subject-selector" onChange={handleSelectChange} aria-label="Default select example">
          <option hidden defaultValue>Selecciona una asignatura</option>
        </select>
        <br />
        <DataTable
          pointerOnHover
          selectableRows
          pagination
          theme={"default"}
          title={title}
          columns={columns}
          data={data}
          onSelectedRowsChange={handleChange}
          expandableRows
          expandableRowsComponent={ExpandedComponent}
          contextActions={downloadButton()}>  
        </DataTable>
      </div>
    </div>
    {/*<ErrorModal id={"inserted_error"} message={message}></ErrorModal>*/}
    {/*<SuccessModal id={"inserted_success"} message={message}></SuccessModal>*/}
  </div>
  //TODO mensaje de error no entiendo como lo hacían huele a copy paste



}

export default BancoPreguntas;