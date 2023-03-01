import { useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import Modal from './common/modals/Modal';
import { Users, Subjects } from '../services/API';
import useFetch from '../hooks/useFetch';
import RegisterModal from './common/modals/RegistroModal';

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

  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });
  const [registerModal,setRegisterModal] = useState({ show: false });
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const [toggledClearRows, setToggleClearRows] = useState(false);
  const [data, setData] = useState([])
  const selectedSubject = useRef();


  const borrarAlumnos = () => {
    const asignatura = selectedSubject.current.options[selectedSubject.current.selectedIndex].value;

    if (asignatura === 'Selecciona una asignatura' || alumnosSeleccionados === undefined || alumnosSeleccionados.length === 0) {
      setErrorModal({ show: true, message: 'Selecciona una asignatura y al menos un alumno' })
    } else {
      Subjects.deleteStudentsFromSubject({ alumnos: alumnosSeleccionados, asignatura })
        .then(({ data: res }) => {
          if (res.borrados) {
            setSuccessModal({ show: true, message: 'Los alumnos han sido borrados correctamente.' })
            getAlumnosAsignaturas(asignatura)
            setToggleClearRows(!toggledClearRows);
          } else {
            let errormsg = 'Los siguientes alumnos no se han podido eliminar de la asignatura: \n'; // TODO cambiar el mensaje de los errores

            res.errors.forEach((error) => {
              errormsg += `${error}\n`;
            });
            setErrorModal({ show: true, message: errormsg })
          }
        })
        .catch((error) => console.log(error));
    }
  };


  const handleChange = ({ selectedRows}) => {
    setAlumnosSeleccionados(selectedRows);
  };

  const getAlumnosAsignaturas = (idAsignatura) => {
    Users.getStudentsFromSubject({ idAsignatura }).then(({ data:res }) => {
      setData(res.alumnos);
    });
  };

  const handleSelectedAsignatura = () => {
    getAlumnosAsignaturas(selectedSubject.current.options[selectedSubject.current.selectedIndex].value);
  }

  return (
    <div className="index-body">
      <div className="card tabla-notas">
        <div className="card-content">
          <h4 className="d-flex justify-content-center">Registro de alumnos en asignaturas</h4>
          <label>Selecciona la asignatura de la que quiera ver los alumnos</label>
          <select className="form-select" id="subject-selector" aria-label="Default select example" ref={selectedSubject} onChange={handleSelectedAsignatura}>
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
          <DataTable pointerOnHover selectableRows pagination theme="default" title="Alumnos matriculados en la asignatura" columns={columns}
            data={data?.map((a) => ({
              id: a.id,
              nombre: a.nombre,
              apellidos: a.apellidos
            }))}
            onSelectedRowsChange={handleChange}
            clearSelectedRows={toggledClearRows}

            />
          <div className="d-flex justify-content-center">
            <button type="button" className="btn btn-primary" onClick={() => {setRegisterModal({show: true})}}>
              Registrar alumnos
            </button>
            { alumnosSeleccionados.length !== 0 && 
            <button type="button" id='deleteButton' className="ms-1 btn btn-danger" onClick={borrarAlumnos}>
              Borrar alumnos
            </button>}
          </div>
        </div>
      </div>
      
      <Modal options={errorModal} onHide={setErrorModal} type='danger' />
      <Modal options={successModal} onHide={setSuccessModal} type='success' />
      <RegisterModal registerStudents={getAlumnosAsignaturas} options={registerModal} onHide={setRegisterModal} />
    </div>
  );
};

export default RegisterContainer;
