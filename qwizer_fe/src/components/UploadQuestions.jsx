import { useState } from 'react';
import Modal from './common/modals/Modal';
import { Subjects, Questions } from '../services/API';
import useFetch from '../hooks/useFetch';

const UploadQuestions = () => {
  const [file, setFile] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });
  const [idAsignatura, setIdAsignatura] = useState('');
  const { data: asignaturasImpartidas } = useFetch(Subjects.getFromStudentOrTeacher, { transform: (res) => res.asignaturas });

  const uploadFile = () => {
    if (file.name !== '' && idAsignatura) {
      const formData = new FormData();
      formData.append('fichero_yaml', file);
      formData.append('idAsignatura', idAsignatura);

      Questions.upload({ formData })
        .then(({ data }) => {
          setFile('');
          if (data.inserted === 'false') {
            setErrorModal({ show: true, message: data.message });
          } else {
            setSuccessModal({ show: true, message: data.message });
          }
        })
        .catch((error) => {
          setErrorModal({ show: true, message: 'Error' });
          console.log(error);
        });
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
            <h2>Sube tus preguntas en formato YAML / Moodle XML</h2>
          </div>
          <div className="card-body upload-inner-body">
            <h4>Selecciona un archivo:</h4>
            <div className="input-group">
              <div>
                <input type="file" className="form-control" aria-describedby="inputGroupFileAddon01" onChange={(e) => setFile(e.target.files[0])} id="myfile" name="myfile" />
                <label className="form-label" htmlFor="myfile">
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
        <Modal options={errorModal} onHide={setErrorModal} type='danger'/>
        <Modal options={successModal} onHide={setSuccessModal} type='success'/>
      </div>
    )
  );
};

export default UploadQuestions;
