import React, { useEffect, useState } from 'react'
import { useNavigate }from "react-router-dom";
import BancoPreguntas from './BancoPreguntas.js'
import TestQuestion from './TestQuestion'
import TextQuestion from './TextQuestion'
import Subjects from '../services/Subjects';
import Tests from '../services/Tests';


const CrearCuestionario = (props) => {
    const [asignaturasImpartidas, setAsignaturasImpartidas] = useState([])
    const [listaAsignaturas, setListaAsignaturas] = useState([]) //TODO no entiendo esto
    const [selectedList, setSelectedList] = useState([])
    const [selectedListInfo, setSelectedListInfo] = useState({})
    const [selectedQuestion, setSelectedQuestion] = useState('null') // y esto tampoco
    const [secuencial, setSecuencial] = useState(0)
    const [testName, setTestName] = useState(undefined)
    const [testPass, setTestPass] = useState(undefined)
    const [testSubject, setTestSubject] = useState(undefined)
    const [testDuration, setTestDuration] = useState(undefined)
    const [testOpeningDate, setTestOpeningDate] = useState(undefined)
    const [testClosingDate, setTestClosingDate] = useState(undefined)
    const navigate = useNavigate();


    useEffect(() => {
        getImparteAsignaturas();
        getAsignaturas();
    }, [])



    const getImparteAsignaturas = () => {
        Subjects.getFromStudentOrTeacher().then(({data}) => {
            setAsignaturasImpartidas(data.asignaturas)
        })
    }

    const getAsignaturas = () => {
        Subjects.getAll().then(({data}) => {
            setListaAsignaturas(data.asignaturas)
        })
    }

    const cuestionarioInfo = () => {
        return <div className="card m-3 p-3">
            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Nombre: &nbsp;</span>
                </div>
                <input className="form-control" name="testName" type="text" onChange={(e) => setTestName(e.target.value)} />
            </div>
            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Contraseña: &nbsp;</span>
                </div>
                <input className="form-control" name="testPass" type="text" onChange={(e) => setTestPass(e.target.value)} />
            </div>
            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Asignatura: &nbsp;</span>
                </div>
                <select className='form-control' defaultValue='null' onChange={(e) => setTestSubject(Number(e.target.value))}>
                    {asignaturasImpartidas.map((subject, indx) => {  //TODO comprobar la key
                        return (
                            <option key={subject.id} value={subject.id}>{subject.nombre}</option>
                        );
                    })}
                    <option key='null' hidden value='null'> Selecciona una Asignatura </option>
                </select>
            </div>

            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Secuencial: &nbsp;</span>
                </div>
                <select className='form-control' defaultValue='0' onChange={(e) => setSecuencial(Number(e.target.value))}>
                    <option value="0">No</option>
                    <option value="1">Si</option>
                </select>
            </div>
            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Duración: (minutos [max 3h]) &nbsp;</span>
                </div>
                <input className='form-control' type="number" name="testDuration" min="10" max="180"
                    onChange={(e) => setTestDuration(e.target.value)} />
            </div>
            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Fecha Apertura: &nbsp;</span>
                </div>
                <input className='form-control' type="datetime-local" name="fechaApertura" onChange={(e) => setTestOpeningDate(e.target.value)} />
            </div>
            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Fecha Cierre: &nbsp;</span>
                </div>
                <input className='form-control' type="datetime-local" name="fechaCierre" onChange={(e) => setTestClosingDate(e.target.value)} />
            </div>
        </div>
    }

    const addSelectedQuestion = (pregunta) => {
        let listaPregSelec = [...selectedList] //TODO No mutar estado, usar copias
        if (!listaPregSelec.includes(pregunta)) {
            listaPregSelec.push(pregunta)
            let diccionarioPregSelec = selectedListInfo
            diccionarioPregSelec[pregunta.id] = { punt_positiva: 0, punt_negativa: 0 }
            setSelectedList(listaPregSelec)
            setSelectedListInfo(diccionarioPregSelec)
        }
    }

    const modificarPuntuacion = (id, tipo, punt) => {
        //TODO Borrar el estado de diccionario, se puede meter directamente al array
        let diccionarioPregSelec = selectedListInfo;
        let punt_info = diccionarioPregSelec[id]

        if (tipo === "pos") {
            punt_info.punt_positiva = punt;
        } else if (tipo === "neg") {
            punt_info.punt_negativa = punt;
        }

        diccionarioPregSelec[id] = punt_info;

        setSelectedListInfo(diccionarioPregSelec)
    }


    const deleteSelectedQuestion = (pregunta) => {
        let lista = [...selectedList]   //TODO No mutar el estado, usar copias
        lista.splice(lista.indexOf(pregunta), 1)
        let diccionario = selectedListInfo
        delete diccionario[pregunta.id] 
        setSelectedList(lista)
        setSelectedListInfo(diccionario)
    }

    const enviarCuestionarioCreado = () => {
        //TODO horrible, rehacer y usar required en la etiqueta en vez de estos apaños en javascript
        // De paso nos quitamos la mitad de los estados :)
        let cuestionario = {};
        let incorrect = false;

        //TODO en el caso que fallen mas de dos pondría un error general

        if (testName) {
            cuestionario["testName"] = testName
        } else {
            alert("Debes rellenar el campo: Nombre")  //TODO cambiar a modal
            incorrect = true;

        }

        if (testPass) {
            cuestionario["testPass"] = testPass
        } else {
            alert("Debes rellenar el campo: Password")
            incorrect = true;
        }

        if (testSubject !== 'null') {
            cuestionario["testSubject"] = testSubject
        } else {
            alert("Debes selecionar la asingatura del Asignatura")
            incorrect = true;
        }


        cuestionario["secuencial"] = secuencial


        if (testDuration) {
            cuestionario["testDuration"] = testDuration
        } else {
            alert("Debes introducir la duracion del test")
            incorrect = true;
        }

        if (testOpeningDate && testClosingDate) {

            let date1 = new Date(testOpeningDate);
            let date2 = new Date(testClosingDate);


            if (date1 <= date2) {

                date1 = date1.valueOf();
                date2 = date2.valueOf();
                let timepoDesdeAperturaACierre = date2 - date1; //en milisegundos
                let duracionTestMilisegundos = testDuration * 60 * 1000 // de minutos a milisegundos

                if (timepoDesdeAperturaACierre >= duracionTestMilisegundos) {
                    cuestionario["fechaApertura"] = date1
                    cuestionario["fechaCierre"] = date2
                } else {
                    alert("No da tiempo ha hacer el test entre esas dos fechas")
                    incorrect = true;
                }

            } else {
                alert("La fecha de cierre no puede ser antes que la fecha de apertura")
                incorrect = true;
            }

        } else {
            alert("Debes rellenar el campo: de Fecha Apertura/Cierre")
            incorrect = true;
        }

        if (selectedList.length !== 0) {

            let listaPreguntas = []
            for (const key in selectedListInfo) {
                let pregunta = {}
                pregunta["id"] = key;
                pregunta["punt_positiva"] = selectedListInfo[key].punt_positiva;
                pregunta["punt_negativa"] = selectedListInfo[key].punt_negativa;

                listaPreguntas.push(pregunta);
            }
            cuestionario["questionList"] = listaPreguntas
        } else {
            alert("Debes seleccionar al menos 1 pregunta del banco de preguntas")
            incorrect = true;
        }

        if(!incorrect){//si se han rellenado todos los campos bien, entonces se envia
            //TODO OTRA VEZ no se comprueba respuesta de la API
            Tests.createQuiz(cuestionario).then(() => {
                navigate("/")
                alert("Cuestionario creado correctamente")
            })
        }



    }

    //TODO pueden meterse preguntas de otras asignaturas
    const createSelectedQuestions = () => {

        const modfPunt = modificarPuntuacion

        if (selectedList.length !== 0) {
            return <div className='card m-3 p-3'>
                {selectedList.map((pregunta, indx) => {
                    return <div className='card' key={pregunta.id}>

                        {pregunta.type === 'text' && <TextQuestion mode="visualize" infoPreg={pregunta} id={pregunta.id} />}
                        {pregunta.type === 'test' && <TestQuestion mode="visualize" infoPreg={pregunta} id={pregunta.id} />}

                        <div className="d-flex flex-column justify-content-center visualize-container">
                            <div className='row m-1'>
                                <label className='col-4'>Puntuación positiva: &nbsp;</label>
                                <input className="col-8 m-input" type="number" step="any" onChange={(e) => modfPunt(pregunta.id, "pos", Number(e.target.value))} />
                                <label className='col-4'>Puntuación negativa: &nbsp;</label>
                                <input className="col-8 m-input" type="number" step="any" onChange={(e) => modfPunt(pregunta.id, "neg", Number(e.target.value))} />
                            </div>
                        </div>
                        <div className='d-flex justify-content-center'>
                            <button type="button" className="btn btn-danger m-1" onClick={() => deleteSelectedQuestion(pregunta)}>Eliminar</button>
                        </div>
                    </div>
                })}
                <div className='d-flex justify-content-center'>
                    <button type="button" className="btn btn-primary" onClick={enviarCuestionarioCreado}>Guardar</button>
                </div>

            </div>
        }

    }


    return <div>
        <h1 className='text-center'>Crear cuestionario</h1>
        {cuestionarioInfo()}
        <BancoPreguntas createQuiz={true} addQuestion={addSelectedQuestion}></BancoPreguntas>
        {createSelectedQuestions()}
    </div>

}

export default CrearCuestionario;
