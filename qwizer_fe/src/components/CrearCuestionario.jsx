import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BancoPreguntas from './BancoPreguntas';
import TestQuestion from './TestQuestion';
import TextQuestion from './TextQuestion';
import Subjects from '../services/Subjects';
import Tests from '../services/Tests';

const CrearCuestionario = () => {
  const navigate = useNavigate();
  const [asignaturasImpartidas, setAsignaturasImpartidas] = useState([]);
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

  useEffect(() => {
    getImparteAsignaturas();
  }, []);

  const getImparteAsignaturas = () => {
    Subjects.getFromStudentOrTeacher().then(({ data }) => {
      setAsignaturasImpartidas(data.asignaturas);
    });
  };

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
    // TODO horrible, rehacer y usar required en la etiqueta en vez de estos apaños en javascript
    // De paso nos quitamos la mitad de los estados :)

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

    Tests.createQuiz(cuestionario).then(() => {
      navigate('/');
      alert('Cuestionario creado correctamente');
    });
  };

  // TODO pueden meterse preguntas de otras asignaturas
  const vistaPreguntasSeleccionadas = () =>
    selectedList.length !== 0 && (
      <div className="card m-3 p-3">
        {Object.values(selectedList).map((pregunta) => (
          <div className="card" key={pregunta.id}>
            {pregunta.type === 'text' && <TextQuestion mode="visualize" infoPreg={pregunta} id={pregunta.id} />}
            {pregunta.type === 'test' && <TestQuestion mode="visualize" infoPreg={pregunta} id={pregunta.id} />}
            <div className="d-flex flex-column justify-content-center visualize-container">
              <div className="row m-1">
                <label className="col-4" htmlFor="substractPunt">
                  Puntuación positiva: &nbsp;
                  {/* TODO revisar validacion Puntuación */}
                </label>
                <input id="substractPunt" className="col-8 m-input" type="number" min="0" step="any" onChange={(e) => modificarPuntuacion(pregunta.id, true, Number(e.target.value))} />
                <label className="col-4" htmlFor="addPunt">
                  Puntuación negativa: &nbsp;
                </label>
                <input id="addPunt" className="col-8 m-input" type="number" min="0" step="any" onChange={(e) => modificarPuntuacion(pregunta.id, false, Number(e.target.value))} />
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
    );

  const handleClick = () => {
    testForm.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  const datosCuestionario = () => (
    <div className="card m-3 p-3">
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-default">
            Nombre: &nbsp;
          </span>
        </div>
        <input className="form-control" name="testName" type="text" ref={testName} required />
      </div>
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-default">
            Contraseña: &nbsp;
          </span>
        </div>
        <input className="form-control" name="testPass" type="text" ref={testPass} required />
      </div>
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-default">
            Asignatura: &nbsp;
          </span>
        </div>
        <select className="form-control" defaultValue="null" ref={testSubject}>
          {asignaturasImpartidas.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.nombre}
            </option>
          ))}
          <option key="null" hidden value="null">
            Selecciona una Asignatura
          </option>
        </select>
      </div>

      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-default">
            Secuencial: &nbsp;
          </span>
        </div>
        <select className="form-control" defaultValue="0" ref={testSecuencial}>
          <option value="0">No</option>
          <option value="1">Si</option>
        </select>
      </div>
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-default">
            Duración: (minutos [max 3h]) &nbsp;
          </span>
        </div>
        <input className="form-control" type="number" name="testDuration" min="10" max="180" ref={testDuration} required />
      </div>
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-default">
            Fecha Apertura: &nbsp;
          </span>
        </div>
        <input className="form-control" type="datetime-local" name="fechaApertura" defaultValue={new Date().toISOString().slice(0, 16)} ref={testOpeningDate} required />
      </div>
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-default">
            Fecha Cierre: &nbsp;
          </span>
        </div>
        <input
          className="form-control"
          type="datetime-local"
          defaultValue={new Date().toISOString().slice(0, 16)}
          min={testOpeningDate.current?.value ?? new Date().toISOString().slice(0, 16)}
          name="fechaCierre"
          ref={testClosingDate}
          required
        />
      </div>
    </div>
  );

  // TODO cosa extraña al añadir una pregunta tipo test, desaparece el checkbox seleccionado del componente banco preguntas
  return (
    <div>
      <h1 className="text-center">Crear cuestionario</h1>
      <form onSubmit={enviarCuestionarioCreado} ref={testForm}>
        {datosCuestionario()}
        <div className="d-flex justify-content-center">
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
