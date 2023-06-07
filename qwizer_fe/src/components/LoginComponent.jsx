import { useState } from 'react';

const LoginComponent = ({ login }) => {
  const [currentUser, setUser] = useState({ user: '', pass: '' });
  const [error, setError] = useState();

  const handleLogin = (err) => {
    setError(err);
  };

  return (
    <div className="main-container login-body">
      <form className="login" onSubmit={(e) => e.preventDefault()}>
          <h2 className="title text-center">Qwizer</h2>

          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <span className="material-icons align-middle">error</span>
              <span className="ps-1">{error}</span>
            </div>
          )}

          <div>
            <input className="form-control" id="username" placeholder="Nombre de usuario" onChange={(e) => setUser({ ...currentUser, user: e.target.value })} />
          </div>
          <div className="mt-4">
            <input type="password" className="form-control" id="password" placeholder="Contraseña" onChange={(e) => setUser({ ...currentUser, pass: e.target.value })} />
          </div>
  
          <button className="btn btn-primary login-button rounded-2 mt-4" type="submit" onClick={() => login(currentUser.user, currentUser.pass, handleLogin)}>
            Login
          </button>



      </form>
    </div>
  );
};

export default LoginComponent;
