import React from 'react'
import ErrorModal from './common/modals/ErrorModal';

const CuestionarioPassword = (props) => {
    const message = "Contraseña incorrecta"

    return (
        <div class="index-body">
            <div className="card tabla-notas">
                <div className='card-content'>
                    <div class="col text-center">
                        <h3>Introduce la contraseña para empezar el examen!</h3>
                    </div>

                    <div class="p-4 row">
                        <div class="col text-center">
                            <input type="text" className="center form-control" onChange={props.getPass}></input>
                        </div>
                    </div>
                    <div class="p-4 row">
                        <div class="col text-center">
                            <button type="button" class="btn btn-success" onClick={props.unlockTest}>Empezar Test</button>
                        </div>
                    </div>
                </div>
            </div>
            <ErrorModal id={"password_error"} message={message}></ErrorModal>
        </div>
    );

}

export default CuestionarioPassword;