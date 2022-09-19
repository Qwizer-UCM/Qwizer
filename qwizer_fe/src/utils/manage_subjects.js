
import { API_URL } from '../constants/Constants';

export const getSubjects = () => {//Asignaturas en la que esta matriculado el estudiante o las que imparte el profe
    
    var url = `${API_URL}/get-subjects`;
    var token = localStorage.getItem('token');
    return fetch(url , {
      method: 'GET',
      headers:{
        'Authorization': token
      }
      })
      .then(data => data.json())

}


export const  getSubjectTests = (idAsignatura) => {

    var url = `${API_URL}/get-quizzes`;
    var token = localStorage.getItem('token');
    const message = new Map([["idAsignatura", idAsignatura]]);
    const obj = JSON.stringify(Object.fromEntries(message));
  
    return fetch(url , {
      method: 'POST',
      headers:{
        'Content-type': 'application/json',
        'Authorization': token
      },
      body: obj
      })
      .then(data => data.json())
}

export const getAllSubjects = () => {//Asignaturas en la que esta matriculado el estudiante
    
  var url = `${API_URL}/get-all-subjects`;
  var token = localStorage.getItem('token');
  return fetch(url , {
    method: 'POST',
    headers:{
      'Authorization': token
    }
    })
    .then(data => data.json())

}

export const getSubjectQuestions = (idAsignatura) => {

  var url = `${API_URL}/get-subject-questions`;
  var token = localStorage.getItem('token');
  const message = new Map([["idAsignatura", idAsignatura]]);
  const obj = JSON.stringify(Object.fromEntries(message));

  return fetch(url , {
    method: 'POST',
    headers:{
      'Content-type': 'application/json',
      'Authorization': token
    },
    body: obj
    })
    .then(data => data.json())

}