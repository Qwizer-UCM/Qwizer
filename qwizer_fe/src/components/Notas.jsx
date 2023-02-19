import { useState } from 'react';
import Modal from './common/modals/Modal';

const Notas = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [options, setOptions] = useState([]);
  const [file, setFile] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  const uploadFile = () => {
    if (file.name !== '') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const csvData = evt.target.result;
        const rows = csvData.split("\n").map(row => row.split(","));
        const selectedIdx = rows[0].indexOf(selectedOption)

        //TODO notas de donde salen, por cuestionario, la suma de las notas?
        rows.forEach((row,idx) => {if(idx!==0) row[selectedIdx] = 5})

        const modifiedCsv = rows.map(row => row.join(",")).join("\n");
  
        const blob = new Blob([modifiedCsv], {type: "text/csv"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "modified.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      reader.readAsText(file);
    }
  };

  const handleChange = (e) => {
    const csvFile = e.target.files[0]
    setFile(csvFile)

    const reader = new FileReader();
  
    reader.onload = (evt) => {
      const csvData = evt.target.result;
      const rows = csvData.split("\n").map(row => row.split(","));
      const headers = rows[0]
      setOptions(headers)
    };

    reader.readAsText(csvFile);
  }

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  }

  return (
     (
      <div className="upload-body">
        <div className="card upload-section ">
          <div className="card-header header bg-blue-grey">
            <h2>Sube las calificaciones</h2>
          </div>
          <div className="card-body upload-inner-body">
            <h4>Selecciona un archivo:</h4>
            <div className="input-group">
              <div>
                <input type="file" className="form-control" aria-describedby="inputGroupFileAddon01" onChange={handleChange} id="myfile" name="myfile" />
                <label className="form-label" htmlFor="myfile">
                  {file.name}
                </label>
              </div>
            </div>

            <div className="upload-message-section">
              <select className='form-select' name="headers" value={selectedOption} onChange={handleOptionChange}>
                <option hidden>Selecciona una opción</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {file !== '' && (
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

export default Notas;
