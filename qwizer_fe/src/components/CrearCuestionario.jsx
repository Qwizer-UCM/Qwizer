import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import DataTable from 'react-data-table-component';
import BancoPreguntas from './BancoPreguntas';
import TestQuestion from './TestQuestion';
import TextQuestion from './TextQuestion';
import { Subjects, Tests } from '../services/API'
import useFetch from '../hooks/useFetch';
import { routes } from '../constants';

const columns = [
  {
    name: 'Id',
    selector: (row) => row.id,
    sortable: true,
    omit: true,
  },
  {
    name: 'Número de pregunta',
    selector: (row, index) => index,
  },
  {
    name: 'Título',
    selector: (row) => row.title,
  },
  {
    name: 'Puntuación Positiva',
    selector: (row) => row.punt_positiva,
  },
  {
    name: 'Puntuación Negativa',
    selector: (row) => row.punt_negativa,
  },
  {
    name: "Fijar pregunta",
    cell: (row) => <button type='button' style={{ 'border': 'none', 'backgroundColor': '#FFFFFF' }} onClick={(e) => handleClickLock(e, row.id)}><span id={`lock-${row.id}`} className="material-icons">
      lock_open
    </span></button>
  },
  {
    name: 'Aleatorizar opciones',
    cell: (row) => (row.type === "test" && <input type="checkbox" className='form-check-input' />)
  },
];

const handleClickLock = (e, id) => {
  e.preventDefault()
  if (e.target.id === `lock-${id}`)
    e.target.innerText = (e.target.innerText === "lock_open" ? "lock" : "lock_open")
}

const ExpandedComponent = ({ data }) => (data.type === "text") ?  // TODO cambiar en un futuro si metemos más tipo de preguntas
  <TextQuestion mode="visualize" infoPreg={data.info} id={data.id} /> :
  <TestQuestion mode="visualize" infoPreg={data.info} id={data.id} />


