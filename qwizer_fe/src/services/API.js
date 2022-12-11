/* eslint-disable no-unused-vars */
import client from '../client';

// DOCS https://axios-http.com/docs/api_intro#request-method-aliases
// axios.get(url[, config])
// axios.post(url[, data[, config]])

export const Otro = {
  insertQR: ({ idUsuario, idCuestionario, hash }, config = {}) => client.post('qr', { idUsuario, idCuestionario, hash }, config),
  getHashes: ({ idCuestionario, idUsuario }, config = {}) => client.get(`qr/${idUsuario}/${idCuestionario}`, config),
};

export const Questions = {
  upload: ({ ficheroYAML, idAsignatura }, config = {}) => client.post('question', { fichero_yaml: ficheroYAML, idAsignatura }, config),
  update: ({ question }, config = {}) => client.put(`question/${question.id}`, { preguntaActualizada: question }, config),
  delete: ({ idPregunta }, config = {}) => client.delete(`question/${idPregunta}`, { idPregunta }, config),
};

export const Subjects = {
  getAll: (_data = {}, config = {}) => client.get('subject', _data, config),  // Todas las asignaturas del centro
  getTests: ({ idAsignatura }, config = {}) => client.get(`subject/${idAsignatura}/cuestionarios`, config), // Todos los cuestionarios de una asignatura
  getQuestions: ({ idAsignatura }, config = {}) => client.get(`subject/${idAsignatura}/preguntas`, config), // Todas las preguntas de una asignatura
  getFromStudentOrTeacher: (_data = {}, config = {}) => client.get('subject/me', config), // Asignaturas en la que esta matriculado el estudiante o las que imparte el profe
  enrollStudents: ({ alumnos, asignatura }, config = {}) => client.post(`subject/${asignatura}/enroll`, { alumnos }, config), // Inserción de alumnos en una asignatura
  deleteStudentsFromSubject: ({ alumnos, asignatura }, config = {}) => client.post(`subject/${asignatura}/delete_enroll`, { alumnos }, config), // Borrar registro de alumnos en una asignatura
};

export const Tests = {
  get: ({ idCuestionario }, config = {}) => client.get(`test/${idCuestionario}`, config), // Test especifico para la descarga del usuario
  createQuiz: ({ cuestionario }, config = {}) => client.post('test', { cuestionario }, config), // Creación de cuestionario
  sendTest: ({ respuestas, hash, idCuestionario }, config = {}) => client.post(`test/${idCuestionario}/enviar`, { respuestas, hash }, config), // Envio de cuestionario por parte de un usuario
  getCorrectedTest: ({ idCuestionario, idAlumno }, config = {}) => client.get(`test/${idCuestionario}/nota/${idAlumno}`, config), // Test corregido de un alumno
  getQuizGrades: ({ idCuestionario }, config = {}) => client.get(`test/${idCuestionario}/notas`, config), // Todas las notas de un cuestionario
  getInfo: ({ idCuestionario }, config = {}) => client.get(`test/${idCuestionario}/info`, config), // Información general de un cuestionario especifico
  upload: ({ ficheroYAML }, config = {}) => client.post('test/subir', { fichero_yaml: ficheroYAML }, config), // Subir un cuestionario hecho
};

export const Users = {
  me: (_data = {}, config = {}) => client.get('auth/user/me', config),
  login: ({ email, password }, config = {}) => client.post('auth/token/login', { email, password }, config),
  logout: (_data = {}, config = {}) => client.post('auth/token/logout', _data, config),
  getStudents: (_data = {}, config = {}) => client.get('estudiantes', config),
  getStudentsFromSubject: ({idAsignatura}, config = {}) => client.get(`estudiantes/${idAsignatura}`, config),
  getStudentsForEnroll: ({idAsignatura}, config = {}) => client.get(`estudiantes/${idAsignatura}/disponibles`, config),
};
