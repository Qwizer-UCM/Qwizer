import TestQuestion from "../TestQuestion";
import TextQuestion from "../TextQuestion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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

// const ExpandedComponent = ({ data }) => (data.type === "text") ?  // TODO cambiar en un futuro si metemos más tipo de preguntas
//     <TextQuestion mode="visualize" infoPreg={data.info} id={data.id} /> :
//     <TestQuestion mode="visualize" infoPreg={data.info} id={data.id} />

const reorder = (list, startIndex, endIndex) => {
    const result = [...list]
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}




// TODO pueden meterse preguntas de otras asignaturas
const ResumenCuestionario = ({ selectedList, setSelectedList, testName }) => {

    const onDragEnd = ({ source, destination }) => {
        if (!destination || (source.index === destination.index && source.droppableId === destination.droppableId)) return
        setSelectedList(prevPregs => reorder(prevPregs, source.index, destination.index))
    }

    const deleteSelectedQuestion = (pregunta) => {
        const lista = [...selectedList];
        lista.splice(lista.findIndex(preg => preg.id === pregunta.id), 1);
        setSelectedList(lista);
    };

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


    return selectedList.length !== 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="summary-quiz">
                <h3>{(testName.current.value.length > 0) ? testName.current.value : "{Inserte titulo de cuestionario}"}</h3> {/* TODO No se si dejar esto */}
                <Droppable droppableId="summary-questions">
                    {(droppableProvided) =>
                        <ul
                            {...droppableProvided.droppableProps}
                            ref={droppableProvided.innerRef}  /* Referencia al primer elemento de la lista para poder manejar la lista */
                            className="summary-questions">
                            {selectedList.map((preg, index) => (
                                <Draggable key={preg.id} draggableId={preg.id.toString()} index={index}>
                                    {(draggableProvided) =>
                                        <li className="row"
                                            {...draggableProvided.draggableProps}
                                            ref={draggableProvided.innerRef}
                                            {...draggableProvided.dragHandleProps}
                                        >
                                            <span className="material-icons col-sm-auto col-md-1 col-lg-1">
                                                drag_indicator
                                            </span>
                                            <span className="pregOrder col-sm-auto col-md-1 col-lg-1">{index}</span>
                                            <span className="col-sm-auto col-md-6 col-lg-6"><b>{preg.title}</b> {preg.question}</span>
                                            {/* <span className="col-sm-auto col-md-1 col-lg-1 pregPunt">
                                                {preg.punt_positiva} <span title="Editar puntacion postiva" className="material-icons me-2 ">
                                                    edit
                                                </span>
                                            </span>
                                            <span className="col-sm-auto col-md-1 col-lg-1 pregPunt">
                                                {preg.punt_negativa} <span title="Editar puntacion negativa" className="material-icons me-2 ">
                                                    edit
                                                </span>
                                            </span> */}
                                            <span className="col-sm-auto col-md-1 col-lg-1" title="Fijar el orden de esta pregunta">
                                                Fijar: <input id="fijar" className="form-check-input" type="checkbox" onChange={(e) => fijarOrdenPregunta(preg.id, e.target.checked)} />
                                            </span>
                                            {preg.type === "test" && <span className="col-sm-auto col-md-2 col-lg-2" title="Aleatorizar opciones">
                                                Aleatorizar: <input className="form-check-input" type="checkbox" onChange={(e) => aleatorizarOpcionesTest(preg.id, e.target.checked)} />
                                            </span>}
                                            <span className="col-sm-auto col-md-1 col-lg-1 material-icons deletePreg" title="Borrar pregunta" onClick={() => deleteSelectedQuestion(preg)}>
                                                delete
                                            </span>

                                        </li>}
                                </Draggable>
                            ))}
                            {droppableProvided.placeholder} {/* Reserva un espacio del DOM para que cuando recogas un elemento no se reajuste el espacio */}
                        </ul>}
                </Droppable>
            </div>
        </DragDropContext>
    ) : (
        <div className="section-title">
            <h2>No hay preguntas seleccionadas</h2>
            <h4>Añádalas desde la pestaña de banco de preguntas</h4>
        </div>
    )
}

export default ResumenCuestionario;