// TODO un poco extraño el funcionamiento de esto
// Se hace una petición para ver las asignaturas disponibles y luego en el componente
// bancoPreguntas se vuelve a hacer la misma peticion.
const CrearCuestionario = () => {
  const { data: asignaturasImpartidas } = useFetch(Subjects.getFromStudentOrTeacher)
  const navigate = useNavigate();
  const [selectedList, setSelectedList] = useState([]);
  const testForm = useRef();
  const testName = useRef();
  const testPass = useRef();
  const testSubject = useRef();
  const testSecuencial = useRef();
  const testDuration = useRef();
  const testOpeningDate = useRef();
  const testClosingDate = useRef();
  const testVisibleDate = useRef();
  const testRandom = useRef();


  const addSelectedQuestion = (preguntas) => {
    const listaPregSelec = [...selectedList];
    preguntas.forEach((pregunta, index) => {
      if (!listaPregSelec.some(preg => preg.id === pregunta.id)) {
        const preguntaElegida = {
          ...pregunta.objeto,
          punt_positiva: 0,
          punt_negativa: 0,
          fijar: false,
          orden: index,
          aleatorizar: false 
        }
        listaPregSelec.push(preguntaElegida);
      }

    })
    setSelectedList(listaPregSelec);
  };

  const modificarPuntuacion = (id, positiva, punt) => {
    const selectListInfo = [...selectedList]
    const pregModificado = selectListInfo.find(preg => preg.id === id)

    if (positiva) {
      pregModificado.punt_positiva = punt;
    } else {
      pregModificado.punt_negativa = punt;
    }

    setSelectedList(selectListInfo);
  };

  const deleteSelectedQuestion = (pregunta) => {
    const lista = [...selectedList];
    lista.splice(lista.findIndex(preg => preg.id === pregunta.id), 1);
    setSelectedList(lista);
  };

  const enviarCuestionarioCreado = (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }

    // TODO Quitar alerts y mejorar la validacion
    if (selectedList.length === 0) {
      alert('Debes seleccionar al menos 1 pregunta del banco de preguntas');
      return;
    }


    if (testClosingDate.current.valueAsNumber - testOpeningDate.current.valueAsNumber < testDuration.current.value * 60 * 1000) {
      alert("No da tiempo a hacer el test entre esas dos fechas")
      return;
    }

    const cuestionario = {
      testName: testName.current.value,
      testPass: testPass.current.value,
      testSubject: testSubject.current.value,
      secuencial: testSecuencial.current.value,
      testDuration: testDuration.current.value,
      fechaApertura: testOpeningDate.current.valueAsNumber,
      fechaCierre: testClosingDate.current.valueAsNumber,
      fechaVisible: testVisibleDate.current.valueAsNumber,
      questionList: selectedList,
      aleatorizar: testRandom.current.value
    };

    Tests.createQuiz({ cuestionario }).then(() => {
      navigate(routes.INICIO);
      alert('Cuestionario creado correctamente');
    });
  };

  const ordenPregunta = (id, orden) => {
    const selectListInfo = [...selectedList]
    const pregModificado = selectListInfo.find(preg => preg.id === id)
    pregModificado.orden = orden

    setSelectedList(selectListInfo);
  }

  const fijarOrdenPregunta = (id, fijar) => {
    const selectListInfo = [...selectedList]
    const pregModificado = selectListInfo.find(preg => preg.id === id)
    pregModificado.fijar = fijar

    setSelectedList(selectListInfo);
  }

  const aleatorizarOpcionesTest = (id, aleatorizar) => {
    const selectListInfo = [...selectedList]
    const pregModificado = selectListInfo.find(preg => preg.id === id)
    pregModificado.aleatorizar = aleatorizar

    setSelectedList(selectListInfo);
  }

  // TODO pueden meterse preguntas de otras asignaturas
  const vistaResumenCuestionario = () =>
    selectedList.length !== 0 ? (
      <div className="card m-3 rounded">
        <h3 className='card-header'>{(testName.current.value.length > 0) ? testName.current.value : "{Inserte titulo de cuestionario}"}</h3> {/* TODO No se si dejar esto */}
        <div className='card-body'>
          <div className="card rounded">
            <DataTable
              pagination
              theme="default"
              title="Resumen de preguntas"
              columns={columns}
              data={selectedList?.map((preg) => ({
                id: preg.id,
                title: preg.title,
                info: preg,
                question: preg.question,
                punt_positiva: preg.punt_positiva,
                punt_negativa: preg.punt_negativa,
                type: preg.type
              }))}
              expandableRows
              expandableRowsComponent={ExpandedComponent}
            />

          </div>

        </div>
      </div>
    ) : (
      <div className="section-title">
        <h2>No hay preguntas seleccionadas</h2>
        <h4>Añádalas desde la pestaña de banco de preguntas</h4>
      </div>
    )

  const vistaPreguntasSeleccionadas = () =>
    selectedList.length !== 0 ? (
      <div className="card m-3 rounded">
        <h3 className='card-header'>
          Preguntas seleccionadas
        </h3>
        <div className='card-body'>
          {Object.values(selectedList).map((pregunta) => (
            <div className="card rounded" key={pregunta.id}>
              {pregunta.type === 'text' && <TextQuestion mode="visualize" infoPreg={pregunta} id={pregunta.id} />}
              {pregunta.type === 'test' && <TestQuestion mode="visualize" infoPreg={pregunta} id={pregunta.id} />}
              <div className="d-flex flex-column justify-content-center visualize-container">
                <div className="row m-1 justify-content-center align-items-center">
                  <label className="col-md-2 col-sm-auto col-form-label" htmlFor="substractPunt">Puntuación positiva: &nbsp;{/* TODO revisar validacion Puntuación */}</label>
                  <input id="substractPunt" className="col-md-8 col-sm-auto m-input" type="number" min="0" step="any" onChange={(e) => modificarPuntuacion(pregunta.id, true, Number(e.target.value))} />
                </div>
                <div className='row m-1 justify-content-center align-items-center'>
                  <label className="col-md-2 col-sm-auto col-form-label" htmlFor="addPunt">Puntuación negativa: &nbsp;</label>
                  <input id="addPunt" className="col-md-8 col-sm-auto m-input" type="number" min="0" step="any" onChange={(e) => modificarPuntuacion(pregunta.id, false, Number(e.target.value))} />
                </div>
                <div className="row m-1 justify-content-center align-items-center">
                  <label className="col-md-2 col-sm-auto col-form-label" htmlFor="substractPunt">Orden: &nbsp;</label>
                  <input id="orden" className="col-md-8 col-sm-auto m-input" type="number" min="0" step="any" onChange={(e) => ordenPregunta(pregunta.id, Number(e.target.value))} />
                </div>
                <div className="row m-1 justify-content-center align-items-center">
                  <label className="col-md-2 col-sm-auto col-form-label" htmlFor="fijar">Fijar: &nbsp;</label>
                  <input id="fijar" className="col-md-8 col-sm-auto m-input" type="checkbox" onChange={(e) => fijarOrdenPregunta(pregunta.id, e.target.checked)} />
                </div>
                {pregunta.type === "test" && <div className="row m-1 justify-content-center align-items-center">
                  <label className="col-md-2 col-sm-auto col-form-label" htmlFor="aleat">Aleatorizar opciones: &nbsp;</label>
                  <input id="aleat" className="col-md-8 col-sm-auto m-input" type="checkbox" onChange={(e) => aleatorizarOpcionesTest(pregunta.id, e.target.checked)} />
                </div>}

              </div>
              <div className="d-flex justify-content-center">
                <button type="button" className="btn btn-danger m-1" onClick={() => deleteSelectedQuestion(pregunta)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="section-title">
        <h2>Su cuestinario no tiene preguntas</h2>
        <h4>Añádalas desde la pestaña de banco de preguntas</h4>
      </div>
    )

  const handleClick = () => {
    testForm.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  const datosCuestionario = () => (
    <div className="card m-3">
      <div className='card-body'>
        <div className="accordion" id="accordionPanelsStayOpenExample">
          <div className="accordion-item">
            <h2 className="accordion-header" id="panelsStayOpen-headingOne">
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                <span className="material-icons me-2 ">
                  info
                </span>General
              </button>
            </h2>
            <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show mx-3 mt-2" aria-labelledby="panelsStayOpen-headingOne" data-bs-parent='accordionPanelsStayOpenExample'>
              <InputGroup className='mb-3'>
                <InputGroup.Text>Nombre:</InputGroup.Text>
                <Form.Control name="testName" type="text" ref={testName} required />
              </InputGroup>
              <InputGroup className='mb-3'>
                <InputGroup.Text>Contraseña: &nbsp;</InputGroup.Text>
                <Form.Control name="testPass" type="text" ref={testPass} required />
              </InputGroup>
              <InputGroup className='mb-3'>
                <InputGroup.Text>Asignatura: &nbsp;</InputGroup.Text>
                <Form.Select defaultValue="null" ref={testSubject}>
                  {asignaturasImpartidas?.asignaturas?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.nombre}
                    </option>
                  ))}
                  <option key="null" hidden value="null">
                    Selecciona una Asignatura
                  </option>
                </Form.Select>
              </InputGroup>
              <InputGroup className='mb-3'>
                <InputGroup.Text>Secuencial: &nbsp;</InputGroup.Text>
                <Form.Select defaultValue="0" ref={testSecuencial}>
                  <option value="0">No</option>
                  <option value="1">Si</option>
                </Form.Select>
              </InputGroup>
              <InputGroup className='mb-3'>
                <InputGroup.Text>Aleatorizar Preguntas: &nbsp;</InputGroup.Text>
                <Form.Select defaultValue="False" ref={testRandom}>
                  <option value="False">No</option>
                  <option value="True">Si</option>
                </Form.Select>
              </InputGroup>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="panelsStayOpen-headingTwo">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                <span className="material-icons me-2">
                  schedule
                </span>Temporalización
              </button>
            </h2>
            <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingTwo" data-bs-parent='accordionPanelsStayOpenExample'>
              <div className="accordion-body">
                <InputGroup className='mb-3'>
                  <InputGroup.Text id='inputGroup-sizing-default'>Duración: (minutos [max 3h]) &nbsp;</InputGroup.Text>
                  <Form.Control type="number" name="testDuration" min="10" max="180" ref={testDuration} required />
                </InputGroup>
                <InputGroup className='mb-3'>
                  <InputGroup.Text id='inputGroup-sizing-default'>Fecha Apertura: &nbsp;</InputGroup.Text>
                  <Form.Control
                    type="datetime-local"
                    name="fechaApertura"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    ref={testOpeningDate}
                    required />
                </InputGroup>
                <InputGroup className='mb-3'>
                  <InputGroup.Text id='inputGroup-sizing-default'>Fecha Cierre: &nbsp;</InputGroup.Text>
                  <Form.Control className="form-control"
                    type="datetime-local"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    min={testOpeningDate.current?.value ?? new Date().toISOString().slice(0, 16)}
                    name="fechaCierre"
                    ref={testClosingDate}
                    required />
                </InputGroup>
                <InputGroup className='mb-3'>
                  <InputGroup.Text id='inputGroup-sizing-default'>Fecha Visible: &nbsp;</InputGroup.Text>
                  <Form.Control className="form-control"
                    type="datetime-local"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    name="fechaVisible"
                    ref={testVisibleDate}
                    required />
                </InputGroup>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="panelsStayOpen-headingThree">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                <span className="material-icons me-2 ">
                  quiz
                </span>Banco de Preguntas
              </button>
            </h2>
            <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingThree" data-bs-parent='accordionPanelsStayOpenExample'>
              <div className="accordion-body">
                <BancoPreguntas createQuiz addMultipleQuestions={addSelectedQuestion} />
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="panelsStayOpen-headingFour">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFour" aria-expanded="false" aria-controls="panelsStayOpen-collapseFour">
                <span className="material-icons me-2 ">
                  rate_review
                </span>Calificación
              </button>
            </h2>
            <div id="panelsStayOpen-collapseFour" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingFour" data-bs-parent='accordionPanelsStayOpenExample'>
              <div className="accordion-body">
                {vistaPreguntasSeleccionadas()}
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="panelsStayOpen-headingFive">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFive" aria-expanded="false" aria-controls="panelsStayOpen-collapseFive">
                <span className="material-icons me-2 ">
                  summarize
                </span>Visualización cuestionario
              </button>
            </h2>
            <div id="panelsStayOpen-collapseFive" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingFive" data-bs-parent='accordionPanelsStayOpenExample'>
              <div className="accordion-body">
                {vistaResumenCuestionario()}
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );

  // TODO cosa extraña al añadir una pregunta tipo test, desaparece el checkbox seleccionado del componente banco preguntas
  return (
    <div>
      <h1 className="text-center">Crear cuestionario</h1>
      <form onSubmit={enviarCuestionarioCreado} ref={testForm}>
        {datosCuestionario()}
        <div className="d-flex justify-content-center mb-3">
          <button type="button" className="btn btn-primary" onClick={handleClick}>
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearCuestionario;
