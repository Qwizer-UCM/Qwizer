import { useEffect, useMemo, useState } from 'react';
import Users from '../services/Users';


const useAuth = () => {
  const [user, setUser] = useState({ username: '', role: '', id: '' });
  const [isLogged, setIsLogged] = useState();
 
  useEffect(() => {
    if (localStorage.getItem('token')) {
      Users.me()
        .then(({ data }) => {
          setIsLogged(true);
          setUser({ username: data.email, role: data.role, id: data.id });
        })
        .catch(({ response }) => {
          if (response.data?.detail) {
            console.error(response.data?.detail);
            localStorage.clear(); // TODO Seria correcto borrar localstorage?
          }
          setIsLogged(false);
        });
    } else {
      setIsLogged(false);
    }
  }, []); // TODO cada vez que cambie de ruta comprobar token?

  const login = async (username, password) => {
    try {
      const { data } = await Users.login(username, password);
      localStorage.setItem('token', `Token ${data.auth_token}`);
      const { data: userData } = await Users.me();

      setIsLogged(true);
      setUser({ username: userData.email, role: userData.role, id: userData.id });
    } catch ({ response }) {
      if (response.data?.non_field_errors[0]) console.error(response.data?.non_field_errors[0]);
      if (response.data?.detail) {
        console.error(response.data?.detail);
        localStorage.clear(); // TODO Seria correcto borrar localstorage?
      }
      setIsLogged(false);
    }
  };

  const logout = () => {
    Users.logout()
      .then(() => {
        localStorage.clear();
        setIsLogged(false);
        setUser({ username: '', role: '', id: '' });
      })
      .catch(({ response }) => {
        setIsLogged(false);
        console.error(response.data.detail);
      });
  };

  const state = {
      user,
      isLogged,
      login,
      logout,
    };


  return state;
};

export default useAuth;