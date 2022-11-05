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
        <div className="form-inputs">
          <h2 className="title">Qwizer</h2>

          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <span className="material-icons align-middle">error</span>
              <span className="ps-1">{error}</span>
            </div>
          )}

          <div>
            <h5>Nombre de usuario</h5>
            <input className="form-control" id="username" placeholder="Nombre de usuario" onChange={(e) => setUser({ ...currentUser, user: e.target.value })} />
          </div>
          <div className="mt-4">
            <h5>Contraseña</h5>
            <input type="password" className="form-control" id="password" placeholder="Contraseña" onChange={(e) => setUser({ ...currentUser, pass: e.target.value })} />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary login-button" type="submit" onClick={() => login(currentUser.user, currentUser.pass, handleLogin)}>
            Login
          </button>
          <a href='""'>¿Has olvidado la contraseña?</a>
        </div>
      </form>
    </div>
  );
};

export default LoginComponent;
