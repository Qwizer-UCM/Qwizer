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
  getFromStudentOrTeacher: (_data = {}, config = {}) => client.get('get-subjects', config), // Asignaturas en la que esta matriculado el estudiante o las que imparte el profe
  getTests: ({ idAsignatura }, config = {}) => client.post('get-quizzes', { idAsignatura }, config),
  getAll: (_data = {}, config = {}) => client.post('get-all-subjects', _data, config),
  getQuestions: ({ idAsignatura }, config = {}) => client.post('get-subject-questions', { idAsignatura }, config),
  enrollStudents: ({ alumnos, asignatura }, config = {}) => client.post('enroll-students', { alumnos, asignatura }, config),
};

export const Tests = {
  // TODO revisar funcion abajo
  sendTest: ({ respuestas, hash }, config = {}) => client.post('response', { respuestas, hash }, config),
  getCorrectedTest: ({ idCuestionario, idAlumno }, config = {}) => client.post('test-corrected', { idCuestionario, idAlumno }, config),
  createQuiz: ({ cuestionario }, config = {}) => client.post('create-quiz', { cuestionario }, config),
  getQuizGrades: ({ idCuestionario }, config = {}) => client.post('get-quiz-grades', { idCuestionario }, config),
  // TODO diferencia entre test y get-quiz-info?? TarjetaCuestionario.js
  get: ({ idCuestionario }, config = {}) => client.post('test', { idCuestionario }, config),
  getInfo: ({ idCuestionario }, config = {}) => client.post('get-quiz-info', { idCuestionario }, config),
  upload: ({ ficheroYAML }, config = {}) => client.post('upload', { fichero_yaml: ficheroYAML }, config),
};

export const Users = {
  me: (_data = {}, config = {}) => client.get('auth/user/me', config),
  login: ({ email, password }, config = {}) => client.post('auth/token/login', { email, password }, config),
  logout: (_data = {}, config = {}) => client.post('auth/token/logout', _data, config),
  getStudents: (_data = {}, config = {}) => client.post('get-students', _data, config),
};
