import { useState } from 'react';
import { Users } from '../services/API';
import useFetch from './useFetch';

const useAuth = () => {
  const [user, setUser] = useState({ username: '', role: '', id: '' });
  const isLogged = user.id !== '';

  const {isLoading} = useFetch(Users.me, {
    skip: !localStorage.getItem('token') || isLogged,
    onSuccess: ({ email, role, id }) => {
      setUser({ username: email, role, id });
    },
    onError: ({ response }) => {
      if (response.data?.detail) {
        console.error(response.data?.detail);
        localStorage.clear(); // TODO Seria correcto borrar localstorage?
      }
    },
  });

  const login = async (username, password) => {
    try {
      const { data } = await Users.login({ email: username, password });
      localStorage.setItem('token', `Token ${data.auth_token}`);
      const { data: userData } = await Users.me();

      setUser({ username: userData.email, role: userData.role, id: userData.id });
    } catch ({ response }) {
      if (response.data?.non_field_errors[0]) console.error(response.data?.non_field_errors[0]);
      if (response.data?.detail) {
        console.error(response.data?.detail);
        localStorage.clear(); // TODO Seria correcto borrar localstorage?
      }
    }
  };

  const logout = () => {
    Users.logout()
      .then(() => {
        localStorage.clear();
        setUser({ username: '', role: '', id: '' });
      })
      .catch(({ response }) => {
        console.error(response.data.detail);
      });
  };

  return {
    user,
    isLogged,
    isLoading,
    login,
    logout,
  };
};

export default useAuth;
