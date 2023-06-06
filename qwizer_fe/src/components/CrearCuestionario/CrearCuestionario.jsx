import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import BancoPreguntas from '../BancoPreguntas';
import { Subjects, Tests } from '../../services/API'
import useFetch from '../../hooks/useFetch';
import { INICIO } from '../../constants';
import ResumenCuestionario from './ResumenCuestionario';
import PreguntasSeleccionadas from './PreguntasSeleccionadas';


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
    preguntas.forEach((pregunta) => {
      if (!listaPregSelec.some(preg => preg.id === pregunta.id)) {
        const preguntaElegida = {
          ...pregunta.objeto,
          punt_positiva: 0,
          punt_negativa: 0,
          fijar: false,
          aleatorizar: false
        }
        listaPregSelec.push(preguntaElegida);
      }

    })
    setSelectedList(listaPregSelec);
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
      navigate(INICIO);
      alert('Cuestionario creado correctamente');
    });
  };

  const handleClick = () => {
    testForm.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  const datosCuestionario = () => (
    <div className="card m-3">
      <div className='card-body'>
        <div className="accordion" id="accordionCuestionario">
          <div className="accordion-item">
            <h2 className="accordion-header" id="tituloGeneral">
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <span className="material-icons me-2 ">
                  info
                </span>General
              </button>
            </h2>
            <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="tituloGeneral" data-bs-parent="#accordionCuestionario">
              <div className="accordion-body">
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
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="tituloTiempo">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                <span className="material-icons me-2">
                  schedule
                </span>Temporalización
              </button>
            </h2>
            <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="tituloTiempo" data-bs-parent="#accordionCuestionario">
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
            <h2 className="accordion-header" id="tituloBancoPreguntas">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                <span className="material-icons me-2 ">
                  quiz
                </span>Banco de Preguntas
              </button>
            </h2>
            <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="tituloBancoPreguntas" data-bs-parent="#accordionCuestionario">
              <div className="accordion-body">
                <BancoPreguntas createQuiz addMultipleQuestions={addSelectedQuestion} />
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="tituloCalificacion">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                <span className="material-icons me-2 ">
                  rate_review
                </span>Calificación
              </button>
            </h2>
            <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="tituloCalificacion" data-bs-parent="#accordionCuestionario">
              <div className="accordion-body">
                <PreguntasSeleccionadas selectedList={selectedList} setSelectedList={setSelectedList} />
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="tituloResumen">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                <span className="material-icons me-2 ">
                  summarize
                </span>Visualización cuestionario
              </button>
            </h2>
            <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="tituloResumen" data-bs-parent="#accordionCuestionario">
              <div className="accordion-body">
                <ResumenCuestionario selectedList={selectedList} setSelectedList={setSelectedList} testName={testName} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // TODO cosa extraña al añadir una pregunta tipo test, desaparece el checkbox seleccionado del componente banco preguntas
  return (
    <div className='index-body create-test'>
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
