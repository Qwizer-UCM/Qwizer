import { useState, useRef } from "react";
import DataTable from "react-data-table-component";
import useFetch from "../../../hooks/useFetch";
import { Subjects, Users } from "../../../services/API";
import Modal from "./Modal";

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

const RegisterModal = ({registerStudents,onHide, options }) => {

    const { data: asignaturas } = useFetch(Subjects.getFromStudentOrTeacher, { transform: (res) => res.asignaturas });

    const [errorModal, setErrorModal] = useState({ show: false, message: '' });
    const [successModal, setSuccessModal] = useState({ show: false, message: '' });
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
    const [data, setData] = useState([])
    const selectedSubject = useRef();

    const handleChange = ({ selectedRows }) => {
        setAlumnosSeleccionados(selectedRows);
    };

    const getAlumnosNoRegistradosAsignaturas = (idAsignatura) => {
        Users.getStudentsForEnroll({idAsignatura}).then(({ data: res }) => {
            setData(res.alumnos);
        });
    };

    const handleSelectedAsignatura = () => {
        getAlumnosNoRegistradosAsignaturas(selectedSubject.current.options[selectedSubject.current.selectedIndex].value);
    }

    const registrarAlumnos = () => {
        const asignatura = selectedSubject.current.options[selectedSubject.current.selectedIndex].value;

        if (asignatura === 'Selecciona una asignatura' || alumnosSeleccionados === undefined || alumnosSeleccionados.length === 0) {
            setErrorModal({ show: true, message: 'Selecciona una asignatura y al menos un alumno' })
        } else {
            Subjects.enrollStudents({ alumnos: alumnosSeleccionados, asignatura })
                .then(({ data: res }) => {
                    if (res.insertados) {
                        setSuccessModal({ show: true, message: 'Los alumnos han sido matriculados correctamente.' })
                        getAlumnosNoRegistradosAsignaturas(asignatura)
                        registerStudents(asignatura)

                    } else {
                        let errormsg = 'Los siguientes alumnos no se han podido matricular de la asignatura: \n'; // TODO cambiar el mensaje de los errores

                        res.errors.forEach((error) => {
                            errormsg += `${error}\n`;
                        });
                        setErrorModal({ show: true, message: errormsg })
                    }
                })
                .catch((error) => console.log(error));
        }
    };

    return (
        <Modal options={options} onHide={onHide} type='info'>

            <div className="card ">
                <div className="card-content">
                    <h4 className="d-flex justify-content-center">Registro de alumnos en asignaturas</h4>
                    <label>Selecciona la asignatura de la que quiera añadir los alumnos</label>
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
                    <h3>Alumnos para matricular en esta asignatura</h3>
                    <DataTable pointerOnHover selectableRows pagination theme="default" columns={columns}
                        data={data?.map((a) => ({
                            id: a.id,
                            nombre: a.nombre,
                            apellidos: a.apellidos
                        }))}
                        onSelectedRowsChange={handleChange} />
                    <div className="d-flex justify-content-center">
                        <button type="button" className="ms-1 btn btn-primary" onClick={registrarAlumnos} >
                            Registrar alumnos
                        </button>
                    </div>
                </div>

                <Modal options={successModal} onHide={setSuccessModal} type='success' />
                <Modal options={errorModal} onHide={setErrorModal} type='danger' />
            </div>
        </Modal>
    );

}

export default RegisterModal;