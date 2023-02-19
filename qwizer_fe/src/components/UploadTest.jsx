import { useState } from 'react';
import Modal from './common/modals/Modal';
import { Tests } from '../services/API';

const UploadFile = () => {
  const [file, setFile] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  const uploadFile = () => {
    if (file.name !== '') {
      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      reader.onload = (e) => {
        const ficheroYAML = e.target.result;

        Tests.upload({ ficheroYAML })
          .then(({ data }) => {
            setFile('');
            if (data.inserted === 'false') {
              setErrorModal({ show: true, message: data.message });
            } else {
              setSuccessModal({ show: true, message: data.message });
            }
          })
          .catch((error) => {
            setErrorModal({ show: true, message: error.response.data?.message ?? "Error" });
            console.log(error);
          });
      };
    }
  };

  return (
    <div className="upload-body">
      <div className="card upload-section">
        <div className="card-header header bg-blue-grey">
          <h2>Sube tu cuestionario en formato : YAML</h2>
        </div>
        <div className=" card-body upload-inner-body">
          <h4>
            <label htmlFor="myfile">Selecciona un archivo:</label>
          </h4>
          <div className="input-group">
            <div>
              <input type="file" className="form-control" aria-describedby="inputGroupFileAddon01" onChange={(e) => setFile(e.target.files[0])} id="myfile" name="myfile" />
              <label className="form-label" htmlFor="myfile">
                {file.name}
              </label>
            </div>
          </div>
          <div className="upload-message-section">
            {file !== '' && (
              <button type="button" className="btn btn-success btn-submit" onClick={uploadFile}>
                Subir Cuestionario
              </button>
            )}
          </div>
        </div>
      </div>
      <Modal options={errorModal} onHide={setErrorModal} type='danger'/>
      <Modal options={successModal} onHide={setSuccessModal} type='success'/>
    </div>
  );
};

export default UploadFile;
