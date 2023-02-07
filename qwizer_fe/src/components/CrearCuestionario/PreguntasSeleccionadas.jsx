import TestQuestion from "../TestQuestion";
import TextQuestion from "../TextQuestion";

const PreguntasSeleccionadas = ({ selectedList, setSelectedList }) => {


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

    return selectedList.length !== 0 ? (
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
}

export default PreguntasSeleccionadas;