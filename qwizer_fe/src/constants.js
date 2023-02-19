/* eslint-disable import/prefer-default-export */
const path = {
  PATH_CUESTIONARIO: (id) => `/cuestionarios/${id}`,
  PATH_TEST: (id) => `/test/${id}`,
  PATH_REVISION: (id) => `/revision/${id}`,
  PATH_REVISION_NOTAS_CUESTIONARIO: (id) => `/revisionNotas/${id}`,
  PATH_REVISION_NOTAS_ALUMNO: (id, idAlumno) => `/revisionNotas/${id}/${idAlumno}`,
  PATH_QR: (test, hash, resp) => `/scanner/:${test}/:${hash}/:${resp}`,
  PATH_QR_INSERT: (userId,test, hash, resp) => `/insercion-manual/:${userId}/:${test}/:${hash}/:${resp}`,
};

export const routes = {
  ...path,
  INICIO: '/',
  CUESTIONARIO: path.PATH_CUESTIONARIO(':id'),
  OFFLINE: '/offline',
  TEST: path.PATH_TEST(':id'),
  REVISION: path.PATH_REVISION(':id'),
  BANCO_PREGUNTAS: '/banco-preguntas',
  SUBIR_CUESTIONARIO: '/upload-questionary',
  SUBIR_PREGUNTAS: '/upload-questions',
  CREAR_CUESTIONARIO: '/crear-cuestionario',
  REVISION_NOTAS_CUESTIONARIO: path.PATH_REVISION_NOTAS_CUESTIONARIO(':id'),
  REVISION_NOTAS_ALUMNO: path.PATH_REVISION_NOTAS_ALUMNO(':id', ':idAlumno'),
  REGISTRO: '/register',
  QR: path.PATH_QR(':test', ':hash', ':resp'),
  QR_INSERT: path.PATH_QR_INSERT(':userId',':test', ':hash', ':resp'),
  LOGIN: '/login',
  NOT_FOUND: '/404',
  NOTAS: '/notas',
};
