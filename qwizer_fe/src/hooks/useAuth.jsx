import { useState } from 'react';
import { Users } from '../services/API';
import useFetch from './useFetch';
 
const useAuth = () => {
  const [user, setUser] = useState({ username: '', role: '', id: '' });
  const isLogged = user.id !== '';
  const changeUser = (newUser) => {
    const { username, role, id } = newUser;
    setUser({ username, role, id });
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const { isLoading } = useFetch(Users.me, {
    skip: !localStorage.getItem('token') || isLogged || !navigator.onLine,
    onSuccess: ({ email, role, id }) => {
      changeUser({ username: email, role, id });
    },
    onError: ({ response }) => {
      if (response.data?.detail) {
        console.error(response.data?.detail);
        localStorage.clear(); // TODO Seria correcto borrar localstorage?
      }
    },
  });

  const login = async (username, password, setError) => {
    try {
      const { data } = await Users.login({ email: username, password });
      localStorage.setItem('token', `Token ${data.auth_token}`);
      const { data: userData } = await Users.me();

      changeUser({ username: userData.email, role: userData.role, id: userData.id });
    } catch ({ response }) {
      let error;
      if (response.data?.non_field_errors[0]) error = response.data?.non_field_errors[0];
      if (response.data?.detail) {
        error = response.data?.detail;
        localStorage.clear(); // TODO Seria correcto borrar localstorage?
      }
      console.error(error);
      if (error) setError('El nombre de usuario o contraseña es incorrecto.');
    }
  };
  
  const logout = () => {
    Users.logout()
      .then(() => {
        localStorage.clear();
        changeUser({ username: '', role: '', id: '' });
      })
      .catch(({ response }) => {
        console.error(response.data.detail);
      });
  };

  // TODO ahora no se deja cerrar sesión a usuario offline, ¿a donde se le mandaría?
  if (!navigator.onLine) {
    const localUser = JSON.parse(localStorage.getItem('user'));
    return {
      user: { username: localUser?.username || '', role: localUser?.role || '', id: localUser?.id || '' },
      isLogged: localUser && localUser?.id !== '',
      isLoading,
    };
  }

  return {
    user,
    isLogged,
    isLoading,
    login,
    logout,
  };
};

export default useAuth;
