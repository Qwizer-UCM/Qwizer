import React from 'react'



class TarjetaAsignatura extends React.Component {

    constructor(props) {
        super(props);
    }

    render() { 
        const startTest = this.props.startTest;
        return(
            <div className="card-container" id={this.props.asignatura}>
                <div className="card">
                    <div className="card-content row">
                    
                        <div className="header bg-blue-grey">
                            <h2>{this.props.asignatura}</h2>
                        </div>
                            <div className="col-9">
                            <p>Numero de test: 3</p>
                            <p>Numero de tests corregidos: 2</p>
                            <p>Numero de tests pendientes 1</p>
                        </div>
                        <div className="col-3 button-section">
                            <button className="btn btn-primary login-button" onClick={startTest}>Ver mas</button>
                        </div>
                    </div>
                </div>
            </div>
         );
      }
}

export default TarjetaAsignatura;