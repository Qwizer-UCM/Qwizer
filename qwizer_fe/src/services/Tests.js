import client from '../client';

const Tests = {
  // TODO revisar funcion abajo
  sendTest: (respuestas,hash) => client.post('response',{respuestas,hash}),
  getCorrectedTest: (idCuestionario,idAlumno) => client.post('test-corrected',{idCuestionario,idAlumno}),
  createQuiz: (cuestionario) => client.post('create-quiz',{cuestionario}),
  getQuizGrades: (idCuestionario) => client.post('get-quiz-grades',{idCuestionario}),
  // TODO diferencia entre test y get-quiz-info?? TarjetaCuestionario.js
  get: (idCuestionario) => client.post('test',{idCuestionario}),
  getInfo: (idCuestionario) => client.post('get-quiz-info',{idCuestionario}),
  upload: (ficheroYAML) => client.post('upload',{fichero_yaml: ficheroYAML})
}

export default Tests;