import client from '../client';


const Questions = {
    delete: (idPregunta) => client.post('delete-question',{idPregunta}),
    update: (question) => client.post('update-question',{"preguntaActualizada":question}),
    upload: (fichero,idAsignatura) => client.post('upload-questions',{fichero,idAsignatura})
}

export default Questions;