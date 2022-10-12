import client from '../client';

const Users = {
  me: () => client.get('auth/user/me'),
  login: (email, password) => client.post('auth/token/login',{email, password}),
  logout: () => client.post('auth/token/logout'),
  getStudents: () => client.post('get-students'),
}

export default Users;