import DataTable from "react-data-table-component";
import TestQuestion from "../TestQuestion";
import TextQuestion from "../TextQuestion";

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

// TODO pueden meterse preguntas de otras asignaturas
const ResumenCuestionario = ({ selectedList, testName }) =>
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

export default ResumenCuestionario;