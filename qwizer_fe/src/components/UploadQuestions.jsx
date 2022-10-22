import { useEffect, useState } from 'react';
import ErrorModal from './common/modals/ErrorModal';
import SuccessModal from './common/modals/SuccessModal';
import Subjects from '../services/Subjects';
import Questions from '../services/Questions';

const UploadQuestions = () => {
  const [file, setFile] = useState('');
  const [message, setMessage] = useState(undefined);
  const [asignaturasImpartidas, setAsignaturas] = useState([]);
  const [idAsignatura, setIdAsignatura] = useState('');

  useEffect(() => {
    Subjects.getFromStudentOrTeacher().then(({ data }) => {
      setAsignaturas(data.asignaturas);
    });
  }, []);

  const uploadFile = () => {
    if (file.name !== '' && idAsignatura) {
      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      reader.onload = (e) => {
        console.log(e.target.result);
        Questions.upload(e.target.result, idAsignatura)
          .then(({ data }) => {
            setFile('');
            setMessage(data.message);
            if (data.inserted === 'false') {
              window.$('#inserted_error').modal('show');
            } else {
              window.$('#inserted_success').modal('show');
            }
          })
          .catch((error) => console.log(error));
      };
    }
  };

  const seleccionaAsignatura = () => (
    <div className="">
      <select className="form-select margin-top-upload-question" defaultValue="null" onChange={(e) => setIdAsignatura(Number(e.target.value))}>
        {asignaturasImpartidas.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.nombre}
          </option>
        ))}
        <option key="null" value="null" hidden>
          {' '}
          Selecciona una Asignatura{' '}
        </option>
      </select>
    </div>
  );


  return (
    asignaturasImpartidas && (
      <div className="upload-body">
        <div className="card upload-section ">
          <div className="card-header header bg-blue-grey">
            <h2>Sube tus preguntas en formato : YAML</h2>
          </div>
          <div className='card-body upload-inner-body'>
            <h4>Selecciona un archivo:</h4>
            <div className="input-group">
              <div className="custom-file">
                <input type="file" className="custom-file-input" aria-describedby="inputGroupFileAddon01" onChange={(e) => setFile(e.target.files[0])} id="myfile" name="myfile" />
                <label className="custom-file-label" htmlFor="inputGroupFile01">
                  {file.name}
                </label>
              </div>
            </div>

            {seleccionaAsignatura()}

            <div className="upload-message-section">
              {file !== '' && idAsignatura && (
                <button type="button" className="btn btn-success btn-submit" onClick={uploadFile}>
                  Subir Preguntas
                </button>
              )}
            </div>
          </div>
        </div>
        <ErrorModal id="inserted_error" message={message} />
        <SuccessModal id="inserted_success" message={message} />
      </div>
    )
  );
};

export default UploadQuestions;
