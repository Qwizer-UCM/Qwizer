import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Subjects, Tests } from '../services/API';
import Modal from './common/modals/Modal';

const UploadNotas = () => {
  const { data, isLoading } = useFetch(Subjects.getFromStudentOrTeacher);
  const [selectedOption, setSelectedOption] = useState('-1');
  const [selectedSubject, setSelectedSubject] = useState('-1');
  const [selectedTest, setSelectedTest] = useState('-1');

  const [optionsCSVHeaders, setOptionsCSVHeaders] = useState([]);
  const [optionsTests, setOptionsTests] = useState([]);
  const [file, setFile] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  const uploadFile = () => {
    if (file.name !== '') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const csvData = evt.target.result;
        const rows = csvData.split('\n').map((row) => row.split(','));
        const selectedIdx = rows[0].indexOf(selectedOption);
        const emailColumn = rows[0].indexOf("Direccion de correo");
        if (emailColumn !== -1 && selectedIdx !== -1 && selectedTest !== "-1") {
          Tests.getQuizGrades({idCuestionario: selectedTest}).then(({data:res}) => {
            rows.forEach((row, idx) => {
              if (idx !== 0) {
                row[selectedIdx] = res.notas[row[emailColumn]]?.nota || ''
              }
            });
            const modifiedCsv = rows.map((row) => row.join(',')).join('\n');

            const blob = new Blob([modifiedCsv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'modified.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          })
        }
      };

      reader.readAsText(file);
    }
  };

  const handleChange = (e) => {
    const csvFile = e.target.files[0];
    setFile(csvFile);

    const reader = new FileReader();

    reader.onload = (evt) => {
      const csvData = evt.target.result;
      const rows = csvData.split('\n').map((row) => row.split(','));
      const headers = rows[0];
      setOptionsCSVHeaders(headers);
    };

    reader.readAsText(csvFile);
  };

  useEffect(() => {
    console.log(selectedSubject);
    if (selectedSubject !== "-1") {
      Subjects.getTests({ idAsignatura: selectedSubject }).then(({ data: res }) => {
        setOptionsTests(res.cuestionarios);
      });
    }
  }, [selectedSubject]);


  if (isLoading) {
    return null;
  }

  return (
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
          {file !== '' && (
            <div className="upload-message-section mt-0">
              <select className="form-select" name="headers" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                <option value={-1}>Selecciona la columna de las notas</option>
                {optionsCSVHeaders.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select className="form-select" name="subjects" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value={-1}>Selecciona una asignatura</option>
                {data.asignaturas.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nombre}
                  </option>
                ))}
              </select>
              {selectedSubject !== '-1' && (
                <select className="form-select" name="tests" value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)}>
                  <option value={-1}>Selecciona un cuestionario</option>
                  {optionsTests.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.titulo}
                    </option>
                  ))}
                  )
                </select>
              )}
              <div className="d-flex flex-column px-5 justify-content-center">
                <button type="button" className="btn btn-success btn-submit" onClick={uploadFile} disabled={file === '' || selectedOption === "-1" || selectedSubject === "-1" || selectedTest === "-1"}>
                  Subir Preguntas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal options={errorModal} onHide={setErrorModal} type="danger" />
      <Modal options={successModal} onHide={setSuccessModal} type="success" />
    </div>
  );
};

export default UploadNotas;
