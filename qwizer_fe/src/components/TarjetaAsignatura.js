import React, { useEffect, useState } from 'react'
import { API_URL } from '../constants/Constants';

const TarjetaAsignatura = (props) => {
    const [state, setState] = useState({
        nCuestionarios: 0,
        nPendientes: 0,
        nCorregidos: 0
    });



    useEffect(() => {

        let token = localStorage.getItem('token');
        const jsonObject = JSON.stringify(Object.fromEntries({ "idAsignatura": props.idAsignatura }));
        fetch(`${API_URL}/get-subject-info`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': token
            },
            body: jsonObject
        })
            .then(response => response.json())
            .then(data => {
                setState({
                    nCuestionarios: data.nCuestionarios,
                    nPendientes: data.nPendientes,
                    nCorregidos: data.nCorregidos
                });
            })
            .catch(error => console.log(error));
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="card asignatura-section " name={props.asignatura} id={props.idAsignatura}>
            <div className="header bg-blue-grey">
                <h2>{props.asignatura}</h2>
            </div>
            <div className='asignatura-inner-body row'>
                <div className="col-9">
                    <p>Numero de test: {state.nCuestionarios}</p>
                    <p>Numero de tests corregidos: {state.nCorregidos}</p>
                    <p>Numero de tests pendientes: {state.nPendientes}</p>
                </div>
                <div className="col-3 button-section">
                    <button className="btn btn-primary login-button" onClick={() => props.getCuestionarios(props.idAsignatura, props.asignatura)}>Ver más</button>
                </div>
            </div>
        </div>
    );

}

export default TarjetaAsignatura;