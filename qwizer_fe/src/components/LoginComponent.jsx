import { useState } from 'react';

const LoginComponent = ({ login }) => {
  const [currentUser, setUser] = useState({ user: '', pass: '' });


  return (
    <div className="main-container login-body">
      <form className='login' onSubmit={(e) => e.preventDefault()}>
        <div className="form-inputs">
          <h2 className="title">Qwizer</h2>
          <p />
          <br />
          <h5>Nombre de usuario</h5>
          <input className="form-control" id="username" placeholder="Nombre de usuario" onChange={(e) => setUser({ ...currentUser, user: e.target.value })} />
          <p />
          <h5>Contraseña</h5>
          <input type="password" className="form-control" id="password" placeholder="Contraseña" onChange={(e) => setUser({ ...currentUser, pass: e.target.value })} />
        </div>
        <p />
        <div className="buttons">
          <button className="btn btn-primary login-button" type="submit" onClick={() => login(currentUser.user, currentUser.pass)}>
            Login
          </button>
          <p />
          <a href='""'>¿Has olvidado la contraseña?</a>
        </div>
      </form>
    </div>
  );
};

export default LoginComponent;
