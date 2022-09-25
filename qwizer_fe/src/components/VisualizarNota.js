import React, { Component } from 'react'
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import { API_URL } from '../constants/Constants';


//FIXME CHANGE TO FUNCTION
export default class VisualizarNota extends Component {

    constructor(props) {
      super(props)
    
      this.state = {
         editQuestion:false,
      };

      this.getHashes = this.getHashes.bind(this);
      
    }

    componentDidMount(){
        this.getHashes();
    }

    getHashes = () => {
        var token = localStorage.getItem('token');
        
        const message = new Map([["idCuestionario", this.props.data.idCuestionario], ["idUsuario", this.props.data.id]]);
        
        const jsonObject = JSON.stringify(Object.fromEntries(message));
        fetch(`${API_URL}/get-hashes`, {
        method: 'POST',
        headers:{
            'Content-type': 'application/json',
            'Authorization': token
        },
        body: jsonObject
        })
        .then(response => response.json())
        .then(data => {
          this.setState({
            corregido: data.corrected,
            hashSubida: data.hashSubida, 
            qrSent: data.qrSent,
            hashQr: data.hashQr
          });
          this.generar_tabla();
        })
        .catch(error => console.log(error));
      }

    render() {
        return <div className='pl-3 pt-3'>

            {this.state.corregido === true && 
                <div className="form-group">
                    <label for="name" className="col-lg-4">Hash generado tras la corrección:</label>
                    <div className="col-lg-8">
                    <input type="text" className="form-control" value={this.state.hashSubida} disabled/>
                    </div>
                </div>
            }

            {this.state.corregido === false &&   
                    <p className='pl-3'>Este exámen aun no ha sido corregido.</p>
            }

            {this.state.qrSent === true && 
                <div className="form-group">
                    <label for="name" className="col-lg-4">Hash generado mediante el codigo QR:</label>
                    <div className="col-lg-8">
                        <input type="text" className="form-control" value={this.state.hashQr} disabled/>
                    </div>
                </div>
            }

            {this.state.qrSent === false &&   
                <p className='pl-3'>El alumno no hizo uso del código QR.</p>
            }

            {this.state.qrSent === true && this.state.corregido === true && this.state.hashSubida === this.state.hashQr &&
                <p className="pl-3"><CheckIcon color="primary"/> Los códigos coinciden</p>  
            }

            {this.state.qrSent === true && this.state.corregido === true && this.state.hashSubida !== this.state.hashQr &&
                <p className="pl-3"><ErrorIcon color="primary"/> Los códigos no coinciden</p>  
            }
            
        </div>
    }
}
