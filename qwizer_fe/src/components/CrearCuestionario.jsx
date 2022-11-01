import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import BancoPreguntas from './BancoPreguntas';
import TestQuestion from './TestQuestion';
import TextQuestion from './TextQuestion';
import {Subjects,Tests} from '../services/API'
import useFetch from '../hooks/useFetch';

// TODO un poco extraño el funcionamiento de esto
// Se hace una petición para ver las asignaturas disponibles y luego en el componente
// bancoPreguntas se vuelve a hacer la misma peticion.
const CrearCuestionario = () => {
  const {data:asignaturasImpartidas} = useFetch(Subjects.getFromStudentOrTeacher)
  const navigate = useNavigate();
  const [selectedList, setSelectedList] = useState([]);
  const [selectedListInfo, setSelectedListInfo] = useState({});
  const testForm = useRef();
  const testName = useRef();
  const testPass = useRef();
  const testSubject = useRef();
  const testSecuencial = useRef();
  const testDuration = useRef();
  const testOpeningDate = useRef();
  const testClosingDate = useRef();

  const addSelectedQuestion = (pregunta) => {
    const listaPregSelec = [...selectedList];
    if (!listaPregSelec.includes(pregunta)) {
      listaPregSelec.push(pregunta);
      setSelectedList(listaPregSelec);
      setSelectedListInfo({
        ...selectedListInfo,
        [pregunta.id]: { punt_positiva: 0, punt_negativa: 0 },
      });
    }
  };

  const modificarPuntuacion = (id, positiva, punt) => {
    const diccionarioPregSelec = { ...selectedListInfo };
    const puntInfo = diccionarioPregSelec[id];

    if (positiva) {
      puntInfo.punt_positiva = punt;
    } else {
      puntInfo.punt_negativa = punt;
    }

    diccionarioPregSelec[id] = puntInfo;
    setSelectedListInfo(diccionarioPregSelec);
  };

  const deleteSelectedQuestion = (pregunta) => {
    const lista = [...selectedList];
    lista.splice(lista.indexOf(pregunta), 1);
    const diccionario = { ...selectedListInfo };
    delete diccionario[pregunta.id];
    setSelectedList(lista);
    setSelectedListInfo(diccionario);
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
      questionList: Object.keys(selectedListInfo).map((key) => ({
        id: key,
        punt_positiva: selectedListInfo[key].punt_positiva,
        punt_negativa: selectedListInfo[key].punt_negativa,
      })),
    };

    Tests.createQuiz({cuestionario}).then(() => {
      navigate('/');
      alert('Cuestionario creado correctamente');
    });
  };

  // TODO pueden meterse preguntas de otras asignaturas
  const vistaPreguntasSeleccionadas = () =>
    selectedList.length !== 0 && (
      <div className="card m-3">
        <div className='card-body'>
          {Object.values(selectedList).map((pregunta) => (
            <div className="card" key={pregunta.id}>
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
    );

  const handleClick = () => {
    testForm.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  const datosCuestionario = () => (
    <div className="card m-3">
      <div className='card-body'>
        <InputGroup className='mb-3'>
          <InputGroup.Text id='inputGroup-sizing-default'>Nombre:</InputGroup.Text>
          <Form.Control name="testName" type="text" ref={testName} required />
        </InputGroup>
        <InputGroup className='mb-3'>
          <InputGroup.Text id='inputGroup-sizing-default'>Contraseña: &nbsp;</InputGroup.Text>
          <Form.Control name="testPass" type="text" ref={testPass} required />
        </InputGroup>
        <InputGroup className='mb-3'>
          <InputGroup.Text id='inputGroup-sizing-default'>Asignatura: &nbsp;</InputGroup.Text>
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
          <InputGroup.Text id='inputGroup-sizing-default'>Secuencial: &nbsp;</InputGroup.Text>
          <Form.Select defaultValue="0" ref={testSecuencial}>
            <option value="0">No</option>
            <option value="1">Si</option>
          </Form.Select>
        </InputGroup>
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
      <BancoPreguntas createQuiz addQuestion={addSelectedQuestion} />
      {vistaPreguntasSeleccionadas()}
    </div>
  );
};

export default CrearCuestionario;
