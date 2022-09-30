import client from '../client';


const Otro = {
    insertQR: (idUsuario,idCuestionario,hash) => client.post('insert-qr',{idUsuario,idCuestionario,hash}),
    getHashes: (idCuestionario,idUsuario) => client.post('get-hashes',{idCuestionario,idUsuario}),
}

export default Otro;