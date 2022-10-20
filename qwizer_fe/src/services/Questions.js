import client from '../client';


const Questions = {
    delete: (idPregunta) => client.post('delete-question',{idPregunta}),
    update: (question) => client.post('update-question',{"preguntaActualizada":question}),
    upload: (ficheroYAML,idAsignatura) => client.post('upload-questions',{fichero_yaml:ficheroYAML,idAsignatura})
}

export default Questions;