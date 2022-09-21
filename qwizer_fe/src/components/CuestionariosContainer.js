import React from 'react'
import TarjetaCuestionario from './TarjetaCuestionario';

const CuestionariosContainer = (props) => {
    const idCuestionarios = props.idCuestionarios;
    const empezarTest = props.empezarTest;
    const asignatura = props.asignatura;
    const revisarTest = props.revisionTest;
    const rol = props.rol;
    const revisarNotasTest = props.revisarNotasTest;
    const revisionTestProfesor = props.revisionTestProfesor;

    if (empezarTest) {
        return (
            <div className="index-body row">

                <div className='section-title'><h1>{asignatura}</h1></div>
                {props.cuestionarios.map((cuestionario, indx) => {
                    return (
                        <div className='d-flex justify-content-center'>
                            <TarjetaCuestionario offline={false} cuestionario={cuestionario} idCuestionario={idCuestionarios[indx]} empezarTest={empezarTest} revisionTest={revisarTest} rol={rol} revisarNotasTest={revisarNotasTest} revisionTestProfesor={revisionTestProfesor}/>
                        </div>
                    )
                })
                }

            </div>
        );
    } else {
        return <h1>Loading...</h1>
    }

}

export default CuestionariosContainer;