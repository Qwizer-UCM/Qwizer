/* eslint-disable no-unused-vars */
import client from '../client';

// DOCS https://axios-http.com/docs/api_intro#request-method-aliases
// axios.get(url[, config])
// axios.post(url[, data[, config]])

export const Otro = {
  insertQR: ({ idUsuario, idCuestionario, hash }, config = {}) => client.post('insert-qr', { idUsuario, idCuestionario, hash }, config),
  getHashes: ({ idCuestionario, idUsuario }, config = {}) => client.post('get-hashes', { idCuestionario, idUsuario }, config),
};

export const Questions = {
  delete: ({ idPregunta }, config = {}) => client.post('delete-question', { idPregunta }, config),
  update: ({ question }, config = {}) => client.post('update-question', { preguntaActualizada: question }, config),
  upload: ({ ficheroYAML, idAsignatura }, config = {}) => client.post('upload-questions', { fichero_yaml: ficheroYAML, idAsignatura }, config),
};

export const Subjects = {
  getFromStudentOrTeacher: (_data = {}, config = {}) => client.get('asignaturas', config), // Asignaturas en la que esta matriculado el estudiante o las que imparte el profe
  getTests: ({ idAsignatura }, config = {}) => client.get(`asignaturas/${idAsignatura}/cuestionarios`, config), // Todos los cuestionarios de una asignatura
  getAll: (_data = {}, config = {}) => client.get('get-all-subjects', _data, config),  // Todas las asignaturas del centro
  getQuestions: ({ idAsignatura }, config = {}) => client.get(`asignaturas/${idAsignatura}/preguntas`, config), // Todas las preguntas de una asignatura
  enrollStudents: ({ alumnos, asignatura }, config = {}) => client.post('enroll-students', { alumnos, asignatura }, config), // Inserción de alumnos en una asignatura
};

export const Tests = {
  sendTest: ({ respuestas, hash, idCuestionario }, config = {}) => client.post('cuestionarios/enviar', { respuestas, hash, idCuestionario }, config), // Envio de cuestionario por parte de un usuario
  getCorrectedTest: ({ idCuestionario, idAlumno }, config = {}) => client.get(`cuestionarios/${idCuestionario}/nota/${idAlumno}`, config), // Test corregido de un alumno
  createQuiz: ({ cuestionario }, config = {}) => client.post('cuestionarios/crear', { cuestionario }, config), // Creación de cuestionario
  getQuizGrades: ({ idCuestionario }, config = {}) => client.get(`cuestionarios/${idCuestionario}/notas`, config), // Todas las notas de un cuestionario
  get: ({ idCuestionario }, config = {}) => client.get(`cuestionarios/${idCuestionario}`, config), // Test especifico para la descarga del usuario
  getInfo: ({ idCuestionario }, config = {}) => client.get(`cuestionarios/${idCuestionario}/info`, config), // Información general de un cuestionario especifico
  upload: ({ ficheroYAML }, config = {}) => client.post('cuestionarios/subir', { fichero_yaml: ficheroYAML }, config), // Subir un cuestionario hecho
};

export const Users = {
  me: (_data = {}, config = {}) => client.get('auth/user/me', config),
  login: ({ email, password }, config = {}) => client.post('auth/token/login', { email, password }, config),
  logout: (_data = {}, config = {}) => client.post('auth/token/logout', _data, config),
  getStudents: (_data = {}, config = {}) => client.get('estudiantes', config),
};
