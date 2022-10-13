import React, { useEffect, useState } from 'react'
import ErrorModal from './common/modals/ErrorModal';
import SuccessModal from './common/modals/SuccessModal';
import Subjects from '../services/Subjects.js'
import { API_URL } from '../constants/Constants';
import Questions from '../services/Questions';


const UploadQuestions = (props) => {
    const [file, setFile] = useState("")
    const [message, setMessage] = useState(undefined)
    const [asignaturasImpartidas, setAsignaturas] = useState([])
    const [idAsignatura, setIdAsignatura] = useState("")

    useEffect(() => {
        Subjects.getFromStudentOrTeacher().then(({data}) => {
            setAsignaturas(data.asignaturas);
        })
    }, [])

    const uploadFile = () => {
        if (file.name !== "" && idAsignatura) {
            let reader = new FileReader();
            reader.readAsText(file, 'utf-8');
            reader.onload = (e) => {
                console.log(e.target.result)
                Questions.upload(e.target.result, idAsignatura)
                .then(({data}) => {
                    setFile("")
                    setMessage(data.message)
                    if (data.inserted === "false") {
                        window.$("#inserted_error").modal('show');
                    }
                    else {
                        window.$("#inserted_success").modal('show');
                    }

                })
                .catch(error => console.log(error));
            }
        }
    }

    const seleccionaAsignatura = () => {
        return <div className=''>

            <select className='form-select margin-top-upload-question' defaultValue='null' onChange={(e) => setIdAsignatura(Number(e.target.value))}>
                {asignaturasImpartidas.map((subject, indx) => {
                    return (
                        <option key={indx} value={subject.id}>{subject.nombre}</option>
                    );
                })}
                <option key='null' value='null' hidden> Selecciona una Asignatura </option>
            </select>

        </div>
    }

    if (asignaturasImpartidas) {
        return (
            <div className="upload-body">
                <div className="card upload-section ">
                    <div className="header bg-blue-grey">
                        <h2>Sube tus preguntas en formato : YAML</h2>
                    </div>
                    <div className='upload-inner-body'>
                        <h4><label htmlFor="myfile">Selecciona un archivo:</label></h4>
                        <div className="input-group">
                            <div className="custom-file">
                                <input type="file" className="custom-file-input" aria-describedby="inputGroupFileAddon01" onChange={(e) => setFile(e.target.files[0])} id="myfile" name="myfile" />
                                <label className="custom-file-label" htmlFor="inputGroupFile01">{file.name}</label>
                            </div>
                        </div>

                        {seleccionaAsignatura()}

                        <div className="upload-message-section">
                            {file !== '' && idAsignatura &&
                                <button type="button" className="btn btn-success btn-submit" onClick={uploadFile}>Subir Preguntas</button>
                            }
                        </div>
                    </div>

                </div>
                <ErrorModal id={"inserted_error"} message={message}></ErrorModal>
                <SuccessModal id={"inserted_success"} message={message}></SuccessModal>
            </div>
        )
    }
}

    
export default UploadQuestions;
