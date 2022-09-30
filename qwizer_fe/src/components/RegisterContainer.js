import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import ErrorModal from "./common/modals/ErrorModal";
import SuccessModal from "./common/modals/SuccessModal";
import Users from "../services/Users";
import Subjects from "../services/Subjects";

const RegisterContainer = (props) => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [columns, setColumns] = useState(undefined);
  const [data, setData] = useState(undefined);
  const [title, setTitle] = useState(undefined);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState(undefined);
  const [message, setMessage] = useState(undefined);

  useEffect(() => {
    getAsignaturas();
    getAlumnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    generar_tabla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumnos]);

  useEffect(() => {
    asignaturas.forEach((asignatura, indx) => {
      window.$("#subject-selector").append(new Option(asignatura.nombre, asignatura.id));
    });
  }, [asignaturas]);

  const getAsignaturas = () => {
    Subjects.getFromStudentOrTeacher().then(({ data }) => {
      setAsignaturas(data.asignaturas);
    });
  };

  const getAlumnos = () => {
    Users.getStudents().then(({ data }) => {
      setAlumnos(data.alumnos);
    });
  };

  const generar_tabla = () => {
    let columns = [
      {
        name: "Id",
        selector: (row) => row.id,
        sortable: true,
        omit: true,
      },
      {
        name: "Nombre",
        selector: (row) => row.nombre,
        sortable: true,
      },
      {
        name: "Apellidos",
        selector: (row) => row.apellidos,
        sortable: true,
      },
    ];
    let data = [];
    alumnos.forEach((alumno, indx) => {
      let row = {
        id: alumno.id,
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
      };
      data.push(row);
    });

    setColumns(columns);
    setData(data);
    setTitle("Alumnos matriculados en el centro");
  };

  const registrarAlumnos = () => {
    let alumnos = alumnosSeleccionados;

    let asignatura = window.$("#subject-selector").val();

    if (asignatura === "Selecciona una asignatura" || alumnos === undefined || alumnos.length === 0) {
      setMessage("Selecciona una asignatura y al menos un alumno");
      window.$("#inserted_error").modal("show");
    } else {
      Subjects.enrollStudents(alumnos, asignatura)
        .then(({ data }) => {
          if (data.insertados) {
            setMessage("Los alumnos han sido matriculados correctamente.");
            window.$("#inserted_success").modal("show");
          } else {
            let errormsg = "Los siguientes alumnos no se han podido matricular: \n"; //TODO cambiar el mensaje de los errores

            data.errors.forEach(function (error, indx) {
              errormsg += error + "\n";
            });
            setMessage(errormsg);
            window.$("#inserted_error").modal("show");
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
          <select className="form-select" id="subject-selector" aria-label="Default select example">
            <option hidden defaultValue>
              Selecciona una asignatura
            </option>
          </select>
          <br />
          <DataTable pointerOnHover selectableRows pagination theme={"default"} title={title} columns={columns} data={data} onSelectedRowsChange={handleChange}></DataTable>
          <div className="d-flex justify-content-center">
            <button className="btn btn-primary" onClick={registrarAlumnos}>
              Registrar alumnos
            </button>
          </div>
        </div>
      </div>
      <ErrorModal id={"inserted_error"} message={message}></ErrorModal>
      <SuccessModal id={"inserted_success"} message={message}></SuccessModal>
    </div>
  );
};

export default RegisterContainer;
