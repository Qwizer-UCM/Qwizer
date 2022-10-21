import { useEffect, useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import ErrorModal from './common/modals/ErrorModal';
import SuccessModal from './common/modals/SuccessModal';
import Users from '../services/Users';
import Subjects from '../services/Subjects';

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
  const [asignaturas, setAsignaturas] = useState([]);
  const [data, setData] = useState(undefined);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState(undefined);
  const [message, setMessage] = useState(undefined);
  const selectedSubject = useRef();

  useEffect(() => {
    getAsignaturas();
    getAlumnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAsignaturas = () => {
    Subjects.getFromStudentOrTeacher().then(({ data:res }) => {
      setAsignaturas(res.asignaturas);
    });
  };

  const getAlumnos = () => {
    Users.getStudents().then(({ data:res }) => {
      setData(res.alumnos.map((a) => ({ id: a.id, nombre: a.nombre, apellidos: a.apellidos })));
    });
  };

  const registrarAlumnos = () => {
    const asignatura = selectedSubject.current.options[selectedSubject.current.selectedIndex].value;

    if (asignatura === 'Selecciona una asignatura' || alumnosSeleccionados === undefined || alumnosSeleccionados.length === 0) {
      setMessage('Selecciona una asignatura y al menos un alumno');
      window.$('#inserted_error').modal('show');
    } else {
      Subjects.enrollStudents(alumnosSeleccionados, asignatura)
        .then(({ data:res }) => {
          if (data.insertados) {
            setMessage('Los alumnos han sido matriculados correctamente.');
            window.$('#inserted_success').modal('show');
          } else {
            let errormsg = 'Los siguientes alumnos no se han podido matricular: \n'; // TODO cambiar el mensaje de los errores

            res.errors.forEach((error) => {
              errormsg += `${error}\n`;
            });
            setMessage(errormsg);
            window.$('#inserted_error').modal('show');
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleChange = ({ selectedRows }) => {
    setAlumnosSeleccionados(selectedRows);
  };

  if (!data) return null;

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
            {asignaturas.map((asignatura) => (
              <option key={asignatura.id} value={asignatura.id}>
                {asignatura.nombre}
              </option>
            ))}
          </select>
          <br />
          <DataTable pointerOnHover
            selectableRows
            pagination
            theme="default"
            title="Alumnos matriculados en el centro"
            columns={columns}
            data={data}
            onSelectedRowsChange={handleChange}
          />
          <div className="d-flex justify-content-center">
            <button type="button" className="btn btn-primary" onClick={registrarAlumnos}>
              Registrar alumnos
            </button>
          </div>
        </div>
      </div>
      <ErrorModal id="inserted_error" message={message} />
      <SuccessModal id="inserted_success" message={message} />
    </div>
  );
};

export default RegisterContainer;
