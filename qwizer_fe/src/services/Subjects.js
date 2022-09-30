
import client from '../client';


const Subjects = {
  getFromStudentOrTeacher: () => client.get('get-subjects'), //Asignaturas en la que esta matriculado el estudiante o las que imparte el profe
  getTests: (idAsignatura) => client.post('get-quizzes',{idAsignatura}),
  getAll: () => client.post('get-all-subjects'),
  getQuestions: (idAsignatura) => client.post('get-subject-questions',{idAsignatura}),
  enrollStudents: (alumnos,asignatura) => client.post('enroll-students',{alumnos,asignatura}),
  get: (idAsignatura) => client.post('get-subject-info',{idAsignatura})
}

export default Subjects;