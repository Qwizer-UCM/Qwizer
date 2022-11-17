import { useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import Modal from './common/modals/Modal';
import { Users, Subjects } from '../services/API';
import useFetch from '../hooks/useFetch';

const columns = [
  {
    name: 'Id',
    selector: (row) => row.id,
    sortable: true,
    omit: true,
  },
  {
    name: 'Nombre',
    selector: (row) => row.nombre,
    sortable: true,
  },
  {
    name: 'Apellidos',
    selector: (row) => row.apellidos,
    sortable: true,
  },
];

const RegisterContainer = () => {
  const { data: asignaturas } = useFetch(Subjects.getFromStudentOrTeacher, { transform: (res) => res.asignaturas });
  const { data } = useFetch(Users.getStudents, { transform: (res) => res.alumnos.map((a) => ({ id: a.id, nombre: a.nombre, apellidos: a.apellidos })) });

  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const selectedSubject = useRef();

  const registrarAlumnos = () => {
    const asignatura = selectedSubject.current.options[selectedSubject.current.selectedIndex].value;

    if (asignatura === 'Selecciona una asignatura' || alumnosSeleccionados === undefined || alumnosSeleccionados.length === 0) {
      setErrorModal({show:true,message:'Selecciona una asignatura y al menos un alumno'})
    } else {
      Subjects.enrollStudents({ alumnos: alumnosSeleccionados, asignatura })
        .then(({ data: res }) => {
          if (res.insertados) {
            setSuccessModal({show:true,message:'Los alumnos han sido matriculados correctamente.'})
          } else {
            let errormsg = 'Los siguientes alumnos no se han podido matricular: \n'; // TODO cambiar el mensaje de los errores

            res.errors.forEach((error) => {
              errormsg += `${error}\n`;
            });
            setErrorModal({show:true,message:errormsg})
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleChange = ({ selectedRows }) => {
    setAlumnosSeleccionados(selectedRows);
  };

  return (
    <div className="index-body">
      <div className="card tabla-notas">
        <div className="card-content">
          <h4 className="d-flex justify-content-center">Registro de alumnos en asignaturas</h4>
          <label>Selecciona la asignatura a la que quieras añadir a los alumnos</label>
          <select className="form-select" id="subject-selector" aria-label="Default select example" ref={selectedSubject}>
            <option hidden defaultValue>
              Selecciona una asignatura
            </option>
            {asignaturas?.map((asignatura) => (
              <option key={asignatura.id} value={asignatura.id}>
                {asignatura.nombre}
              </option>
            ))}
          </select>
          <br />
          <DataTable pointerOnHover selectableRows pagination theme="default" title="Alumnos matriculados en el centro" columns={columns} data={data} onSelectedRowsChange={handleChange} />
          <div className="d-flex justify-content-center">
            <button type="button" className="btn btn-primary" onClick={registrarAlumnos}>
              Registrar alumnos
            </button>
          </div>
        </div>
      </div>
      <Modal options={errorModal} onHide={setErrorModal} type='danger'/>
      <Modal options={successModal} onHide={setSuccessModal} type='success'/>
    </div>
  );
};

export default RegisterContainer;
