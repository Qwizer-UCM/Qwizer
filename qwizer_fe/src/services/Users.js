import client from '../client';

const Users = {
  //TODO revisar funcion de abajo; y comprobar si pasa algo por mandar auth undefined 
  login: (email, password) => client.post('login',{email, password}),
  logout: () => client.get('logout'),
  getStudents: () => client.post('get-students'),
}

export default Users;