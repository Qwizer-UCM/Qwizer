/* eslint-disable import/prefer-default-export */

export const PATH_CUESTIONARIO = (id) => `/cuestionarios/${id}`;
export const PATH_TEST = (id) => `/test/${id}`;
export const PATH_REVISION = (id) => `/revision/${id}`;
export const PATH_REVISION_NOTAS_CUESTIONARIO = (id) => `/revisionNotas/${id}`;
export const PATH_REVISION_NOTAS_ALUMNO = (id, idAlumno) => `/revisionNotas/${id}/${idAlumno}`;
export const PATH_QR = (test, hash) => `/scanner/${test}/${hash}`;
export const PATH_QR_INSERT = (userId,test, hash) => `/insercion-manual/${userId}/${test}/${hash}`;

export const MARKDOWN_TEST = '/md';
export const INICIO = '/';
export const CUESTIONARIO = '/cuestionarios/:id';
export const OFFLINE = '/offline';
export const TEST =  '/test/:id';
export const REVISION = '/revision/:id';
export const BANCO_PREGUNTAS = 'banco-preguntas';
export const SUBIR_CUESTIONARIO = 'upload-questionary';
export const SUBIR_PREGUNTAS = 'upload-questions';
export const CREAR_CUESTIONARIO = 'crear-cuestionario';
export const REVISION_NOTAS_CUESTIONARIO = '/revisionNotas/:id';
export const REVISION_NOTAS_ALUMNO = '/revisionNotas/:id/:idAlumno';
export const REGISTRO = 'register';
export const QR = '/scanner/:test/:hash';
export const QR_INSERT = '/insercion-manual/:userId/:test/:hash';
export const LOGIN = '/login';
export const NOT_FOUND = '/404';
export const NOTAS = 'notas';
export const PANEL = "/panel/*";
export const PANEL_LINK = "/panel/"
